import React from 'react';
import { Activity } from 'lucide-react';
import './App.css';

function clampPercent(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function formatPercent(n) {
  return `${clampPercent(n).toFixed(2)}%`;
}

function ProgressRing({ percentage, radius = 56, stroke = 10 }) {
  const pct = clampPercent(percentage);
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <svg width={radius * 2} height={radius * 2} className="progress-ring-svg">
      <circle
        className="progress-ring-track"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        className="progress-ring-circle"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="progress-ring-text">
        {clampPercent(percentage).toFixed(0)}%
      </text>
    </svg>
  );
}

function StatsBar({ stats, loading }) {
  const total = stats?.totalTasks ?? 0;
  const completed = stats?.completedTasks ?? 0;
  const pending = stats?.pendingTasks ?? 0;
  const completionRate = clampPercent(stats?.completionRate ?? 0);
  const userStats = Array.isArray(stats?.userStats) ? stats.userStats : [];
  const fullCompletionUserStats = userStats.filter((u) => u.totalTasks > 0 && u.completedTasks === u.totalTasks);

  return (
    <section className="dashboard-section stats-ribbon">
      <div className="stats-card">
        <div className="stats-card__header">
          <Activity size={18} color="#F9A602" />
          <h3>System overview</h3>
        </div>
        <div className="stats-card__value">{loading ? '—' : total}</div>
        <div className="stats-card__meta">
          <span>Pending/In Progress: {loading ? '—' : pending}</span>
          <span>Completed: {loading ? '—' : completed}</span>
        </div>
      </div>

      <div className="stats-card stats-card--ring">
        <div className="stats-card__header">
          <h3>Completion rate</h3>
          <div className="stats-card__sub">{loading ? '—' : formatPercent(completionRate)}</div>
        </div>
        <div className="ring-holder">{loading ? <div className="ring-loading">Loading…</div> : <ProgressRing percentage={completionRate} />}</div>
        {!loading && total > 0 && completed === 0 && (
          <div className="stats-card__hint">Complete one task to start seeing progress in the ring.</div>
        )}
      </div>

      <div className="stats-card stats-card--users">
        <div className="stats-card__header">
          <h3>Top users</h3>
          <div className="stats-card__sub">{loading ? '—' : `${userStats.length} users`}</div>
        </div>

        {loading ? (
          <div className="ring-loading">Loading…</div>
        ) : fullCompletionUserStats.length === 0 ? (
          <div className="user-analytics-empty">No full-completion user stats available yet.</div>
        ) : (
          <ol className="top-users">
            {fullCompletionUserStats.slice(0, 5).map((item) => (
              <li key={String(item.userId)} className="top-users__item">
                <div className="top-users__name">{item.username || 'Unknown'}</div>
                <div className="top-users__meta">
                  <span className="top-users__rate">{formatPercent(item.completionRate ?? 0)}</span>
                  <span className="top-users__counts">
                    {item.completedTasks ?? 0}/{item.totalTasks ?? 0}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

export default StatsBar;

