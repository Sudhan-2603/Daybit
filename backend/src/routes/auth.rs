use axum::{extract::State, Json};
use chrono::Utc;
use serde::Deserialize;
use uuid::Uuid;

use crate::{
    auth::{generate_token, hash_password, verify_password, verify_token, AuthenticatedUser},
    error::AppError,
    models::{LoginDto, RefreshDto, RegisterDto, TokenPair, User, UserResponse},
    AppState,
};

#[derive(Deserialize)]
pub struct FirebaseLoginDto {
    pub id_token: String,
}

#[derive(Deserialize)]
struct FirebaseLookupResponse {
    users: Option<Vec<FirebaseLookupUser>>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct FirebaseLookupUser {
    local_id: String,
    email: Option<String>,
    #[serde(default)]
    email_verified: bool,
    phone_number: Option<String>,
}

pub async fn firebase_login(
    State(state): State<AppState>,
    Json(payload): Json<FirebaseLoginDto>,
) -> Result<Json<TokenPair>, AppError> {
    if payload.id_token.trim().is_empty() {
        return Err(AppError::Unauthorized("Firebase ID token is required".to_string()));
    }

    // Identity Toolkit verifies the ID token against this Firebase project before
    // the backend issues its own API tokens.
    let response = reqwest::Client::new()
        .post(format!(
            "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={}",
            state.config.firebase_api_key
        ))
        .json(&serde_json::json!({ "idToken": payload.id_token }))
        .send()
        .await
        .map_err(|e| AppError::Internal(format!("Firebase token verification failed: {e}")))?;

    if !response.status().is_success() {
        return Err(AppError::Unauthorized("Invalid Firebase ID token".to_string()));
    }

    let verified: FirebaseLookupResponse = response
        .json()
        .await
        .map_err(|e| AppError::Internal(format!("Invalid Firebase verification response: {e}")))?;
    let identity = verified.users
        .and_then(|users| users.into_iter().next())
        .ok_or_else(|| AppError::Unauthorized("Firebase account was not found".to_string()))?;
    if !identity.email_verified {
        return Err(AppError::Unauthorized("Verify your Google email before signing in".to_string()));
    }
    let email = identity.email
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| AppError::Unauthorized("Google account must provide an email address".to_string()))?
        .trim()
        .to_lowercase();

    let user = match state.db.find_user_by_email(&email).await {
        Some(user) => user,
        None => {
            let user = User {
                id: identity.local_id,
                email: email.clone(),
                password_hash: hash_password(&Uuid::new_v4().to_string())?,
                phone_number: identity.phone_number,
                created_at: Utc::now().to_rfc3339(),
            };
            state.db.insert_user(user.clone()).await?;
            user
        }
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
