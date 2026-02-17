import React from 'react';

function FilterBar({ filters, onChange }) {
  const set = (key, value) =>
    onChange(prev => ({ ...prev, [key]: value || undefined }));

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search title or description..."
        value={filters.search || ''}
        onChange={e => set('search', e.target.value)}
        className="search-input"
      />

      <select
        value={filters.category || ''}
        onChange={e => set('category', e.target.value)}
      >
        <option value="">All Categories</option>
        {['billing', 'technical', 'account', 'general'].map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.priority || ''}
        onChange={e => set('priority', e.target.value)}
      >
        <option value="">All Priorities</option>
        {['low', 'medium', 'high', 'critical'].map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={filters.status || ''}
        onChange={e => set('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        {['open', 'in_progress', 'resolved', 'closed'].map(s => (
          <option key={s} value={s}>
            {s.replace('_', ' ')}
          </option>
        ))}
      </select>

      <button onClick={() => onChange({})}>
        Clear Filters
      </button>
    </div>
  );
}

export default FilterBar;
