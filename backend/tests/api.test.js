// Integration tests: run against a real PostgreSQL database (TEST_DATABASE_URL).
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/quickfix_test';
process.env.ESCALATION_ON_FETCH = 'false';
process.env.SLA_MODE = 'demo';

const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const { pool } = require('../src/db/pool');
const migrate = require('../src/db/migrate');
const seed = require('../src/db/seed');

let admin, priya, rahul;
const auth = (t) => ({ Authorization: `Bearer ${t}` });
const login = async (email, password) => (await request(app).post('/api/auth/login').send({ email, password })).body.token;

const newTicket = (over = {}) => ({
  title: 'Internet outage in Block A', description: 'The whole floor has lost internet access.',
  category: 'IT & Networking', location: 'Block A - 2nd Floor', priority: 'High', ...over,
});
const create = async (token, over) => (await request(app).post('/api/tickets').set(auth(token)).send(newTicket(over))).body.ticket;

before(async () => {
  await migrate({ drop: true });
  await seed();
  admin = await login('admin@quickfix.com', 'Admin@123');
  priya = await login('priya@quickfix.com', 'Employee@123');
  rahul = await login('rahul@quickfix.com', 'Employee@123');
});
after(() => pool.end());

describe('auth', () => {
  test('login succeeds and /me returns the user with role', async () => {
    const res = await request(app).get('/api/auth/me').set(auth(admin));
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'admin');
  });
  test('wrong password -> 401 generic message', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@quickfix.com', password: 'nope' });
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
  });
  test('missing fields -> 400 with field errors', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    assert.equal(res.status, 400);
    assert.ok(res.body.error.fields.email && res.body.error.fields.password);
  });
  test('protected route without token -> 401', async () => {
    assert.equal((await request(app).get('/api/tickets/my')).status, 401);
  });
  test('garbage token -> 401', async () => {
    assert.equal((await request(app).get('/api/tickets/my').set(auth('abc.def.ghi'))).status, 401);
  });
});

describe('meta', () => {
  test('GET /api/meta exposes enums & transitions', async () => {
    const res = await request(app).get('/api/meta');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.priorities, ['Low', 'Medium', 'High', 'Critical']);
    assert.ok(res.body.transitions['Pending'].includes('In Progress'));
  });
});

describe('ticket creation', () => {
  test('creates ticket with id, Pending status, SLA deadline and auto-assigned IT technician', async () => {
    const res = await request(app).post('/api/tickets').set(auth(priya)).send(newTicket());
    assert.equal(res.status, 201);
    const t = res.body.ticket;
    assert.match(t.ticketNumber, /^QF-\d+$/);
    assert.equal(t.status, 'Pending');
    assert.equal(t.assignedTo.team, 'IT Support');
    const mins = (new Date(t.slaDeadline) - new Date(t.createdAt)) / 60000;
    assert.ok(Math.abs(mins - 3) < 0.1, `High priority demo SLA should be 3 min, got ${mins}`);
    assert.equal(t.isOverdue, false);
  });
  test('validation errors are field-level', async () => {
    const res = await request(app).post('/api/tickets').set(auth(priya)).send({ title: 'x', category: 'Nope' });
    assert.equal(res.status, 400);
    const f = res.body.error.fields;
    assert.ok(f.title && f.description && f.category && f.location && f.priority);
  });
  test('ticket numbers are unique and sequential', async () => {
    const a = await create(priya); const b = await create(priya);
    assert.equal(Number(b.ticketNumber.slice(3)), Number(a.ticketNumber.slice(3)) + 1);
  });
  test('history contains real creation + assignment events', async () => {
    const t = await create(priya);
    const res = await request(app).get(`/api/tickets/${t.id}/history`).set(auth(priya));
    assert.deepEqual(res.body.data.map((e) => e.type), ['created', 'assigned']);
  });
});

describe('access control', () => {
  test('employee sees only own tickets in /my', async () => {
    const res = await request(app).get('/api/tickets/my?limit=100').set(auth(priya));
    assert.ok(res.body.data.length > 0);
    assert.ok(res.body.data.every((t) => t.createdBy.email === 'priya@quickfix.com'));
  });
  test("employee cannot open another employee's ticket (404) or history", async () => {
    const t = await create(rahul);
    assert.equal((await request(app).get(`/api/tickets/${t.id}`).set(auth(priya))).status, 404);
    assert.equal((await request(app).get(`/api/tickets/${t.id}/history`).set(auth(priya))).status, 404);
    assert.equal((await request(app).get(`/api/tickets/${t.id}`).set(auth(admin))).status, 200);
  });
  test('employee cannot use admin endpoints or mutate tickets', async () => {
    const t = await create(priya);
    for (const [m, url, body] of [
      ['get', '/api/admin/tickets'], ['get', '/api/admin/dashboard'], ['get', '/api/admin/escalations'],
      ['post', '/api/admin/escalations/run'],
      ['patch', `/api/tickets/${t.id}/status`, { status: 'In Progress' }],
      ['patch', `/api/tickets/${t.id}/assign`, { technicianId: 1 }],
      ['patch', `/api/tickets/${t.id}/escalate`, { reason: 'please hurry up' }],
    ]) {
      const res = await request(app)[m](url).set(auth(priya)).send(body);
      assert.equal(res.status, 403, `${m} ${url}`);
    }
  });
  test('unknown / non-numeric ticket id -> 404', async () => {
    assert.equal((await request(app).get('/api/tickets/999999').set(auth(admin))).status, 404);
    assert.equal((await request(app).get('/api/tickets/abc').set(auth(admin))).status, 404);
  });
});

describe('admin management', () => {
  test('list with filters, search and pagination', async () => {
    const t = await create(priya, { title: 'Searchable zebra printer jam', category: 'Other', priority: 'Low' });
    const byTitle = await request(app).get('/api/admin/tickets?search=zebra').set(auth(admin));
    assert.equal(byTitle.body.data.length, 1);
    const byNumber = await request(app).get(`/api/admin/tickets?search=${t.ticketNumber}`).set(auth(admin));
    assert.equal(byNumber.body.data[0].id, t.id);
    const filtered = await request(app).get('/api/admin/tickets?status=Escalated&limit=2').set(auth(admin));
    assert.ok(filtered.body.data.every((x) => x.status === 'Escalated'));
    assert.equal(filtered.body.pagination.limit, 2);
    const bad = await request(app).get('/api/admin/tickets?status=Bogus').set(auth(admin));
    assert.equal(bad.status, 400);
  });
  test('assign and reassign technician, logged in history', async () => {
    const t = await create(priya);
    const techs = (await request(app).get('/api/admin/technicians').set(auth(admin))).body.data;
    const other = techs.find((x) => x.id !== t.assignedTo.id);
    const res = await request(app).patch(`/api/tickets/${t.id}/assign`).set(auth(admin)).send({ technicianId: other.id });
    assert.equal(res.status, 200);
    assert.equal(res.body.ticket.assignedTo.id, other.id);
    const again = await request(app).patch(`/api/tickets/${t.id}/assign`).set(auth(admin)).send({ technicianId: other.id });
    assert.equal(again.status, 409);
    const missing = await request(app).patch(`/api/tickets/${t.id}/assign`).set(auth(admin)).send({ technicianId: 99999 });
    assert.equal(missing.status, 404);
  });
  test('valid status transitions and invalid ones are blocked', async () => {
    const t = await create(priya);
    const patch = (status) => request(app).patch(`/api/tickets/${t.id}/status`).set(auth(admin)).send({ status });
    assert.equal((await patch('Resolved')).status, 409);      // Pending -> Resolved not allowed
    assert.equal((await patch('Escalated')).status, 400);     // must use escalate endpoint
    assert.equal((await patch('In Progress')).status, 200);
    const done = await patch('Resolved');
    assert.equal(done.status, 200);
    assert.ok(done.body.ticket.resolvedAt);
    assert.equal((await patch('In Progress')).status, 409);   // resolved is terminal
    assert.equal((await request(app).patch(`/api/tickets/${t.id}/status`).set(auth(admin)).send({ status: 'Nope' })).status, 400);
  });
  test('resolved ticket cannot be reassigned', async () => {
    const t = await create(priya);
    await request(app).patch(`/api/tickets/${t.id}/status`).set(auth(admin)).send({ status: 'In Progress' });
    await request(app).patch(`/api/tickets/${t.id}/status`).set(auth(admin)).send({ status: 'Resolved' });
    const res = await request(app).patch(`/api/tickets/${t.id}/assign`).set(auth(admin)).send({ technicianId: 1 });
    assert.equal(res.status, 409);
  });
});

describe('SLA escalation engine', () => {
  const makeOverdue = (id, minutes = 5) =>
    pool.query(`UPDATE tickets SET sla_deadline = now() - make_interval(mins => $2) WHERE id = $1`, [id, minutes]);

  test('overdue unresolved ticket is auto-escalated once, with reason + log, visible to employee', async () => {
    const t = await create(priya);
    await makeOverdue(t.id);
    const before = (await request(app).get(`/api/tickets/${t.id}`).set(auth(admin))).body.ticket;
    assert.equal(before.isOverdue, true);
    assert.equal(before.status, 'Pending');

    const run = await request(app).post('/api/admin/escalations/run').set(auth(admin));
    assert.equal(run.status, 200);
    assert.ok(run.body.escalated.some((x) => x.id === t.id));

    const after = (await request(app).get(`/api/tickets/${t.id}`).set(auth(priya))).body.ticket;
    assert.equal(after.status, 'Escalated');
    assert.ok(after.escalatedAt);
    assert.match(after.escalationReason, /SLA deadline exceeded/);

    const hist = (await request(app).get(`/api/tickets/${t.id}/history`).set(auth(priya))).body.data;
    assert.equal(hist.filter((e) => e.type === 'escalated').length, 1);

    // running again must not create a duplicate
    const run2 = await request(app).post('/api/admin/escalations/run').set(auth(admin));
    assert.ok(!run2.body.escalated.some((x) => x.id === t.id));
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM escalations WHERE ticket_id = $1', [t.id]);
    assert.equal(rows[0].n, 1);

    const list = (await request(app).get('/api/admin/escalations?limit=100').set(auth(admin))).body.data;
    const entry = list.find((e) => e.ticketId === t.id);
    assert.equal(entry.trigger, 'auto');
    assert.equal(entry.escalatedTo, 'Maintenance Manager');
  });

  test('concurrent checks never duplicate an escalation', async () => {
    const t = await create(priya);
    await makeOverdue(t.id);
    await Promise.all([1, 2, 3].map(() => request(app).post('/api/admin/escalations/run').set(auth(admin))));
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM escalations WHERE ticket_id = $1', [t.id]);
    assert.equal(rows[0].n, 1);
  });

  test('resolved tickets are never escalated and are not shown as overdue', async () => {
    const t = await create(priya);
    await request(app).patch(`/api/tickets/${t.id}/status`).set(auth(admin)).send({ status: 'In Progress' });
    await request(app).patch(`/api/tickets/${t.id}/status`).set(auth(admin)).send({ status: 'Resolved' });
    await makeOverdue(t.id);
    await request(app).post('/api/admin/escalations/run').set(auth(admin));
    const got = (await request(app).get(`/api/tickets/${t.id}`).set(auth(admin))).body.ticket;
    assert.equal(got.status, 'Resolved');
    assert.equal(got.isOverdue, false);
    assert.equal(got.escalatedAt, null);
  });

  test('ticket not yet past deadline is left alone', async () => {
    const t = await create(priya, { priority: 'Low' });
    await request(app).post('/api/admin/escalations/run').set(auth(admin));
    assert.equal((await request(app).get(`/api/tickets/${t.id}`).set(auth(admin))).body.ticket.status, 'Pending');
  });

  test('manual escalation requires a reason, works once, then 409', async () => {
    const t = await create(priya);
    const esc = (body) => request(app).patch(`/api/tickets/${t.id}/escalate`).set(auth(admin)).send(body);
    assert.equal((await esc({})).status, 400);
    const ok = await esc({ reason: 'Employee reports safety risk' });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.ticket.status, 'Escalated');
    assert.equal(ok.body.ticket.escalationReason, 'Employee reports safety risk');
    assert.equal((await esc({ reason: 'again again' })).status, 409);
    // escalated -> In Progress -> Resolved still works and escalation info persists
    await request(app).patch(`/api/tickets/${t.id}/status`).set(auth(admin)).send({ status: 'In Progress' });
    const res = await request(app).patch(`/api/tickets/${t.id}/status`).set(auth(admin)).send({ status: 'Resolved' });
    assert.equal(res.body.ticket.status, 'Resolved');
    assert.ok(res.body.ticket.escalatedAt);
  });

  test('resolved ticket cannot be manually escalated', async () => {
    const t = await create(priya);
    await request(app).patch(`/api/tickets/${t.id}/status`).set(auth(admin)).send({ status: 'In Progress' });
    await request(app).patch(`/api/tickets/${t.id}/status`).set(auth(admin)).send({ status: 'Resolved' });
    const res = await request(app).patch(`/api/tickets/${t.id}/escalate`).set(auth(admin)).send({ reason: 'too late now' });
    assert.equal(res.status, 409);
  });
});

describe('dashboards', () => {
  test('admin dashboard metrics are consistent with the data', async () => {
    const d = (await request(app).get('/api/admin/dashboard').set(auth(admin))).body;
    const m = d.metrics;
    assert.equal(m.total, m.pending + m.inProgress + m.resolved + m.escalated);
    const all = (await request(app).get('/api/admin/tickets?limit=100').set(auth(admin))).body;
    assert.equal(all.pagination.total, m.total);
    assert.ok(d.recentTickets.length > 0 && Array.isArray(d.priorityTickets));
  });
  test('employee summary only counts own tickets', async () => {
    const s = (await request(app).get('/api/tickets/my/summary').set(auth(rahul))).body.summary;
    const mine = (await request(app).get('/api/tickets/my?limit=100').set(auth(rahul))).body;
    assert.equal(s.total, mine.pagination.total);
  });
  test('unknown route -> JSON 404, bad JSON -> 400', async () => {
    assert.equal((await request(app).get('/api/nope')).status, 404);
    const bad = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad');
    assert.equal(bad.status, 400);
  });
});
