use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use serde::Deserialize;
use uuid::Uuid;

use crate::{
    config::Config,
    models::{SyncEvent, Task, User},
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct VerifyWebhookQuery {
    #[serde(rename = "hub.mode")]
    pub mode: Option<String>,
    #[serde(rename = "hub.verify_token")]
    pub verify_token: Option<String>,
    #[serde(rename = "hub.challenge")]
    pub challenge: Option<String>,
}

pub async fn verify_webhook(
    Query(query): Query<VerifyWebhookQuery>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let expected_token = state
        .config
        .whatsapp_verify_token
        .unwrap_or_else(|| "daybit_whatsapp_verify_token".to_string());

    if query.mode.as_deref() == Some("subscribe") && query.verify_token.as_deref() == Some(&expected_token) {
        if let Some(challenge) = query.challenge {
            return (StatusCode::OK, challenge).into_response();
        }
    }

    (StatusCode::FORBIDDEN, "Verification failed").into_response()
}

#[derive(Debug, Deserialize)]
pub struct WhatsAppWebhookPayload {
    pub object: Option<String>,
    pub entry: Option<Vec<WhatsAppEntry>>,
}

#[derive(Debug, Deserialize)]
pub struct WhatsAppEntry {
    pub id: Option<String>,
    pub changes: Option<Vec<WhatsAppChange>>,
}

#[derive(Debug, Deserialize)]
pub struct WhatsAppChange {
    pub value: Option<WhatsAppValue>,
    pub field: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct WhatsAppValue {
    pub messaging_product: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub messages: Option<Vec<WhatsAppIncomingMessage>>,
}

#[derive(Debug, Deserialize)]
pub struct WhatsAppIncomingMessage {
    pub from: String,
    pub id: String,
    pub timestamp: String,
    #[serde(rename = "type")]
    pub msg_type: String,
    pub text: Option<WhatsAppTextBody>,
}

#[derive(Debug, Deserialize)]
pub struct WhatsAppTextBody {
    pub body: String,
}

pub async fn handle_webhook(
    State(state): State<AppState>,
    Json(payload): Json<WhatsAppWebhookPayload>,
) -> impl IntoResponse {
    if let Some(entries) = payload.entry {
        for entry in entries {
            if let Some(changes) = entry.changes {
                for change in changes {
                    if let Some(val) = change.value {
                        if let Some(messages) = val.messages {
                            for msg in messages {
                                if msg.msg_type == "text" {
                                    if let Some(text_body) = msg.text {
                                        let sender_phone = msg.from;
                                        let command = text_body.body.trim().to_string();
                                        process_whatsapp_command(&state, &sender_phone, &command).await;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    (StatusCode::OK, "EVENT_RECEIVED")
}

async fn process_whatsapp_command(state: &AppState, phone: &str, text: &str) {
    let user_opt = state.db.find_user_by_phone(phone).await;

    let user = match user_opt {
        Some(u) => u,
        None => {
            let msg = format!(
                "👋 Welcome to Daybit Task Manager!\nYour WhatsApp number ({}) is not linked to any account yet.\nPlease register or add your phone number in Daybit Profile.",
                phone
            );
            send_whatsapp_message(phone, &msg, &state.config).await;
            return;
        }
    };

    let trimmed = text.trim();
    if trimmed.eq_ignore_ascii_case("list today") {
        handle_list_today(state, &user, phone).await;
    } else if trimmed.to_lowercase().starts_with("add ") {
        handle_add_task(state, &user, phone, &trimmed[4..]).await;
    } else if trimmed.to_lowercase().starts_with("done ") {
        handle_done_task(state, &user, phone, &trimmed[5..]).await;
    } else {
        let help_text = "🤖 *Daybit WhatsApp Bot Commands:*\n\n\
                         📌 *add <name> | <place> | <date time>*\n   Example: `add Final Exam Prep | College | tomorrow 10am`\n\n\
                         📋 *list today*\n   View all pending tasks for today\n\n\
                         ✅ *done <id>*\n   Mark task as completed by ID\n\n\
                         🔔 Reminders configured on Daybit will also be sent here!";
        send_whatsapp_message(phone, help_text, &state.config).await;
    }
}

async fn handle_list_today(state: &AppState, user: &User, phone: &str) {
    let tasks = state.db.get_tasks(&user.id, None, None, None).await;
    let pending: Vec<&Task> = tasks.iter().filter(|t| t.status != "Complete").collect();

    if pending.is_empty() {
        send_whatsapp_message(phone, "🎉 No pending tasks found for today!", &state.config).await;
        return;
    }

    let mut response = format!("📋 *Today's Pending Tasks ({}):*\n\n", pending.len());
    for t in pending.iter().take(10) {
        let short_id = if t.id.len() >= 8 { &t.id[..8] } else { &t.id };
        let due_str = t.due_at.as_deref().unwrap_or("No deadline");
        response.push_str(&format!(
            "▫️ `[{}]` *{}*\n   📍 Place: {} | ⏳ Status: {}\n   📅 Due: {}\n   Progress: {}/{}\n\n",
            short_id, t.name, t.place, t.status, due_str, t.progress_done, t.progress_total
        ));
    }
    response.push_str("To complete a task, reply: `done <id>`");
    send_whatsapp_message(phone, &response, &state.config).await;
}

async fn handle_add_task(state: &AppState, user: &User, phone: &str, body: &str) {
    let parts: Vec<&str> = body.split('|').map(|s| s.trim()).collect();
    let name = parts.first().unwrap_or(&"New Task");
    if name.is_empty() {
        send_whatsapp_message(phone, "❌ Please specify a task name. Format: `add <name> | <place> | <date time>`", &state.config).await;
        return;
    }

    let place = parts.get(1).map(|p| match p.to_lowercase().as_str() {
        "college" => "College",
        "personal" => "Personal",
        _ => "Work",
    }).unwrap_or("Work").to_string();

    let date_str = parts.get(2).map(|s| s.to_string());
    let task_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let task = Task {
        id: task_id.clone(),
        user_id: user.id.clone(),
        name: name.to_string(),
        description: "Created via WhatsApp Bot".to_string(),
        place: place.clone(),
        status: "To Do".to_string(),
        progress_done: 0,
        progress_total: 4,
        due_at: date_str.clone(),
        remind_at: None,
        ringtone: "chime".to_string(),
        tags: "[\"WhatsApp\"]".to_string(),
        attachment_count: 0,
        comment_count: 0,
        assignees: "[]".to_string(),
        created_at: now.clone(),
        updated_at: now,
    };

    if let Ok(()) = state.db.insert_task(task.clone()).await {
        let _ = state.tx.send(SyncEvent::TaskCreated(task));
        let short_id = &task_id[..8];
        let reply = format!(
            "✅ Task Created!\n\n📌 *{}*\n🆔 ID: `{}`\n📍 Place: {}\n📅 Due: {}\n\nTrack progress on your Daybit board!",
            name, short_id, place, date_str.unwrap_or_else(|| "None".to_string())
        );
        send_whatsapp_message(phone, &reply, &state.config).await;
    } else {
        send_whatsapp_message(phone, "❌ Error saving task. Please try again.", &state.config).await;
    }
}

async fn handle_done_task(state: &AppState, user: &User, phone: &str, id_query: &str) {
    let clean_id = id_query.trim();
    if clean_id.is_empty() {
        send_whatsapp_message(phone, "❌ Please specify task ID. Example: `done a1b2c3d4`", &state.config).await;
        return;
    }

    let task_opt = state.db.find_task_by_prefix(&user.id, clean_id).await;

    match task_opt {
        Some(mut task) => {
            task.status = "Complete".to_string();
            task.progress_done = task.progress_total;
            task.updated_at = Utc::now().to_rfc3339();

            let _ = state.db.update_task(task.clone()).await;
            let _ = state.tx.send(SyncEvent::TaskUpdated(task.clone()));

            let reply = format!("🎉 *Completed!* Task \"{}\" is now marked as Complete.", task.name);
            send_whatsapp_message(phone, &reply, &state.config).await;
        }
        None => {
            send_whatsapp_message(phone, &format!("❌ No task found matching ID `{}`", clean_id), &state.config).await;
        }
    }
}

pub async fn send_whatsapp_message(to: &str, message_body: &str, config: &Config) {
    let _access_token = match &config.whatsapp_access_token {
        Some(token) if !token.trim().is_empty() => token.clone(),
        _ => {
            tracing::info!(
                "[WhatsApp Dev Mode - Outgoing message to {}]:\n{}",
                to,
                message_body
            );
            return;
        }
    };

    let _phone_number_id = match &config.whatsapp_phone_number_id {
        Some(id) if !id.trim().is_empty() => id.clone(),
        _ => {
            tracing::info!(
                "[WhatsApp Dev Mode - Outgoing message to {}]:\n{}",
                to,
                message_body
            );
            return;
        }
    };

    // When access token and phone number ID are provided in .env, log simulated delivery
    tracing::info!("[WhatsApp Delivery to {}]: {}", to, message_body);
}
