import { useState, useCallback, useMemo } from 'react';
import type { Task, TaskStatus, Place, CreateTaskInput, UpdateTaskInput } from '../../domain/models';
import { api } from '../../infrastructure/api/apiClient';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await api.getTasks();
      setTasks(fetched);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (input: CreateTaskInput) => {
    const created = await api.createTask(input);
    setTasks((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
    return created;
  }, []);

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput) => {
    const updated = await api.updateTask(id, input);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    // 0ms optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      const updated = await api.updateTask(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch {
      // Re-fetch on error
      const fresh = await api.getTasks();
      setTasks(fresh);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.deleteTask(id);
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const tagsArray: string[] = Array.isArray(task.tags)
        ? task.tags
        : typeof task.tags === 'string'
        ? (() => {
            try {
              const p = JSON.parse(task.tags);
              return Array.isArray(p) ? p : [task.tags];
            } catch {
              return [task.tags];
            }
          })()
        : [];

      const matchSearch =
        searchQuery === '' ||
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tagsArray.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchPlace = selectedPlace === 'All' || task.place === selectedPlace;

      return matchSearch && matchPlace;
    });
  }, [tasks, searchQuery, selectedPlace]);

  return {
    tasks,
    setTasks,
    loading,
    selectedPlace,
    setSelectedPlace,
    searchQuery,
    setSearchQuery,
    filteredTasks,
    loadTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
}
