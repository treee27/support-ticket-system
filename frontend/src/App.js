import React, { useState, useEffect, useCallback } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import FilterBar from './components/FilterBar';
import StatsDashboard from './components/StatsDashboard';
import { api } from './api';
import './styles/App.css';

function App() {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({});
  const [statsKey, setStatsKey] = useState(0); // bump to refresh stats

  const fetchTickets = useCallback(() => {
    api.getTickets(filters).then(setTickets);
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleTicketCreated = () => {
    fetchTickets();
    setStatsKey(k => k + 1); // auto-refresh stats
  };

  const handleTicketUpdated = (updated) => {
    setTickets(prev =>
      prev.map(t => (t.id === updated.id ? updated : t))
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Support Ticket System</h1>
      </header>

      <main className="app-main">
        <section className="form-section">
          <h2>Submit a Ticket</h2>
          <TicketForm onCreated={handleTicketCreated} />
        </section>

        <section className="stats-section">
          <StatsDashboard key={statsKey} />
        </section>

        <section className="list-section">
          <h2>All Tickets</h2>
          <FilterBar filters={filters} onChange={setFilters} />
          <TicketList tickets={tickets} onUpdated={handleTicketUpdated} />
        </section>
      </main>
    </div>
  );
}

export default App;
