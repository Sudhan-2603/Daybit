use axum::{extract::State, Json};
use chrono::Utc;
use uuid::Uuid;

use crate::{
    auth::{generate_token, hash_password, verify_password, verify_token, AuthenticatedUser},
    error::AppError,
    models::{LoginDto, RefreshDto, RegisterDto, TokenPair, User, UserResponse},
    AppState,
};

pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterDto>,
) -> Result<Json<TokenPair>, AppError> {
    let email = payload.email.trim().to_lowercase();
    if email.is_empty() || !email.contains('@') {
        return Err(AppError::BadRequest("Valid email address is required".to_string()));
    }
    if payload.password.len() < 6 {
        return Err(AppError::BadRequest(
            "Password must be at least 6 characters".to_string(),
        ));
    }

    if state.db.find_user_by_email(&email).await.is_some() {
        return Err(AppError::Conflict("User with this email already exists".to_string()));
    }

    let user_id = Uuid::new_v4().to_string();
    let hashed = hash_password(&payload.password)?;
    let now = Utc::now().to_rfc3339();

    let user = User {
        id: user_id.clone(),
        email: email.clone(),
        password_hash: hashed,
        phone_number: payload.phone_number.clone(),
        created_at: now.clone(),
    };

    state.db.insert_user(user).await?;

    let access_token = generate_token(&user_id, &state.config.jwt_secret, false)?;
    let refresh_token = generate_token(&user_id, &state.config.jwt_secret, true)?;

    let user_resp = UserResponse {
        id: user_id,
        email,
        phone_number: payload.phone_number,
        created_at: now,
    };

    Ok(Json(TokenPair {
        access_token,
        refresh_token,
        user: user_resp,
    }))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginDto>,
) -> Result<Json<TokenPair>, AppError> {
    let email = payload.email.trim().to_lowercase();
    let user = state
        .db
        .find_user_by_email(&email)
        .await
        .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

    let valid = verify_password(&payload.password, &user.password_hash)?;
    if !valid {
        return Err(AppError::Unauthorized("Invalid email or password".to_string()));
    }

    let access_token = generate_token(&user.id, &state.config.jwt_secret, false)?;
    let refresh_token = generate_token(&user.id, &state.config.jwt_secret, true)?;

    Ok(Json(TokenPair {
        access_token,
        refresh_token,
        user: user.into(),
    }))
}

pub async fn refresh(
    State(state): State<AppState>,
    Json(payload): Json<RefreshDto>,
) -> Result<Json<TokenPair>, AppError> {
    let claims = verify_token(&payload.refresh_token, &state.config.jwt_secret, "refresh")?;

    let user = state
        .db
        .find_user_by_id(&claims.sub)
        .await
        .ok_or_else(|| AppError::Unauthorized("User no longer exists".to_string()))?;

    let access_token = generate_token(&user.id, &state.config.jwt_secret, false)?;
    let new_refresh_token = generate_token(&user.id, &state.config.jwt_secret, true)?;

    Ok(Json(TokenPair {
        access_token,
        refresh_token: new_refresh_token,
        user: user.into(),
    }))
}

pub async fn me(
    auth_user: AuthenticatedUser,
    State(state): State<AppState>,
) -> Result<Json<UserResponse>, AppError> {
    let user = state
        .db
        .find_user_by_id(&auth_user.id)
        .await
        .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

    Ok(Json(user.into()))
}
