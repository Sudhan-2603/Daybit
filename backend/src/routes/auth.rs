use axum::{extract::State, Json};
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use chrono::Utc;
use serde::Deserialize;
use uuid::Uuid;

use crate::{
    auth::{generate_token, hash_password, verify_password, verify_token, AuthenticatedUser},
    error::AppError,
    models::{LoginDto, RefreshDto, RegisterDto, TokenPair, User, UserResponse},
    AppState,
};
use serde::Serialize;

#[derive(Deserialize)]
pub struct CheckEmailDto {
    pub email: String,
}

#[derive(Serialize)]
pub struct CheckEmailResponse {
    pub exists: bool,
}

pub async fn check_email(
    State(state): State<AppState>,
    Json(payload): Json<CheckEmailDto>,
) -> Result<Json<CheckEmailResponse>, AppError> {
    let email = payload.email.trim().to_lowercase();
    let exists = state.db.find_user_by_email(&email).await.is_some();
    Ok(Json(CheckEmailResponse { exists }))
}

#[derive(Deserialize)]
pub struct FirebaseLoginDto {
    pub id_token: String,
}

#[derive(Deserialize, Debug)]
struct FirebaseTokenPayload {
    sub: Option<String>,
    user_id: Option<String>,
    email: Option<String>,
    #[serde(default)]
    email_verified: bool,
    phone_number: Option<String>,
    name: Option<String>,
    exp: Option<i64>,
}

pub async fn firebase_login(
    State(state): State<AppState>,
    Json(payload): Json<FirebaseLoginDto>,
) -> Result<Json<TokenPair>, AppError> {
    let token = payload.id_token.trim();
    if token.is_empty() {
        return Err(AppError::Unauthorized("Firebase ID token is required".to_string()));
    }

    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() < 2 {
        return Err(AppError::Unauthorized("Malformed Firebase ID token".to_string()));
    }

    let raw_payload = parts[1];
    let padded = match raw_payload.len() % 4 {
        2 => format!("{raw_payload}=="),
        3 => format!("{raw_payload}="),
        _ => raw_payload.to_string(),
    };

    let payload_bytes = URL_SAFE_NO_PAD
        .decode(raw_payload)
        .or_else(|_| base64::engine::general_purpose::URL_SAFE.decode(&padded))
        .or_else(|_| base64::engine::general_purpose::STANDARD.decode(&padded))
        .map_err(|e| AppError::Unauthorized(format!("Failed to decode Firebase token: {e}")))?;

    let claims: FirebaseTokenPayload = serde_json::from_slice(&payload_bytes)
        .map_err(|e| AppError::Unauthorized(format!("Invalid Firebase token payload: {e}")))?;

    if let Some(exp) = claims.exp {
        if Utc::now().timestamp() > exp {
            return Err(AppError::Unauthorized("Firebase ID token is expired".to_string()));
        }
    }

    let local_id = claims
        .user_id
        .or(claims.sub)
        .filter(|s| !s.trim().is_empty())
        .ok_or_else(|| AppError::Unauthorized("Firebase account ID missing".to_string()))?;

    let email = claims
        .email
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| format!("{}@firebase.daybit.app", local_id))
        .trim()
        .to_lowercase();

    let user = match state.db.find_user_by_email(&email).await {
        Some(user) => user,
        None => match state.db.find_user_by_id(&local_id).await {
            Some(user) => user,
            None => {
                let user = User {
                    id: local_id,
                    email: email.clone(),
                    password_hash: hash_password(&Uuid::new_v4().to_string())?,
                    phone_number: claims.phone_number,
                    created_at: Utc::now().to_rfc3339(),
                };
                state.db.insert_user(user.clone()).await?;
                user
            }
        },
    };

    let access_token = generate_token(&user.id, &state.config.jwt_secret, false)?;
    let refresh_token = generate_token(&user.id, &state.config.jwt_secret, true)?;
    Ok(Json(TokenPair {
        access_token,
        refresh_token,
        user: user.into(),
    }))
}

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
