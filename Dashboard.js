import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';
import TaskCard from './TaskCard';
import './App.css';

const API_BASE = 'http://localhost:5000';

const base64UrlDecode = (str) => {
  // base64url -> base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // pad
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(padLength);
  return atob(padded);
};

const decodeJwt = (token) => {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const payload = base64UrlDecode(parts[1]);
  return JSON.parse(payload);
};

const toDateInputValue = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

function Dashboard({ onLogout }) {
  const token = useMemo(() => localStorage.getItem('token'), []);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isAdmin = userInfo?.role === 'Admin';

  useEffect(() => {
    try {
      if (!token) {
        onLogout?.();
        return;
      }
      const decoded = decodeJwt(token);
      setUserInfo(decoded);
    } catch (e) {
      console.error('Token decode error:', e);
      onLogout?.();
    }
  }, [token, onLogout]);

  const authHeader = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const refreshTasks = async () => {
    const res = await axios.get(`${API_BASE}/api/tasks`, { headers: authHeader });
    return res.data?.data || [];
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (!token || !userInfo) {
          onLogout?.();
          return;
        }

        setLoading(true);
        setError('');

        const loadedTasks = await refreshTasks();
        setTasks(loadedTasks);

        if (isAdmin) {
          const usersRes = await axios.get(`${API_BASE}/api/users`, { headers: authHeader });
          setUsers(usersRes.data?.data || []);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        if (err?.response?.status === 401) {
          onLogout?.();
          return;
        }

        setError(err?.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (userInfo) load();
  }, [userInfo, isAdmin, token, authHeader, onLogout]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    onLogout?.();
  };

  const handleSaveTask = async (payload) => {
    try {
      if (editingTask?._id) {
        await axios.put(`${API_BASE}/api/tasks/${editingTask._id}`, payload, {
          headers: authHeader,
        });
      } else {
        await axios.post(`${API_BASE}/api/tasks`, payload, {
          headers: authHeader,
        });
      }

      setEditingTask(null);
      const loadedTasks = await refreshTasks();
      setTasks(loadedTasks);
      setSuccessMessage(`Task ${editingTask ? 'updated' : 'created'} successfully!`);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Save task error:', err);
      setError(err?.response?.data?.message || 'Failed to save task');
    }
  };

  const handleEdit = (task) => {
    const assignedUserId =
      typeof task?.assignedTo === 'object' ? task?.assignedTo?._id : task?.assignedTo;

    setEditingTask({
      _id: task?._id,
      title: task?.title || '',
      description: task?.description || '',
      assignedTo: assignedUserId || '',
      dueDate: toDateInputValue(task?.dueDate),
      status: task?.status || 'Pending',
    });
    // Form is on the page already; no scrolling required.
  };

  const handleDelete = async (taskId) => {
    if (!taskId) return;
    const ok = window.confirm('Delete this task?');
    if (!ok) return;

    try {
      await axios.delete(`${API_BASE}/api/tasks/${taskId}`, { headers: authHeader });
      const loadedTasks = await refreshTasks();
      setTasks(loadedTasks);
      setSuccessMessage('Task deleted successfully 👌');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Delete task error:', err);
      setError(err?.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleMarkCompleted = async (taskId) => {
    if (!taskId) return;
    try {
      await axios.put(
        `${API_BASE}/api/tasks/${taskId}`,
        { status: 'Completed' },
        { headers: authHeader }
      );

      const loadedTasks = await refreshTasks();
      setTasks(loadedTasks);
      setSuccessMessage('Congratulations! You have completed the task with extra toppings! 🍕✨');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Mark completed error:', err);
      setError(err?.response?.data?.message || 'Failed to update task');
    }
  };

  return (
    <div className="dashboard-root">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <img className="dashboard-logo" src="/TAlentGrid.png" alt="TalentGrid Logo" />
          <div className="dashboard-brand-text">
            <div className="brand-title">TalentGrid</div>
            <div className="brand-subtitle">Digital Talent Management System</div>
          </div>
        </div>

        <div className="dashboard-user">
          <div className="user-email">{userInfo?.email || '—'}</div>
          <div className="user-role-badge">{userInfo?.role || ''}</div>
        </div>

        <button className="btn btn--accent dashboard-logout" type="button" onClick={handleLogoutClick}>
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-heading">{isAdmin ? 'Admin Task Management' : 'My Assigned Tasks'}</h1>
          <p className="dashboard-subheading">
            {isAdmin ? 'Create, edit, and manage tasks in a grid view.' : 'Review tasks assigned to you and mark them completed.'}
          </p>
        </div>

        {error && <div className="error-state">{error}</div>}
        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Success</h3>
              <p>{successMessage}</p>
              <button className="btn btn--primary" type="button" onClick={() => setShowSuccessModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading dashboard...</div>
        ) : isAdmin ? (
          <>
            <section className="dashboard-section">
              <div className="section-title-row">
                <h2 className="section-title">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
              </div>

              <TaskForm
                users={users}
                initialTask={editingTask}
                isEditing={!!editingTask}
                onCancel={() => setEditingTask(null)}
                onSave={handleSaveTask}
              />
            </section>

            <section className="dashboard-section">
              <div className="section-title-row">
                <h2 className="section-title">Task Grid</h2>
                <div className="section-count">{tasks.length} tasks</div>
              </div>

              {tasks.length === 0 ? (
                <div className="empty-state">No tasks available.</div>
              ) : (
                <div className="task-grid">
                  {tasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      isAdmin={true}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <section className="dashboard-section">
              <div className="section-title-row">
                <h2 className="section-title">Assigned tasks</h2>
                <div className="section-count">{tasks.filter((t) => t.status !== 'Completed').length} active</div>
              </div>
              {tasks.filter((t) => t.status !== 'Completed').length === 0 ? (
                <div className="empty-state">No active tasks assigned to you.</div>
              ) : (
                <div className="task-grid">
                  {tasks
                    .filter((t) => t.status !== 'Completed')
                    .map((t) => (
                      <TaskCard
                        key={t._id}
                        task={t}
                        isAdmin={false}
                        onMarkCompleted={handleMarkCompleted}
                      />
                    ))}
                </div>
              )}
            </section>

            <section className="dashboard-section">
              <div className="section-title-row">
                <h2 className="section-title">Finished tasks</h2>
                <div className="section-count">{tasks.filter((t) => t.status === 'Completed').length} done</div>
              </div>
              {tasks.filter((t) => t.status === 'Completed').length === 0 ? (
                <div className="empty-state">No finished tasks yet.</div>
              ) : (
                <div className="task-grid">
                  {tasks
                    .filter((t) => t.status === 'Completed')
                    .map((t) => (
                      <TaskCard
                        key={t._id}
                        task={t}
                        isAdmin={false}
                        onMarkCompleted={handleMarkCompleted}
                      />
                    ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

