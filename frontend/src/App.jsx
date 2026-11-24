import { useEffect, useState } from 'react';
import {
  listApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from './api.js';

const STATUSES = ['applied', 'interview', 'offer', 'rejected'];
const emptyForm = { company: '', role: '', status: 'applied', notes: '' };

export default function App() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function load() {
    try {
      setItems(await listApplications(filter));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createApplication(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(item, status) {
    try {
      await updateApplication(item.id, { ...item, status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteApplication(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container">
      <h1>Internship Application Tracker</h1>

      <form onSubmit={handleSubmit} className="card form">
        <input
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          required
        />
        <input
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          required
        />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="toolbar">
        <label>
          Filter:{' '}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">all</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <span>{items.length} shown</span>
      </div>

      <ul className="list">
        {items.map((item) => (
          <li key={item.id} className="card item">
            <div>
              <strong>{item.company}</strong> — {item.role}
              <div className="meta">
                Applied {item.applied_on.slice(0, 10)}
                {item.notes ? ` · ${item.notes}` : ''}
              </div>
            </div>
            <div className="actions">
              <select value={item.status} onChange={(e) => handleStatusChange(item, e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button className="danger" onClick={() => handleDelete(item.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="meta">No applications yet.</p>}
      </ul>
    </main>
  );
}
