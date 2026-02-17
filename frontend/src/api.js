const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = {
  // Fetch all tickets, with optional filters
  getTickets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/api/tickets/${query ? '?' + query : ''}`)
      .then(r => r.json());
  },

  // Create a new ticket
  createTicket: (data) =>
    fetch(`${BASE_URL}/api/tickets/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json().then(body => ({ ok: r.ok, status: r.status, body }))),

  // Patch a ticket (update status, category, etc.)
  updateTicket: (id, data) =>
    fetch(`${BASE_URL}/api/tickets/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // Get stats
  getStats: () =>
    fetch(`${BASE_URL}/api/tickets/stats/`).then(r => r.json()),

  // LLM classify
  classifyTicket: (description) =>
    fetch(`${BASE_URL}/api/tickets/classify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    }).then(r => r.json()),
};
