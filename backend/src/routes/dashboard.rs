use axum::{extract::State, Json};
use crate::{
    auth::AuthenticatedUser,
    error::AppError,
    models::DashboardStats,
    AppState,
};

pub async fn get_dashboard_stats(
    auth_user: AuthenticatedUser,
    State(state): State<AppState>,
) -> Result<Json<DashboardStats>, AppError> {
    let stats = state.db.get_dashboard_stats(&auth_user.id).await;
    Ok(Json(stats))
}
