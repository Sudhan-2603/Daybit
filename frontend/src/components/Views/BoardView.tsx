import React from 'react';
import { Task } from '../../types';
import { TaskCard } from '../Kanban/TaskCard';

interface BoardViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onInviteTask: (task: Task) => void;
  onTriggerReminder: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  onRequestNotification?: (task: Task) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onInviteTask,
  onTriggerReminder,
  onToggleComplete,
  onRequestNotification,
}) => {
  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onInvite={onInviteTask}
            onTriggerReminder={onTriggerReminder}
            onToggleComplete={onToggleComplete}
            onRequestNotification={onRequestNotification}
          />
        ))}
      </div>
      {tasks.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          No tasks found matching your filter.
        </div>
      )}
    </div>
  );
};

