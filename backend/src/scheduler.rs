use chrono::Utc;
use std::sync::Arc;
use tokio_cron_scheduler::{Job, JobScheduler};

use crate::{
    models::SyncEvent,
    routes::whatsapp::send_whatsapp_message,
    AppState,
};

pub async fn start_reminder_scheduler(state: AppState) -> Result<JobScheduler, Box<dyn std::error::Error>> {
    let sched = JobScheduler::new().await?;
    let state_arc = Arc::new(state);

    // Run every 15 seconds
    let job = Job::new_async("1/15 * * * * *", move |_uuid, _lock| {
        let state = state_arc.clone();
        Box::pin(async move {
            let now = Utc::now().to_rfc3339();
            
            // Query tasks where remind_at is set and due (remind_at <= now)
            let tasks = state.db.get_due_reminders(&now).await;

            for task in tasks {
                tracing::info!("Reminder firing for task '{}' (id: {})", task.name, task.id);

                // Broadcast live notification event over WebSocket
                let _ = state.tx.send(SyncEvent::TaskReminder {
                    task: task.clone(),
                });

                // Clear remind_at so it doesn't repeatedly fire until snoozed or re-scheduled
                let _ = state.db.clear_task_reminder(&task.id).await;

                // Send WhatsApp notification if user has phone number configured
                if let Some(user) = state.db.find_user_by_id(&task.user_id).await {
                    if let Some(ref phone) = user.phone_number {
                        let due_str = task.due_at.as_deref().unwrap_or("No deadline set");
                        let short_id = if task.id.len() >= 8 { &task.id[..8] } else { &task.id };
                        let wa_msg = format!(
                            "🔔 *Daybit Task Reminder!*\n\n\
                             📌 *{}*\n\
                             📍 Place: {}\n\
                             📅 Due: {}\n\
                             ⏳ Progress: {}/{}\n\n\
                             Reply:\n\
                             • `done {}` to mark complete\n\
                             • View in app to Snooze or adjust time.",
                            task.name, task.place, due_str, task.progress_done, task.progress_total, short_id
                        );
                        send_whatsapp_message(phone, &wa_msg, &state.config).await;
                    }
                }
            }
        })
    })?;

    sched.add(job).await?;
    sched.start().await?;
    tracing::info!("Tokio reminder scheduler initialized successfully.");

    Ok(sched)
}
