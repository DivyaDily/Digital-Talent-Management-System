import React from 'react';

const formatDueDate = (dueDate) => {
  if (!dueDate) return '—';
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

const statusOptions = ['Pending', 'In Progress', 'Completed'];

function TaskCard({ task, isAdmin, onEdit, onDelete, onStatusChange, onMarkCompleted }) {
  return (
    <div className={`task-card ${task?.status === 'Completed' ? 'task-card--completed' : ''}`}>
      <div className="task-card__top">
        <div className="task-card__title">
          <h3>{task?.title}</h3>
        </div>

        <div className="task-card__status-row">
          <span className="badge badge--status">{task?.status || 'Pending'}</span>
          {isAdmin && (
            <select
              className="task-status-select"
              value={task?.status || 'Pending'}
              onChange={(e) => onStatusChange?.(task?._id, e.target.value)}
              aria-label="Task status"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <p className="task-card__desc">{task?.description || 'No description provided.'}</p>

      <div className="task-card__meta">
        <div className="meta-item">
          <span className="meta-label">Due:</span> {formatDueDate(task?.dueDate)}
        </div>
        {task?.assignedTo && (
          <div className="meta-item">
            <span className="meta-label">Assigned:</span> {task.assignedTo.name || task.assignedTo.email || task.assignedTo}
          </div>
        )}
      </div>

      <div className="task-card__actions">
        {isAdmin ? (
          <>
            <button className="btn btn--primary" type="button" onClick={() => onEdit?.(task)}>
              Edit
            </button>
            <button className="btn btn--ghost btn--delete" type="button" onClick={() => onDelete?.(task?._id)}>
              Delete
            </button>
          </>
        ) : (
          task?.status !== 'Completed' && (
            <button className="btn btn--accent" type="button" onClick={() => onMarkCompleted?.(task?._id)}>
              Complete Task
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default TaskCard;

