const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database (file in ./data/app.db)
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const db = new Database(path.join(dataDir, 'app.db'));

// Create schema if not exists
db.exec(`
create table if not exists events (
  id integer primary key autoincrement,
  title text not null,
  description text,
  date text not null,
  time text not null,
  location text not null,
  type text not null,
  max_participants integer default 100,
  image_url text,
  created_at text default (datetime('now')),
  updated_at text default (datetime('now'))
);

create table if not exists registrations (
  id integer primary key autoincrement,
  event_id integer not null references events(id) on delete cascade,
  student_name text not null,
  student_email text not null,
  student_phone text,
  status text default 'registered',
  check_in_time text,
  created_at text default (datetime('now')),
  updated_at text default (datetime('now'))
);

create index if not exists idx_events_date on events(date);
create index if not exists idx_regs_event on registrations(event_id);
create index if not exists idx_regs_email on registrations(student_email);
`);

function ensureDatabaseSetup() {
  try {
    db.prepare('select 1 from events limit 1').get();
    db.prepare('select 1 from registrations limit 1').get();
    return { ok: true, message: 'SQLite schema ready' };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health endpoint and DB setup check
let startupHealth = { ok: true, message: 'OK' };
app.get('/api/health', async (req, res) => {
  // Re-check on demand
  const status = ensureDatabaseSetup();
  res.status(status.ok ? 200 : 500).json({
    service: 'campus-event-management',
    status: status.ok ? 'ok' : 'error',
    message: status.message
  });
});

// Serve admin portal
app.use('/admin', express.static(path.join(__dirname, 'admin-portal')));

// Serve student app
app.use('/student', express.static(path.join(__dirname, 'student-app')));

// API Routes

// Events API (SQLite)
app.get('/api/events', async (req, res) => {
  try {
    const rows = db.prepare('select * from events order by datetime(created_at) desc').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { title, description, date, time, location, type, max_participants, image_url } = req.body;
    
    // Input validation
    if (!title || !date || !time || !location || !type) {
      return res.status(400).json({ error: 'Missing required fields: title, date, time, location, type' });
    }
    
    if (max_participants && (isNaN(max_participants) || max_participants < 1)) {
      return res.status(400).json({ error: 'max_participants must be a positive number' });
    }
    
    // Normalize time to HH:MM:SS for Postgres time type
    let normalizedTime = time;
    if (/^\d{2}:\d{2}$/.test(normalizedTime)) {
      normalizedTime = `${normalizedTime}:00`;
    }
    if (!/^\d{2}:\d{2}:\d{2}$/.test(normalizedTime)) {
      return res.status(400).json({ error: 'Invalid time format. Use HH:MM or HH:MM:SS' });
    }
    
    const stmt = db.prepare(`
      insert into events (title, description, date, time, location, type, max_participants, image_url)
      values (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      title.trim(),
      description ? description.trim() : null,
      date,
      normalizedTime,
      location.trim(),
      type,
      max_participants || 100,
      image_url ? image_url.trim() : null
    );
    const row = db.prepare('select * from events where id = ?').get(info.lastInsertRowid);
    res.json(row);
  } catch (error) {
    console.error('POST /api/events failed:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = [];
    const values = [];
    Object.keys(updates).forEach((key) => {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    });
    fields.push(`updated_at = datetime('now')`);
    const sql = `update events set ${fields.join(', ')} where id = ?`;
    values.push(id);
    db.prepare(sql).run(...values);
    const row = db.prepare('select * from events where id = ?').get(id);
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('delete from events where id = ?').run(id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrations API
app.post('/api/registrations', async (req, res) => {
  try {
    const { event_id, student_name, student_email, student_phone } = req.body;
    
    // Input validation
    if (!event_id || !student_name || !student_email) {
      return res.status(400).json({ error: 'Missing required fields: event_id, student_name, student_email' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student_email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Check if already registered
    const existing = db.prepare('select * from registrations where event_id = ? and student_email = ?').get(event_id, student_email);
    if (existing) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    
    // Check event capacity
    const event = db.prepare('select max_participants from events where id = ?').get(event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const regCount = db.prepare('select count(*) as c from registrations where event_id = ?').get(event_id).c;
    if (regCount >= event.max_participants) {
      return res.status(400).json({ error: 'Event is full' });
    }
    const info = db.prepare(`
      insert into registrations (event_id, student_name, student_email, student_phone, status)
      values (?, ?, ?, ?, 'registered')
    `).run(event_id, student_name.trim(), student_email.trim().toLowerCase(), student_phone ? student_phone.trim() : null);
    const row = db.prepare('select * from registrations where id = ?').get(info.lastInsertRowid);
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/registrations/:event_id', async (req, res) => {
  try {
    const { event_id } = req.params;
    const rows = db.prepare('select * from registrations where event_id = ? order by datetime(created_at) desc').all(event_id);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all registrations (for admin portal)
app.get('/api/registrations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-in API
app.post('/api/checkin', async (req, res) => {
  try {
    const { event_id, student_email } = req.body;
    const info = db.prepare(`
      update registrations set status = 'checked_in', check_in_time = datetime('now'), updated_at = datetime('now')
      where event_id = ? and student_email = ?
    `).run(event_id, student_email);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    const row = db.prepare('select * from registrations where event_id = ? and student_email = ?').get(event_id, student_email);
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics API
app.get('/api/analytics', async (req, res) => {
  try {
    const events = db.prepare('select id, title, max_participants from events').all();
    const analytics = events.map((e) => {
      const registered = db.prepare('select count(*) as c from registrations where event_id = ?').get(e.id).c;
      const checkedIn = db.prepare("select count(*) as c from registrations where event_id = ? and status = 'checked_in'").get(e.id).c;
      return {
        event_id: e.id,
        event_title: e.title,
        max_participants: e.max_participants,
        registered,
        checked_in: checkedIn,
        attendance_rate: registered > 0 ? Number(((checkedIn / registered) * 100).toFixed(1)) : 0
      };
    });
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  startupHealth = ensureDatabaseSetup();
  if (!startupHealth.ok) {
    console.warn(`⚠️  Startup health warning: ${startupHealth.message}`);
    console.warn('Visit /api/health for details.');
  } else {
    console.log(`✅ Database check: ${startupHealth.message}`);
  }
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin Portal: http://localhost:${PORT}/admin`);
  console.log(`Student App: http://localhost:${PORT}/student`);
});
