use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{header, request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use chrono::{Duration, Utc};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sha2::Sha256;

use crate::error::AppError;

type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,        // user_id
    pub token_type: String, // "access" | "refresh"
    pub exp: i64,
    pub iat: i64,
}

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub id: String,
}

pub fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(e.to_string()))?
        .to_string();
    Ok(password_hash)
}

pub fn verify_password(password: &str, password_hash: &str) -> Result<bool, AppError> {
    let parsed_hash = PasswordHash::new(password_hash)
        .map_err(|e| AppError::Internal(e.to_string()))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

pub fn generate_token(user_id: &str, secret: &str, is_refresh: bool) -> Result<String, AppError> {
    let now = Utc::now();
    let duration = if is_refresh {
        Duration::days(30)
    } else {
        Duration::hours(24)
    };
    let exp = (now + duration).timestamp();
    let iat = now.timestamp();

    let header = json!({
        "alg": "HS256",
        "typ": "JWT"
    });
    let header_b64 = URL_SAFE_NO_PAD.encode(serde_json::to_string(&header).unwrap());

    let claims = Claims {
        sub: user_id.to_string(),
        token_type: if is_refresh { "refresh".to_string() } else { "access".to_string() },
        exp,
        iat,
    };
    let claims_b64 = URL_SAFE_NO_PAD.encode(
        serde_json::to_string(&claims).map_err(|e| AppError::Internal(e.to_string()))?,
    );

    let message = format!("{}.{}", header_b64, claims_b64);
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .map_err(|e| AppError::Internal(e.to_string()))?;
    mac.update(message.as_bytes());
    let signature = mac.finalize().into_bytes();
    let sig_b64 = URL_SAFE_NO_PAD.encode(signature);

    Ok(format!("{}.{}", message, sig_b64))
}

pub fn verify_token(token: &str, secret: &str, expected_type: &str) -> Result<Claims, AppError> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err(AppError::Unauthorized("Malformed JWT token".to_string()));
    }

    let message = format!("{}.{}", parts[0], parts[1]);
    let sig_bytes = URL_SAFE_NO_PAD
        .decode(parts[2])
        .map_err(|_| AppError::Unauthorized("Invalid token encoding".to_string()))?;

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .map_err(|e| AppError::Internal(e.to_string()))?;
    mac.update(message.as_bytes());

    if mac.verify_slice(&sig_bytes).is_err() {
        return Err(AppError::Unauthorized("Invalid token signature".to_string()));
    }

    let claims_json = URL_SAFE_NO_PAD
        .decode(parts[1])
        .map_err(|_| AppError::Unauthorized("Invalid payload encoding".to_string()))?;

    let claims: Claims = serde_json::from_slice(&claims_json)
        .map_err(|_| AppError::Unauthorized("Invalid claims schema".to_string()))?;

    let now = Utc::now().timestamp();
    if claims.exp < now {
        return Err(AppError::Unauthorized("Token has expired".to_string()));
    }

    if claims.token_type != expected_type {
        return Err(AppError::Unauthorized(format!(
            "Expected {} token, got {}",
            expected_type, claims.token_type
        )));
    }

    Ok(claims)
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get(header::AUTHORIZATION)
            .and_then(|value| value.to_str().ok());

        let token = match auth_header {
            Some(header) if header.starts_with("Bearer ") => &header[7..],
            _ => {
                return Err((
                    StatusCode::UNAUTHORIZED,
                    Json(json!({ "error": "Missing or malformed Authorization header" })),
                )
                    .into_response())
            }
        };

        let secret = std::env::var("JWT_SECRET")
            .unwrap_or_else(|_| "daybit_super_secret_jwt_key_2026_dev_mode".to_string());

        match verify_token(token, &secret, "access") {
            Ok(claims) => Ok(AuthenticatedUser { id: claims.sub }),
            Err(e) => Err(e.into_response()),
        }
    }
}
