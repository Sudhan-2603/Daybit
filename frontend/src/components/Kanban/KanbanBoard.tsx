import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import type { Task, TaskStatus } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (status?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onInviteTask: (task: Task) => void;
  onTriggerReminder: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  onRequestNotification?: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'To Do', title: 'To Do' },
  { id: 'In Progress', title: 'In Progress' },
  { id: 'Review', title: 'Review' },
  { id: 'Complete', title: 'Complete' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateTaskStatus,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onInviteTask,
  onTriggerReminder,
  onToggleComplete,
  onRequestNotification,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    let newStatus: TaskStatus | null = null;
    if (overId.startsWith('column-')) {
      newStatus = overId.replace('column-', '') as TaskStatus;
    } else {
      const targetTask = tasks.find((t) => t.id === overId);
      if (targetTask) {
        newStatus = targetTask.status;
      }
    }

    if (newStatus) {
      const currentTask = tasks.find((t) => t.id === activeTaskId);
      if (currentTask && currentTask.status !== newStatus) {
        onUpdateTaskStatus(activeTaskId, newStatus);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full pb-8 animate-linear-enter">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 items-start gap-4 px-4 sm:px-6 py-6">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id);
            return (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={columnTasks}
                onAddTask={onAddTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onInviteTask={onInviteTask}
                onTriggerReminder={onTriggerReminder}
                onToggleComplete={onToggleComplete}
                onRequestNotification={onRequestNotification}
              />
            );
          })}
        </div>
      </div>

      {/* Floating preview during drag */}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="rotate-2 scale-102 shadow-2xl transition-transform duration-150 ease-linear">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              onInvite={() => {}}
              onTriggerReminder={() => {}}
              onToggleComplete={onToggleComplete}
              onRequestNotification={onRequestNotification}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
