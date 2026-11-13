mod auth;
mod config;
mod db;
mod error;
mod models;
mod routes;
mod scheduler;

use std::net::SocketAddr;
use axum::{
    routing::{get, post, put},
    Router,
};
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::{
    config::Config,
    db::Db,
    models::SyncEvent,
    routes::{
        auth::{firebase_login, login, me, refresh, register},
        dashboard::get_dashboard_stats,
        tasks::{
            create_task, delete_task, invite_user, list_invites, list_tasks, register_device,
            respond_task, update_task,
        },
        whatsapp::{handle_webhook, verify_webhook},
        ws::ws_handler,
    },
    scheduler::start_reminder_scheduler,
};

#[derive(Clone)]
pub struct AppState {
    pub db: Db,
    pub config: Config,
    pub tx: broadcast::Sender<SyncEvent>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,daybit_backend=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env();
    eprintln!("Starting Daybit Backend on port {}", config.port);

    // Initialize database
    let db = Db::init(&config.database_url).await?;
    eprintln!("MongoDB initialized successfully");

    // WebSocket broadcast channel
    let (tx, _rx) = broadcast::channel::<SyncEvent>(200);

    let state = AppState {
        db,
        config: config.clone(),
        tx,
    };

    // Start background scheduler for reminders & WhatsApp
    let _scheduler = start_reminder_scheduler(state.clone()).await?;

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let routes = Router::new()
        // Auth
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/firebase", post(firebase_login))
        .route("/auth/refresh", post(refresh))
        .route("/auth/me", get(me))
        // Tasks
        .route("/tasks", get(list_tasks).post(create_task))
        .route("/tasks/:id", put(update_task).delete(delete_task))
        .route("/tasks/:id/respond", post(respond_task))
        .route("/tasks/:id/invite", post(invite_user))
        .route("/invites", get(list_invites))
        .route("/devices", post(register_device))
        // Dashboard
        .route("/dashboard", get(get_dashboard_stats))
        // WhatsApp webhook
        .route("/whatsapp/webhook", get(verify_webhook).post(handle_webhook))
        .route("/health", get(|| async { "OK" }));

    let app = Router::new()
        .merge(routes.clone())
        .nest("/api", routes)
        // Realtime sync
        .route("/ws", get(ws_handler))
        .route("/api/ws", get(ws_handler))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("Daybit server listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
