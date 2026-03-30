import React, { useEffect, useState } from 'react';

const statusOptions = ['Pending', 'In Progress', 'Completed'];

const EMPTY_FORM = {
  title: '',
  description: '',
  dueDate: '',
  status: 'Pending',
  assignedTo: '',
};

function TaskForm({ initialTask = null, isEditing = false, onCancel, onSave, users = [] }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!initialTask) {
      setFormData(EMPTY_FORM);
      return;
    }

    const dueDateValue = initialTask?.dueDate ? new Date(initialTask.dueDate).toISOString().slice(0, 10) : '';

    setFormData({
      title: initialTask.title || '',
      description: initialTask.description || '',
      dueDate: dueDateValue,
      status: initialTask.status || 'Pending',
      assignedTo: initialTask.assignedTo || '',
    });
  }, [initialTask]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return alert('Title is required');
    if (!formData.dueDate) return alert('Due Date is required');
    if (!formData.assignedTo) return alert('Assigned To is required for admin task');

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate,
      status: isEditing ? formData.status : 'Pending',
      assignedTo: formData.assignedTo,
    };

    onSave?.(payload);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form-grid">
        <div className="form-field form-field--full">
          <label>Sprint / milestone title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder='e.g. Sprint 1: Foundation or Sprint 2: Core Development'
            required
          />
        </div>

        <div className="form-field">
          <label>Due date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>

        {isEditing && (
          <div className="form-field">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {users.length > 0 && (
          <div className="form-field">
            <label>Assign To</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            >
              <option value="">-- Select team member --</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-field form-field--full">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this sprint milestone"
            rows={4}
          />
        </div>
      </div>

      <div className="task-form-actions">
        <button
          className={isEditing ? 'btn btn--primary' : 'btn btn--add-task'}
          type="submit"
        >
          {isEditing ? 'Update sprint' : 'Add Task'}
        </button>
        {isEditing && (
          <button className="btn btn--ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
