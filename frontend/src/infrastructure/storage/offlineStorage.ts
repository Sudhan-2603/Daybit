import type {
  CreateTaskInput,
  DashboardStats,
  Place,
  Task,
  TaskStatus,
  UpdateTaskInput,
  User,
} from '../../domain/models';
import {
  DEFAULT_STARTER_TASKS,
  STORAGE_KEYS,
} from '../../domain/constants';

export class OfflineStorageEngine {
  private static instance: OfflineStorageEngine;

  private constructor() {}

  public static getInstance(): OfflineStorageEngine {
    if (!OfflineStorageEngine.instance) {
      OfflineStorageEngine.instance = new OfflineStorageEngine();
    }
    return OfflineStorageEngine.instance;
  }

  public getTasks(): Task[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_TASKS);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_TASKS, JSON.stringify(tasks));
  }

  public createTask(input: CreateTaskInput, userId: string = 'default'): Task {
    const newTask: Task = {
      id: 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      user_id: userId,
      name: input.name,
      description: input.description || '',
      status: input.status || 'To Do',
      place: input.place || 'Personal',
      progress_done: input.progress_done || 0,
      progress_total: input.progress_total || 1,
      due_at: input.due_at || null,
      remind_at: input.remind_at || null,
      ringtone: input.ringtone || 'chime',
      tags: input.tags || [],
      attachment_count: input.attachment_count || 0,
      comment_count: input.comment_count || 0,
      assignees: input.assignees || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = this.getTasks();
    this.saveTasks([newTask, ...current]);
    return newTask;
  }

  public updateTask(id: string, input: UpdateTaskInput): Task {
    const current = this.getTasks();
    let updatedTask: Task | null = null;
    const updated = current.map((t) => {
      if (t.id === id) {
        updatedTask = { ...t, ...input, updated_at: new Date().toISOString() };
        return updatedTask;
      }
      return t;
    });

    if (!updatedTask) {
      updatedTask = {
        id,
        user_id: 'default',
        name: input.name || 'Task',
        description: input.description || '',
        status: input.status || 'To Do',
        place: input.place || 'Personal',
        progress_done: input.progress_done || 0,
        progress_total: input.progress_total || 1,
        ringtone: 'chime',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...input,
      } as Task;
      updated.unshift(updatedTask);
    }

    this.saveTasks(updated);
    return updatedTask;
  }

  public deleteTask(id: string): { success: boolean; deleted_id: string } {
    const current = this.getTasks();
    this.saveTasks(current.filter((t) => t.id !== id));
    return { success: true, deleted_id: id };
  }

  public getDashboardStats(): DashboardStats {
    const tasks = this.getTasks();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Complete').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Complete'];
    const places: Place[] = ['College', 'Work', 'Personal'];

    return {
      total_tasks: total,
      completed_percentage: rate,
      count_by_status: statuses.map((s) => ({
        status: s,
        count: tasks.filter((t) => t.status === s).length,
      })),
      count_by_place: places.map((p) => ({
        place: p,
        count: tasks.filter((t) => t.place === p).length,
      })),
      average_progress:
        total > 0
          ? Math.round(
              tasks.reduce(
                (acc, t) =>
                  acc + (t.progress_total > 0 ? (t.progress_done / t.progress_total) * 100 : 0),
                0
              ) / total
            )
          : 0,
    };
  }

  public clearStorage(): void {
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_TASKS);
    localStorage.removeItem(STORAGE_KEYS.IS_OFFLINE);
  }
}

export const offlineStorage = OfflineStorageEngine.getInstance();
