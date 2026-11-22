use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: String,
    pub email: String,
    #[serde(default)]
    pub password_hash: String,
    pub phone_number: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserResponse {
    pub id: String,
    pub email: String,
    pub phone_number: Option<String>,
    pub created_at: String,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        UserResponse {
            id: user.id,
            email: user.email,
            phone_number: user.phone_number,
            created_at: user.created_at,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct RegisterDto {
    pub email: String,
    pub password: String,
    pub phone_number: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginDto {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct RefreshDto {
    pub refresh_token: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub description: String,
    pub place: String,          // 'College' | 'Work' | 'Personal'
    pub status: String,         // 'To Do' | 'In Progress' | 'Review' | 'Complete'
    pub progress_done: i64,
    pub progress_total: i64,
    pub due_at: Option<String>,
    pub remind_at: Option<String>,
    pub ringtone: String,
    pub tags: String,           // JSON array string e.g. ["Design UI/UX", "Frontend"]
    pub attachment_count: i64,
    pub comment_count: i64,
    pub assignees: String,      // JSON array string e.g. ["Alex", "Taylor"]
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTaskDto {
    pub name: String,
    pub description: Option<String>,
    pub place: Option<String>,
    pub status: Option<String>,
    pub progress_done: Option<i64>,
    pub progress_total: Option<i64>,
    pub due_at: Option<String>,
    pub remind_at: Option<String>,
    pub ringtone: Option<String>,
    pub tags: Option<Vec<String>>,
    pub attachment_count: Option<i64>,
    pub comment_count: Option<i64>,
    pub assignees: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTaskDto {
    pub name: Option<String>,
    pub description: Option<String>,
    pub place: Option<String>,
    pub status: Option<String>,
    pub progress_done: Option<i64>,
    pub progress_total: Option<i64>,
    pub due_at: Option<String>,
    pub remind_at: Option<String>,
    pub ringtone: Option<String>,
    pub tags: Option<Vec<String>>,
    pub attachment_count: Option<i64>,
    pub comment_count: Option<i64>,
    pub assignees: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct RespondTaskDto {
    pub action: String, // "accept" | "reject" | "remind"
    pub remind_at: Option<String>, // if action == remind
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Invite {
    pub id: String,
    pub task_id: String,
    pub from_user: String,
    pub to_user: String,
    pub state: String, // pending, accepted, rejected
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateInviteDto {
    pub task_id: String,
    pub to_email: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Device {
    pub id: String,
    pub user_id: String,
    pub platform: String,
    pub push_token: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct RegisterDeviceDto {
    pub platform: String,
    pub push_token: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StatusCount {
    pub status: String,
    pub count: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlaceCount {
    pub place: String,
    pub count: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DashboardStats {
    pub total_tasks: i64,
    pub completed_percentage: f64,
    pub count_by_status: Vec<StatusCount>,
    pub count_by_place: Vec<PlaceCount>,
    pub average_progress: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type", content = "payload")]
pub enum SyncEvent {
    TaskCreated(Task),
    TaskUpdated(Task),
    TaskDeleted { id: String },
    TaskReminder { task: Task },
    InviteReceived(Invite),
    InviteUpdated(Invite),
}
