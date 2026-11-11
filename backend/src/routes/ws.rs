use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Query, State,
    },
    response::IntoResponse,
};
use futures_util::{SinkExt, StreamExt};
use serde::Deserialize;

use crate::{
    auth::verify_token,
    models::SyncEvent,
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct WsQuery {
    pub token: Option<String>,
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Query(query): Query<WsQuery>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let token = query.token.unwrap_or_default();
    let user_id = match verify_token(&token, &state.config.jwt_secret, "access") {
        Ok(claims) => claims.sub,
        Err(_) => {
            return axum::http::StatusCode::UNAUTHORIZED.into_response();
        }
    };

    ws.on_upgrade(move |socket| handle_socket(socket, state, user_id))
}

async fn handle_socket(socket: WebSocket, state: AppState, user_id: String) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.tx.subscribe();

    // Spawn a task to forward broadcast messages to this client
    let mut send_task = tokio::spawn(async move {
        while let Ok(event) = rx.recv().await {
            // Filter events: only send if it belongs to the user or is relevant to them
            let should_send = match &event {
                SyncEvent::TaskCreated(t) => t.user_id == user_id,
                SyncEvent::TaskUpdated(t) => t.user_id == user_id,
                SyncEvent::TaskDeleted { .. } => true, // clients can check if it exists locally
                SyncEvent::TaskReminder { task } => task.user_id == user_id,
                SyncEvent::InviteReceived(inv) => inv.to_user == user_id || inv.from_user == user_id,
                SyncEvent::InviteUpdated(inv) => inv.to_user == user_id || inv.from_user == user_id,
            };

            if should_send {
                if let Ok(msg_text) = serde_json::to_string(&event) {
                    if sender.send(Message::Text(msg_text)).await.is_err() {
                        break;
                    }
                }
            }
        }
    });

    // Spawn a task to handle incoming pings or client messages
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            if let Message::Close(_) = msg {
                break;
            }
        }
    });

    // Wait until either sending or receiving terminates
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    };
}
