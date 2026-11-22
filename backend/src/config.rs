use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub port: u16,
    pub whatsapp_access_token: Option<String>,
    pub whatsapp_phone_number_id: Option<String>,
    pub whatsapp_verify_token: Option<String>,
    pub firebase_api_key: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        let raw_db_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "mongodb+srv://gomathisudhan552_db_user:IwW811FG2oWGgFX2@daybit.hblf44y.mongodb.net/Daybit?retryWrites=true&w=majority".to_string());
        let database_url = if raw_db_url.contains("/daybit?") {
            raw_db_url.replace("/daybit?", "/Daybit?")
        } else if raw_db_url.ends_with("/daybit") {
            format!("{}/Daybit", &raw_db_url[..raw_db_url.len() - 7])
        } else {
            raw_db_url
        };
        let jwt_secret = env::var("JWT_SECRET")
            .unwrap_or_else(|_| "daybit_super_secret_jwt_key_2026_dev_mode".to_string());
        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(4000);
        let whatsapp_access_token = env::var("WHATSAPP_ACCESS_TOKEN").ok();
        let whatsapp_phone_number_id = env::var("WHATSAPP_PHONE_NUMBER_ID").ok();
        let whatsapp_verify_token = env::var("WHATSAPP_VERIFY_TOKEN").ok();
        let firebase_api_key = env::var("FIREBASE_API_KEY")
            .unwrap_or_else(|_| "AIzaSyAyrC1S8pwDBHDDN8xQlttqVRv4T-eWnU4".to_string());

        Self {
            database_url,
            jwt_secret,
            port,
            whatsapp_access_token,
            whatsapp_phone_number_id,
            whatsapp_verify_token,
            firebase_api_key,
        }
    }
}

