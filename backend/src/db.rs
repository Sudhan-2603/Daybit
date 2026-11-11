use std::sync::Arc;
use chrono::Utc;
use mongodb::{bson::{doc, from_document, to_document}, options::ReplaceOptions, Client, Collection};
use tokio::sync::RwLock;

use crate::{
    error::AppError,
    models::{DashboardStats, Device, Invite, PlaceCount, StatusCount, Task, User},
};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
pub struct DbData {
    pub users: Vec<User>,
    pub tasks: Vec<Task>,
    pub invites: Vec<Invite>,
    pub devices: Vec<Device>,
}

#[derive(Clone)]
pub struct Db {
    collection: Collection<mongodb::bson::Document>,
    data: Arc<RwLock<DbData>>,
}

impl Db {
    pub async fn init(database_url: &str) -> Result<Self, AppError> {
        let client = Client::with_uri_str(database_url).await
            .map_err(|e| AppError::Internal(format!("MongoDB connection failed: {e}")))?;
        let database = client.default_database()
            .ok_or_else(|| AppError::Internal("MongoDB URI must include a database name".to_string()))?;
        let collection = database.collection::<mongodb::bson::Document>("daybit_state");
        let data = match collection.find_one(doc! { "_id": "daybit" }, None).await
            .map_err(|e| AppError::Internal(format!("MongoDB read failed: {e}")))? {
            Some(document) => document.get_document("data")
                .map_err(|e| AppError::Internal(e.to_string()))
                .and_then(|value| from_document(value.clone()).map_err(|e| AppError::Internal(e.to_string())))?,
            None => DbData::default(),
        };
        tracing::info!("MongoDB connected; loaded {} users and {} tasks", data.users.len(), data.tasks.len());

        Ok(Self {
            collection,
            data: Arc::new(RwLock::new(data)),
        })
    }

    async fn persist(&self) -> Result<(), AppError> {
        let data = self.data.read().await;
        let document = to_document(&*data).map_err(|e| AppError::Internal(e.to_string()))?;
        self.collection.replace_one(
            doc! { "_id": "daybit" },
            doc! { "_id": "daybit", "data": document },
            ReplaceOptions::builder().upsert(true).build(),
        ).await.map_err(|e| AppError::Internal(format!("MongoDB write failed: {e}")))?;
        Ok(())
    }

    // User Operations
    pub async fn find_user_by_email(&self, email: &str) -> Option<User> {
        let lock = self.data.read().await;
        let clean = email.trim().to_lowercase();
        lock.users.iter().find(|u| u.email.to_lowercase() == clean).cloned()
    }

    pub async fn find_user_by_id(&self, id: &str) -> Option<User> {
        let lock = self.data.read().await;
        lock.users.iter().find(|u| u.id == id).cloned()
    }

    pub async fn find_user_by_phone(&self, phone: &str) -> Option<User> {
        let lock = self.data.read().await;
        let clean = phone.trim().trim_start_matches('+');
        lock.users.iter().find(|u| {
            if let Some(ref p) = u.phone_number {
                let p_clean = p.trim().trim_start_matches('+');
                p_clean == clean
            } else {
                false
            }
        }).cloned()
    }

    pub async fn insert_user(&self, user: User) -> Result<(), AppError> {
        {
            let mut lock = self.data.write().await;
            lock.users.push(user);
        }
        self.persist().await
    }

    // Task Operations
    pub async fn get_tasks(
        &self,
        user_id: &str,
        place: Option<&str>,
        status: Option<&str>,
        search: Option<&str>,
    ) -> Vec<Task> {
        let lock = self.data.read().await;
        let accepted_task_ids: Vec<String> = lock
            .invites
            .iter()
            .filter(|i| i.to_user == user_id && i.state == "accepted")
            .map(|i| i.task_id.clone())
            .collect();

        lock.tasks
            .iter()
            .filter(|t| {
                let is_owner = t.user_id == user_id;
                let is_accepted_invite = accepted_task_ids.contains(&t.id);
                if !is_owner && !is_accepted_invite {
                    return false;
                }

                if let Some(p) = place {
                    if !p.is_empty() && p != "All" && !t.place.eq_ignore_ascii_case(p) {
                        return false;
                    }
                }

                if let Some(s) = status {
                    if !s.is_empty() && !t.status.eq_ignore_ascii_case(s) {
                        return false;
                    }
                }

                if let Some(q) = search {
                    if !q.is_empty() {
                        let query = q.to_lowercase();
                        let in_name = t.name.to_lowercase().contains(&query);
                        let in_desc = t.description.to_lowercase().contains(&query);
                        let in_tags = t.tags.to_lowercase().contains(&query);
                        if !in_name && !in_desc && !in_tags {
                            return false;
                        }
                    }
                }

                true
            })
            .cloned()
            .collect()
    }

    pub async fn find_task_by_id(&self, id: &str) -> Option<Task> {
        let lock = self.data.read().await;
        lock.tasks.iter().find(|t| t.id == id).cloned()
    }

    pub async fn find_task_by_prefix(&self, user_id: &str, prefix: &str) -> Option<Task> {
        let lock = self.data.read().await;
        let clean = prefix.trim().to_lowercase();
        lock.tasks.iter().find(|t| {
            t.user_id == user_id && t.id.to_lowercase().starts_with(&clean)
        }).cloned()
    }

    pub async fn insert_task(&self, task: Task) -> Result<(), AppError> {
        {
            let mut lock = self.data.write().await;
            lock.tasks.insert(0, task);
        }
        self.persist().await
    }

    pub async fn update_task(&self, task: Task) -> Result<(), AppError> {
        {
            let mut lock = self.data.write().await;
            if let Some(pos) = lock.tasks.iter().position(|t| t.id == task.id) {
                lock.tasks[pos] = task;
            } else {
                return Err(AppError::NotFound("Task not found".to_string()));
            }
        }
        self.persist().await
    }

    pub async fn delete_task(&self, id: &str, user_id: &str) -> Result<bool, AppError> {
        let found = {
            let mut lock = self.data.write().await;
            if let Some(pos) = lock.tasks.iter().position(|t| t.id == id && t.user_id == user_id) {
                lock.tasks.remove(pos);
                true
            } else {
                false
            }
        };

        if found {
            self.persist().await?;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    // Invites
    pub async fn insert_invite(&self, invite: Invite) -> Result<(), AppError> {
        {
            let mut lock = self.data.write().await;
            lock.invites.push(invite);
        }
        self.persist().await
    }

    pub async fn get_invites_for_user(&self, user_id: &str) -> Vec<Invite> {
        let lock = self.data.read().await;
        lock.invites
            .iter()
            .filter(|i| i.to_user == user_id || i.from_user == user_id)
            .cloned()
            .collect()
    }

    pub async fn update_invite_state(&self, task_id: &str, user_id: &str, state: &str) -> Result<(), AppError> {
        {
            let mut lock = self.data.write().await;
            if let Some(inv) = lock.invites.iter_mut().find(|i| i.task_id == task_id && i.to_user == user_id) {
                inv.state = state.to_string();
            }
        }
        self.persist().await
    }

    // Devices
    pub async fn insert_device(&self, device: Device) -> Result<(), AppError> {
        {
            let mut lock = self.data.write().await;
            lock.devices.push(device);
        }
        self.persist().await
    }

    // Scheduler Reminders
    pub async fn get_due_reminders(&self, now_iso: &str) -> Vec<Task> {
        let lock = self.data.read().await;
        lock.tasks
            .iter()
            .filter(|t| {
                if let Some(ref rem) = t.remind_at {
                    t.status != "Complete" && rem.as_str() <= now_iso
                } else {
                    false
                }
            })
            .cloned()
            .collect()
    }

    pub async fn clear_task_reminder(&self, task_id: &str) -> Result<(), AppError> {
        {
            let mut lock = self.data.write().await;
            if let Some(t) = lock.tasks.iter_mut().find(|t| t.id == task_id) {
                t.remind_at = None;
                t.updated_at = Utc::now().to_rfc3339();
            }
        }
        self.persist().await
    }

    // Dashboard
    pub async fn get_dashboard_stats(&self, user_id: &str) -> DashboardStats {
        let tasks = self.get_tasks(user_id, None, None, None).await;
        let total_tasks = tasks.len() as i64;

        if total_tasks == 0 {
            return DashboardStats {
                total_tasks: 0,
                completed_percentage: 0.0,
                count_by_status: vec![
                    StatusCount { status: "To Do".to_string(), count: 0 },
                    StatusCount { status: "In Progress".to_string(), count: 0 },
                    StatusCount { status: "Review".to_string(), count: 0 },
                    StatusCount { status: "Complete".to_string(), count: 0 },
                ],
                count_by_place: vec![
                    PlaceCount { place: "College".to_string(), count: 0 },
                    PlaceCount { place: "Work".to_string(), count: 0 },
                    PlaceCount { place: "Personal".to_string(), count: 0 },
                ],
                average_progress: 0.0,
            };
        }

        let mut todo = 0;
        let mut in_prog = 0;
        let mut review = 0;
        let mut complete = 0;

        let mut college = 0;
        let mut work = 0;
        let mut personal = 0;

        let mut total_prog_ratio = 0.0;

        for t in &tasks {
            match t.status.as_str() {
                "To Do" => todo += 1,
                "In Progress" => in_prog += 1,
                "Review" => review += 1,
                "Complete" => complete += 1,
                _ => todo += 1,
            }

            match t.place.as_str() {
                "College" => college += 1,
                "Work" => work += 1,
                "Personal" => personal += 1,
                _ => work += 1,
            }

            let ratio = if t.progress_total > 0 {
                (t.progress_done as f64 / t.progress_total as f64).clamp(0.0, 1.0)
            } else {
                0.0
            };
            total_prog_ratio += ratio * 100.0;
        }

        let completed_percentage = (complete as f64 / total_tasks as f64) * 100.0;
        let average_progress = total_prog_ratio / total_tasks as f64;

        DashboardStats {
            total_tasks,
            completed_percentage: (completed_percentage * 10.0).round() / 10.0,
            count_by_status: vec![
                StatusCount { status: "To Do".to_string(), count: todo },
                StatusCount { status: "In Progress".to_string(), count: in_prog },
                StatusCount { status: "Review".to_string(), count: review },
                StatusCount { status: "Complete".to_string(), count: complete },
            ],
            count_by_place: vec![
                PlaceCount { place: "College".to_string(), count: college },
                PlaceCount { place: "Work".to_string(), count: work },
                PlaceCount { place: "Personal".to_string(), count: personal },
            ],
            average_progress: (average_progress * 10.0).round() / 10.0,
        }
    }
}

