import React, { useState } from 'react';
import { api } from '../api';

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

function TicketCard({ ticket, onUpdated }) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    setUpdating(true);
    try {
      const updated = await api.updateTicket(ticket.id, {
        status: e.target.value
      });
      onUpdated(updated);
    } finally {
      setUpdating(false);
    }
  };

  const truncate = (str, n = 150) =>
    str.length > n ? str.slice(0, n) + '...' : str;

  return (
    <div className={`ticket-card priority-${ticket.priority}`}>
      <div className="ticket-header">
        <h3 className="ticket-title">{ticket.title}</h3>

        <div className="ticket-badges">
          <span className={`badge category-${ticket.category}`}>
            {ticket.category}
          </span>
          <span className={`badge priority-badge-${ticket.priority}`}>
            {ticket.priority}
          </span>
        </div>
      </div>

      <p className="ticket-desc">{truncate(ticket.description)}</p>

      <div className="ticket-footer">
        <span className="ticket-time">
          {new Date(ticket.created_at).toLocaleString()}
        </span>

        <select
          value={ticket.status}
          onChange={handleStatusChange}
          disabled={updating}
          className="status-select"
        >
          {STATUS_ORDER.map(s => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default TicketCard;
