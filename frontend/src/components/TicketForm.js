import React, { useState } from 'react';
import { api } from '../api';

const CATEGORIES = ['billing', 'technical', 'account', 'general'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

function TicketForm({ onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });

  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState(null);

  const handleDescriptionBlur = async () => {
    if (!form.description.trim() || form.description.length < 10) return;

    setClassifying(true);
    try {
      const result = await api.classifyTicket(form.description);

      if (result.suggested_category && result.suggested_priority) {
        setForm(f => ({
          ...f,
          category: result.suggested_category,
          priority: result.suggested_priority,
        }));
        setSuggestion(result);
      }
    } catch (e) {
      console.warn('Classification failed, continuing without suggestion');
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { ok, body } = await api.createTicket(form);

      if (ok) {
        setForm({
          title: '',
          description: '',
          category: 'general',
          priority: 'medium'
        });
        setSuggestion(null);
        onCreated(body);
      } else {
        setError(JSON.stringify(body));
      }
    } catch (e) {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ticket-form">
      {error && <div className="error-banner">{error}</div>}

      {suggestion && (
        <div className="suggestion-banner">
          AI suggested:
          <strong> {suggestion.suggested_category}</strong> /
          <strong> {suggestion.suggested_priority}</strong>
          {' '}— you can override below
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Title *</label>
          <input
            type="text"
            maxLength={200}
            value={form.title}
            onChange={e =>
              setForm(f => ({ ...f, title: e.target.value }))
            }
            placeholder="Brief title for the issue"
            required
          />
        </div>

        <div className="form-field">
          <label>
            Description *
            {classifying && (
              <span className="classifying"> (AI is analyzing...)</span>
            )}
          </label>

          <textarea
            value={form.description}
            onChange={e =>
              setForm(f => ({ ...f, description: e.target.value }))
            }
            onBlur={handleDescriptionBlur}
            placeholder="Describe the issue in detail..."
            rows={5}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Category</label>
            <select
              value={form.category}
              onChange={e =>
                setForm(f => ({ ...f, category: e.target.value }))
              }
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Priority</label>
            <select
              value={form.priority}
              onChange={e =>
                setForm(f => ({ ...f, priority: e.target.value }))
              }
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="submit-btn"
        >
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
}

export default TicketForm;
