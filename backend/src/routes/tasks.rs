use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use chrono::{Duration, Utc};
use serde::Deserialize;
use serde_json::json;
use uuid::Uuid;

use crate::{
    auth::AuthenticatedUser,
    error::AppError,
    models::{
        CreateInviteDto, CreateTaskDto, Device, Invite, RegisterDeviceDto, RespondTaskDto,
        SyncEvent, Task, UpdateTaskDto,
    },
    AppState,
};

#[derive(Debug, Deserialize)]
pub struct TaskFilterQuery {
    pub place: Option<String>,
    pub status: Option<String>,
    pub search: Option<String>,
}

pub async fn list_tasks(
    auth_user: AuthenticatedUser,
    State(state): State<AppState>,
    Query(filter): Query<TaskFilterQuery>,
) -> Result<Json<Vec<Task>>, AppError> {
    let tasks = state
        .db
        .get_tasks(
            &auth_user.id,
            filter.place.as_deref(),
            filter.status.as_deref(),
            filter.search.as_deref(),
        )
        .await;

    Ok(Json(tasks))
}

pub async fn create_task(
    auth_user: AuthenticatedUser,
    State(state): State<AppState>,
    Json(payload): Json<CreateTaskDto>,
) -> Result<(StatusCode, Json<Task>), AppError> {
    let name = payload.name.trim();
    if name.is_empty() {
        return Err(AppError::BadRequest("Task name cannot be empty".to_string()));
    }

    let task_id = Uuid::new_v4().to_string();
    let description = payload.description.unwrap_or_default();
    let place = payload.place.unwrap_or_else(|| "Work".to_string());
    let status = payload.status.unwrap_or_else(|| "To Do".to_string());
    let progress_done = payload.progress_done.unwrap_or(0);
    let progress_total = payload.progress_total.unwrap_or(4);
    let ringtone = payload.ringtone.unwrap_or_else(|| "chime".to_string());
    let tags_json = serde_json::to_string(&payload.tags.unwrap_or_default())
        .unwrap_or_else(|_| "[]".to_string());
    let attachment_count = payload.attachment_count.unwrap_or(0);
    let comment_count = payload.comment_count.unwrap_or(0);
    let assignees_json = serde_json::to_string(&payload.assignees.unwrap_or_default())
        .unwrap_or_else(|_| "[]".to_string());
    let now = Utc::now().to_rfc3339();

    let task = Task {
        id: task_id,
        user_id: auth_user.id,
        name: name.to_string(),
        description,
        place,
        status,
        progress_done,
        progress_total,
        due_at: payload.due_at,
        remind_at: payload.remind_at,
        ringtone,
        tags: tags_json,
        attachment_count,
        comment_count,
        assignees: assignees_json,
        created_at: now.clone(),
        updated_at: now,
    };

    state.db.insert_task(task.clone()).await?;
    let _ = state.tx.send(SyncEvent::TaskCreated(task.clone()));

    Ok((StatusCode::CREATED, Json(task)))
}

pub async fn update_task(
    auth_user: AuthenticatedUser,
    Path(id): Path<String>,
    State(state): State<AppState>,
    Json(payload): Json<UpdateTaskDto>,
) -> Result<Json<Task>, AppError> {
    let existing = state
        .db
        .find_task_by_id(&id)
        .await
        .ok_or_else(|| AppError::NotFound("Task not found".to_string()))?;

    // Check ownership or accepted invite
    if existing.user_id != auth_user.id {
        let invites = state.db.get_invites_for_user(&auth_user.id).await;
        let is_accepted = invites
            .iter()
            .any(|inv| inv.task_id == id && inv.to_user == auth_user.id && inv.state == "accepted");
        if !is_accepted {
            return Err(AppError::Forbidden("Access denied to this task".to_string()));
        }
    }

    let name = payload.name.unwrap_or(existing.name);
    let description = payload.description.unwrap_or(existing.description);
    let place = payload.place.unwrap_or(existing.place);
    let status = payload.status.unwrap_or(existing.status);
    let progress_done = payload.progress_done.unwrap_or(existing.progress_done);
    let progress_total = payload.progress_total.unwrap_or(existing.progress_total);
    let due_at = payload.due_at.or(existing.due_at);
    let remind_at = payload.remind_at.or(existing.remind_at);
    let ringtone = payload.ringtone.unwrap_or(existing.ringtone);
    let tags = match payload.tags {
        Some(t) => serde_json::to_string(&t).unwrap_or(existing.tags),
        None => existing.tags,
    };
    let attachment_count = payload.attachment_count.unwrap_or(existing.attachment_count);
    let comment_count = payload.comment_count.unwrap_or(existing.comment_count);
    let assignees = match payload.assignees {
        Some(a) => serde_json::to_string(&a).unwrap_or(existing.assignees),
        None => existing.assignees,
    };
    let now = Utc::now().to_rfc3339();

    let updated = Task {
        id: id.clone(),
        user_id: existing.user_id,
        name,
        description,
        place,
        status,
        progress_done,
        progress_total,
        due_at,
        remind_at,
        ringtone,
        tags,
        attachment_count,
        comment_count,
        assignees,
        created_at: existing.created_at,
        updated_at: now,
    };

    state.db.update_task(updated.clone()).await?;
    let _ = state.tx.send(SyncEvent::TaskUpdated(updated.clone()));

    Ok(Json(updated))
}

pub async fn delete_task(
    auth_user: AuthenticatedUser,
    Path(id): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let deleted = state.db.delete_task(&id, &auth_user.id).await?;
    if !deleted {
        return Err(AppError::NotFound("Task not found or permission denied".to_string()));
    }

    let _ = state.tx.send(SyncEvent::TaskDeleted { id: id.clone() });

    Ok(Json(json!({ "success": true, "deleted_id": id })))
}

pub async fn respond_task(
    auth_user: AuthenticatedUser,
    Path(id): Path<String>,
    State(state): State<AppState>,
    Json(payload): Json<RespondTaskDto>,
) -> Result<Json<serde_json::Value>, AppError> {
    let mut task = state
        .db
        .find_task_by_id(&id)
        .await
        .ok_or_else(|| AppError::NotFound("Task not found".to_string()))?;

    let action = payload.action.to_lowercase();
    match action.as_str() {
        "accept" => {
            let _ = state.db.update_invite_state(&id, &auth_user.id, "accepted").await;
            task.status = "In Progress".to_string();
            task.updated_at = Utc::now().to_rfc3339();
            state.db.update_task(task.clone()).await?;
        }
        "reject" => {
            let _ = state.db.update_invite_state(&id, &auth_user.id, "rejected").await;
        }
        "remind" => {
            let new_remind_at = if let Some(custom) = payload.remind_at {
                custom
            } else {
                (Utc::now() + Duration::minutes(15)).to_rfc3339()
            };
            task.remind_at = Some(new_remind_at);
            task.updated_at = Utc::now().to_rfc3339();
            state.db.update_task(task.clone()).await?;
        }
        _ => return Err(AppError::BadRequest("Action must be accept, reject, or remind".to_string())),
    }

    let _ = state.tx.send(SyncEvent::TaskUpdated(task.clone()));

    Ok(Json(json!({
        "status": "success",
        "action": action,
        "task": task
    })))
}

pub async fn invite_user(
    auth_user: AuthenticatedUser,
    State(state): State<AppState>,
    Json(payload): Json<CreateInviteDto>,
) -> Result<Json<Invite>, AppError> {
    let task = state
        .db
        .find_task_by_id(&payload.task_id)
        .await
        .ok_or_else(|| AppError::NotFound("Task not found".to_string()))?;

    if task.user_id != auth_user.id {
        return Err(AppError::Forbidden("Only the task owner can invite others".to_string()));
    }

    let target_user = state
        .db
        .find_user_by_email(&payload.to_email)
        .await
        .ok_or_else(|| AppError::NotFound("Recipient user not found".to_string()))?;

    let invite_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let invite = Invite {
        id: invite_id,
        task_id: payload.task_id,
        from_user: auth_user.id,
        to_user: target_user.id,
        state: "pending".to_string(),
        created_at: now,
    };

    state.db.insert_invite(invite.clone()).await?;
    let _ = state.tx.send(SyncEvent::InviteReceived(invite.clone()));

    Ok(Json(invite))
}

pub async fn list_invites(
    auth_user: AuthenticatedUser,
    State(state): State<AppState>,
) -> Result<Json<Vec<Invite>>, AppError> {
    let invites = state.db.get_invites_for_user(&auth_user.id).await;
    Ok(Json(invites))
}

pub async fn register_device(
    auth_user: AuthenticatedUser,
    State(state): State<AppState>,
    Json(payload): Json<RegisterDeviceDto>,
) -> Result<Json<Device>, AppError> {
    let device_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    let device = Device {
        id: device_id,
        user_id: auth_user.id,
        platform: payload.platform,
        push_token: payload.push_token,
        created_at: now,
    };

    state.db.insert_device(device.clone()).await?;
    Ok(Json(device))
}
