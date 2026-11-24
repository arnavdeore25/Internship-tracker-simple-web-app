const express = require('express');
const cors = require('cors');
const { pool, init } = require('./db');

const STATUSES = ['applied', 'interview', 'offer', 'rejected'];
const app = express();
app.use(cors());
app.use(express.json());

// Validate the body of a create/update request.
function validate(body) {
  const company = (body.company || '').trim();
  const role = (body.role || '').trim();
  const status = body.status || 'applied';
  if (!company || !role) return { error: 'company and role are required' };
  if (!STATUSES.includes(status)) return { error: `status must be one of: ${STATUSES.join(', ')}` };
  return {
    value: { company, role, status, applied_on: body.applied_on || null, notes: body.notes || '' },
  };
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

// List applications, optionally filtered by ?status=
app.get('/api/applications', async (req, res, next) => {
  try {
    const { status } = req.query;
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ error: 'invalid status filter' });
    }
    const result = status
      ? await pool.query('SELECT * FROM applications WHERE status = $1 ORDER BY applied_on DESC, id DESC', [status])
      : await pool.query('SELECT * FROM applications ORDER BY applied_on DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/applications', async (req, res, next) => {
  try {
    const { value, error } = validate(req.body);
    if (error) return res.status(400).json({ error });
    const result = await pool.query(
      `INSERT INTO applications (company, role, status, applied_on, notes)
       VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5) RETURNING *`,
      [value.company, value.role, value.status, value.applied_on, value.notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/applications/:id', async (req, res, next) => {
  try {
    const { value, error } = validate(req.body);
    if (error) return res.status(400).json({ error });
    const result = await pool.query(
      `UPDATE applications
       SET company = $1, role = $2, status = $3, applied_on = COALESCE($4::date, applied_on), notes = $5
       WHERE id = $6 RETURNING *`,
      [value.company, value.role, value.status, value.applied_on, value.notes, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/applications/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM applications WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

// The database may take a few seconds to accept connections, so retry on startup.
async function start() {
  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      await init();
      break;
    } catch (err) {
      console.log(`Waiting for database (attempt ${attempt})...`);
      if (attempt === 20) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`API listening on port ${port}`));
}

start().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});
