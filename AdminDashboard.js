import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';
import TaskCard from './TaskCard';
import StatsBar from './StatsBar';
import './App.css';

const API_BASE = 'http://localhost:5000';

/** Axios instance with Authorization: Bearer <token> on every request */
function useAuthorizedApi(token) {
  return useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return instance;
  }, [token]);
}

const base64UrlDecode = (str) => {
  const base64 = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
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

function AdminDashboard({ onLogout }) {
  const token = useMemo(() => localStorage.getItem('token'), []);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, completionRate: 0, userStats: [] });
  const [statsLoading, setStatsLoading] = useState(true);

  const isAdmin = userInfo?.role === 'Admin';

  const api = useAuthorizedApi(token);

  const fetchStats = async () => {
    if (!isAdmin) return;
    try {
      setStatsLoading(true);
      const res = await api.get('/api/tasks/stats');
      const data = res?.data?.data;
      if (res?.data?.success && data) {
        setStats({
          totalTasks: data.totalTasks ?? 0,
          completedTasks: data.completedTasks ?? 0,
          pendingTasks: data.pendingTasks ?? 0,
          completionRate: data.completionRate ?? 0,
          userStats: Array.isArray(data.userStats) ? data.userStats : [],
        });
      } else {
        console.error('Unexpected stats payload', res);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
      if (err?.response?.status === 401) {
        onLogout?.();
      }
    } finally {
      setStatsLoading(false);
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshTasks = async () => {
    const res = await api.get('/api/tasks');
    return res.data?.data || [];
  };

  const refreshUsers = async () => {
    const res = await api.get('/api/users');
    return res.data?.data || [];
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!isAdmin) {
          setLoading(false);
          return;
        }
        const loadedUsers = await refreshUsers();
        setUsers(loadedUsers);
        const loadedTasks = await refreshTasks();
        setTasks(loadedTasks);
        await fetchStats();
      } catch (err) {
        console.error('Admin dashboard load error:', err);
        if (err?.response?.status === 401) onLogout?.();
        else alert(err?.response?.data?.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    onLogout?.();
  };

  const handleSaveTask = async (payload) => {
    try {
      if (editingTask?._id) {
        await api.put(`/api/tasks/${editingTask._id}`, payload);
      } else {
        await api.post('/api/tasks', payload);
      }

      setEditingTask(null);
      const loadedUsers = await refreshUsers();
      setUsers(loadedUsers);
      const loadedTasks = await refreshTasks();
      setTasks(loadedTasks);
      await fetchStats();
    } catch (err) {
      console.error('Save task error:', err);
      alert(err?.response?.data?.message || 'Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleDelete = async (taskId) => {
    if (!taskId) return;
    const ok = window.confirm('Delete this task?');
    if (!ok) return;

    try {
      await api.delete(`/api/tasks/${taskId}`);
      const loadedUsers = await refreshUsers();
      setUsers(loadedUsers);
      const loadedTasks = await refreshTasks();
      setTasks(loadedTasks);
      await fetchStats();
    } catch (err) {
      console.error('Delete task error:', err);
      alert(err?.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, nextStatus) => {
    if (!taskId) return;
    try {
      await api.put(`/api/tasks/${taskId}`, { status: nextStatus });
      const loadedTasks = await refreshTasks();
      setTasks(loadedTasks);
      await fetchStats();
    } catch (err) {
      console.error('Status update error:', err);
      alert(err?.response?.data?.message || 'Failed to update task status');
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

        <button className="btn btn--primary dashboard-logout" type="button" onClick={handleLogoutClick}>
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-heading">Sprint management</h1>
          <p className="dashboard-subheading">
            Add sprint milestones (e.g. Sprint 1: Foundation), track status, and remove completed work from the grid.
          </p>
        </div>

        {loading ? (
          <div className="loading-state">Loading admin dashboard...</div>
        ) : !isAdmin ? (
          <div className="empty-state">Access denied. Admins only.</div>
        ) : (
          <>
            <StatsBar stats={stats} loading={statsLoading} />
            <section className="dashboard-section">
              <div className="section-title-row">
                <h2 className="section-title">{editingTask ? 'Edit sprint' : 'Add sprint milestone'}</h2>
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
                <h2 className="section-title">Sprint grid</h2>
                <div className="section-count">{tasks.length} milestones</div>
              </div>

              {tasks.length === 0 ? (
                <div className="empty-state">No tasks available.</div>
              ) : (
                <div className="task-grid">
                  {tasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
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

export default AdminDashboard;

