const bcrypt = require('bcryptjs');
const { pool } = require('./pool');
const migrate = require('./migrate');
const { ESCALATION_TARGET } = require('../config/constants');

const DEMO_PASSWORDS = { admin: 'Admin@123', employee: 'Employee@123' };

const USERS = [
  { name: 'Admin User', email: 'admin@quickfix.com', role: 'admin' },
  { name: 'Priya Sharma', email: 'priya@quickfix.com', role: 'employee' },
  { name: 'Rahul Mehta', email: 'rahul@quickfix.com', role: 'employee' },
  { name: 'Anita Desai', email: 'anita@quickfix.com', role: 'employee' },
];

const TECHNICIANS = [
  { name: 'Arjun Nair', team: 'IT Support' },
  { name: 'Sneha Kulkarni', team: 'IT Support' },
  { name: 'Vikas Patil', team: 'Electrical Team' },
  { name: 'Mohan Rao', team: 'Electrical Team' },
  { name: 'Salim Khan', team: 'Plumbing Team' },
  { name: 'Deepa Joshi', team: 'HVAC Team' },
  { name: 'Ravi Iyer', team: 'HVAC Team' },
  { name: 'Kiran Shah', team: 'Facilities' },
];

const mins = (n) => `now() + make_interval(mins => ${n})`;

async function seed() {
  await migrate();
  const existing = (await pool.query('SELECT count(*)::int AS n FROM users')).rows[0].n;
  if (existing > 0) {
    console.log('Database already has data - run "npm run db:reset" to start fresh.');
    return;
  }

  const userId = {};
  for (const u of USERS) {
    const hash = await bcrypt.hash(DEMO_PASSWORDS[u.role], 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id',
      [u.name, u.email, hash, u.role]
    );
    userId[u.email] = rows[0].id;
  }
  const techId = {};
  for (const t of TECHNICIANS) {
    const email = `${t.name.split(' ')[0].toLowerCase()}@quickfix.com`;
    const { rows } = await pool.query(
      'INSERT INTO technicians (name, email, team) VALUES ($1,$2,$3) RETURNING id', [t.name, email, t.team]);
    techId[t.name] = rows[0].id;
  }

  // created/deadline are minute offsets from now. Long deadlines keep most demo tickets calm;
  // the "overdue" ticket below is what the escalation check will catch.
  const tickets = [
    { by: 'priya@quickfix.com', title: 'Wi-Fi down on 3rd floor', description: 'No wireless connectivity in the east wing since morning. About 15 people affected.',
      category: 'IT & Networking', location: 'Block A - 3rd Floor', priority: 'High', status: 'In Progress', tech: 'Arjun Nair', created: -180, deadline: 2880 },
    { by: 'priya@quickfix.com', title: 'Flickering lights in conference room', description: 'Tube lights in Conference Room B flicker continuously and cause headaches.',
      category: 'Electrical', location: 'Block B - Conference Room B', priority: 'Medium', status: 'Resolved', tech: 'Vikas Patil', created: -2880, deadline: -1440, resolved: -1500 },
    { by: 'rahul@quickfix.com', title: 'Water leakage near pantry', description: 'Water is leaking from the ceiling pipe above the pantry sink and pooling on the floor.',
      category: 'Plumbing', location: 'Block A - Ground Floor Pantry', priority: 'Critical', status: 'Escalated', tech: 'Salim Khan', created: -240, deadline: -120,
      escalatedAgo: -118, reason: 'SLA deadline exceeded by 2 min while ticket was "Pending" (Critical priority). Auto-escalated to Maintenance Manager.' },
    { by: 'rahul@quickfix.com', title: 'AC not cooling in server room', description: 'Server room AC is running but the temperature keeps rising above 28C.',
      category: 'Air Conditioning/HVAC', location: 'Block C - Server Room', priority: 'High', status: 'Pending', tech: 'Deepa Joshi', created: -15, deadline: -5 },
    { by: 'anita@quickfix.com', title: 'Broken chair in Finance area', description: 'Chair at desk F-14 has a broken backrest and is unsafe to use.',
      category: 'Furniture', location: 'Block B - Finance', priority: 'Low', status: 'Pending', tech: 'Kiran Shah', created: -30, deadline: 4320 },
    { by: 'anita@quickfix.com', title: 'Projector not detecting laptops', description: 'HDMI input on the training room projector is not recognised by any laptop.',
      category: 'IT & Networking', location: 'Block A - Training Room', priority: 'Medium', status: 'In Progress', tech: 'Sneha Kulkarni', created: -600, deadline: 1440 },
  ];

  for (const t of tickets) {
    const { rows } = await pool.query(
      `INSERT INTO tickets (ticket_number, title, description, category, location, priority, status, created_by,
                            assigned_to, sla_deadline, created_at, updated_at, resolved_at)
       VALUES ('QF-' || nextval('ticket_number_seq'), $1,$2,$3,$4,$5,$6,$7,$8, ${mins(t.deadline)}, ${mins(t.created)}, ${mins(t.created)},
               ${t.resolved !== undefined ? mins(t.resolved) : 'NULL'})
       RETURNING id`,
      [t.title, t.description, t.category, t.location, t.priority, t.status, userId[t.by], techId[t.tech]]
    );
    const id = rows[0].id;
    const ev = (type, message, from, to, actorId, actorName, offset) =>
      pool.query(
        `INSERT INTO ticket_events (ticket_id, event_type, message, from_status, to_status, actor_id, actor_name, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7, ${mins(offset)})`,
        [id, type, message, from, to, actorId, actorName]);

    await ev('created', 'Ticket created', null, 'Pending', userId[t.by], USERS.find((u) => u.email === t.by).name, t.created);
    await ev('assigned', `Automatically assigned to ${t.tech}`, null, null, null, 'System (auto-assignment)', t.created);
    if (t.status === 'In Progress' || t.status === 'Resolved') {
      await ev('status_changed', 'Status changed from "Pending" to "In Progress"', 'Pending', 'In Progress', userId['admin@quickfix.com'], 'Admin User', t.created + 20);
    }
    if (t.status === 'Resolved') {
      await ev('status_changed', 'Status changed from "In Progress" to "Resolved"', 'In Progress', 'Resolved', userId['admin@quickfix.com'], 'Admin User', t.resolved);
    }
    if (t.status === 'Escalated') {
      await pool.query(
        `INSERT INTO escalations (ticket_id, reason, escalated_to, trigger_type, created_at)
         VALUES ($1,$2,$3,'auto', ${mins(t.escalatedAgo)})`, [id, t.reason, ESCALATION_TARGET]);
      await pool.query(
        `UPDATE tickets SET escalated_at = ${mins(t.escalatedAgo)}, escalation_reason = $2 WHERE id = $1`, [id, t.reason]);
      await ev('escalated', `Escalated to ${ESCALATION_TARGET} (auto): ${t.reason}`, 'Pending', 'Escalated', null, 'System (SLA engine)', t.escalatedAgo);
    }
  }

  console.log('Seeded demo data.');
  console.log('  Admin:    admin@quickfix.com  /  Admin@123');
  console.log('  Employee: priya@quickfix.com  /  Employee@123   (also rahul@, anita@)');
}

module.exports = seed;

if (require.main === module) {
  seed().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => pool.end());
}
