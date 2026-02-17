import React from 'react';
import TicketCard from './TicketCard';

function TicketList({ tickets, onUpdated }) {
  if (!tickets.length) {
    return <p className="empty-state">No tickets found.</p>;
  }

  return (
    <div className="ticket-list">
      {tickets.map(ticket => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onUpdated={onUpdated}
        />
      ))}
    </div>
  );
}

export default TicketList;
