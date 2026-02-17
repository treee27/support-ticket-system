import React, { useState, useEffect } from 'react';
import { api } from '../api';

function StatsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading stats...</p>;
  if (!stats) return <p>Could not load stats.</p>;

  return (
    <div className="stats-dashboard">
      <h2>Stats Dashboard</h2>

      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-num">{stats.total_tickets}</span>
          <span>Total</span>
        </div>

        <div className="stat-box">
          <span className="stat-num">{stats.open_tickets}</span>
          <span>Open</span>
        </div>

        <div className="stat-box">
          <span className="stat-num">{stats.avg_tickets_per_day}</span>
          <span>Avg/Day</span>
        </div>
      </div>

      <div className="breakdown-row">
        <div className="breakdown">
          <h4>By Priority</h4>
          {Object.entries(stats.priority_breakdown).map(([k, v]) => (
            <div key={k} className="breakdown-item">
              <span className="breakdown-label">{k}</span>
              <div
                className="breakdown-bar"
                style={{ width: `${Math.min(v * 10, 200)}px` }}
              />
              <span>{v}</span>
            </div>
          ))}
        </div>

        <div className="breakdown">
          <h4>By Category</h4>
          {Object.entries(stats.category_breakdown).map(([k, v]) => (
            <div key={k} className="breakdown-item">
              <span className="breakdown-label">{k}</span>
              <div
                className="breakdown-bar"
                style={{ width: `${Math.min(v * 10, 200)}px` }}
              />
              <span>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;
