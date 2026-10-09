const { query, withTransaction } = require('../db/pool');
const config = require('../config/env');
const { STATUS, TRANSITIONS, CATEGORY_TEAM, SLA_MINUTES } = require('../config/constants');
const { AppError, notFound } = require('../utils/AppError');
const { buildPagination } = require('../utils/pagination');
const { addEvent } = require('./eventService');
const { TICKET_SELECT, formatTicket, getTicketById } = require('./ticketQueries');

const SORTS = {
  newest: 't.created_at DESC, t.id DESC',
  oldest: 't.created_at ASC, t.id ASC',
  priority: `CASE t.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, t.created_at DESC`,
  deadline: 't.sla_deadline ASC, t.id ASC',
};

/** Computes the SLA deadline length (minutes) for a priority in the active SLA mode. */
const slaMinutesFor = (priority) => SLA_MINUTES[config.slaMode][priority];

/** Least-loaded technician in the team that handles the category (null if the team is empty). */
async function pickTechnician(client, category) {
  const team = CATEGORY_TEAM[category];
  const { rows } = await client.query(
    `SELECT te.id, te.name, te.team,
            (SELECT count(*) FROM tickets t WHERE t.assigned_to = te.id AND t.status <> 'Resolved') AS open_count
       FROM technicians te WHERE te.team = $1
      ORDER BY open_count ASC, te.id ASC LIMIT 1`,
    [team]
  );
  return rows[0] || null;
}

async function createTicket(user, input) {
  const id = await withTransaction(async (client) => {
    const tech = await pickTechnician(client, input.category);
    const { rows } = await client.query(
      `INSERT INTO tickets (ticket_number, title, description, category, location, priority, status,
                            created_by, assigned_to, sla_deadline)
       VALUES ('QF-' || nextval('ticket_number_seq'), $1, $2, $3, $4, $5, 'Pending', $6, $7,
               now() + make_interval(mins => $8))
       RETURNING id`,
      [input.title, input.description, input.category, input.location, input.priority,
       user.id, tech ? tech.id : null, slaMinutesFor(input.priority)]
    );
    const ticketId = rows[0].id;
    await addEvent(client, { ticketId, type: 'created', message: 'Ticket created', toStatus: STATUS.PENDING, actor: user });
    if (tech) {
      await addEvent(client, {
        ticketId, type: 'assigned', actor: { id: null, name: 'System (auto-assignment)' },
        message: `Automatically assigned to ${tech.name} (${tech.team}) based on category "${input.category}"`,
      });
    }
    return ticketId;
  });
  return getTicketById(id);
}

/**
 * Lists tickets with filters + pagination. `scopeUserId` restricts results to one employee.
 */
async function listTickets({ scopeUserId, filters, page, limit }) {
  const where = [];
  const params = [];
  const add = (sql, value) => { params.push(value); where.push(sql.replace('?', `$${params.length}`)); };

  if (scopeUserId) add('t.created_by = ?', scopeUserId);
  if (filters.status) add('t.status = ?', filters.status);
  if (filters.category) add('t.category = ?', filters.category);
  if (filters.priority) add('t.priority = ?', filters.priority);
  if (filters.technicianId === 'unassigned') where.push('t.assigned_to IS NULL');
  else if (filters.technicianId) add('t.assigned_to = ?', Number(filters.technicianId));
  if (filters.overdue) where.push(`t.status <> 'Resolved' AND t.sla_deadline < now()`);
  if (filters.escalated) where.push('t.escalated_at IS NOT NULL');
  if (filters.search) {
    params.push(`%${filters.search.replace(/[\\%_]/g, '\\$&')}%`);
    where.push(`(t.ticket_number ILIKE $${params.length} OR t.title ILIKE $${params.length})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = (await query(`SELECT count(*)::int AS n FROM tickets t ${whereSql}`, params)).rows[0].n;
  const orderSql = SORTS[filters.sort] || SORTS.newest;
  const { rows } = await query(
    `${TICKET_SELECT} ${whereSql} ORDER BY ${orderSql} LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
    params
  );
  return { data: rows.map(formatTicket), pagination: buildPagination({ page, limit }, total) };
}

async function updateStatus(ticketId, newStatus, actor) {
  if (newStatus === STATUS.ESCALATED) {
    throw new AppError(400, 'Use PATCH /tickets/:id/escalate to escalate a ticket (a reason is required)', 'USE_ESCALATE_ENDPOINT');
  }
  await withTransaction(async (client) => {
    const { rows } = await client.query('SELECT id, status FROM tickets WHERE id = $1 FOR UPDATE', [ticketId]);
    const t = rows[0];
    if (!t) throw notFound('Ticket');
    const allowed = TRANSITIONS[t.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        409,
        t.status === newStatus
          ? `Ticket is already "${t.status}"`
          : `Cannot change status from "${t.status}" to "${newStatus}"` +
            (allowed.length ? `. Allowed: ${allowed.join(', ')}` : '. This ticket is closed.'),
        'INVALID_TRANSITION'
      );
    }
    await client.query(
      `UPDATE tickets SET status = $2::varchar, updated_at = now(),
              resolved_at = CASE WHEN $2::varchar = 'Resolved' THEN now() ELSE resolved_at END
        WHERE id = $1`,
      [ticketId, newStatus]
    );
    await addEvent(client, {
      ticketId, type: 'status_changed', fromStatus: t.status, toStatus: newStatus, actor,
      message: `Status changed from "${t.status}" to "${newStatus}"`,
    });
  });
  return getTicketById(ticketId);
}

async function assignTechnician(ticketId, technicianId, actor) {
  await withTransaction(async (client) => {
    const { rows } = await client.query('SELECT id, status, assigned_to FROM tickets WHERE id = $1 FOR UPDATE', [ticketId]);
    const t = rows[0];
    if (!t) throw notFound('Ticket');
    if (t.status === STATUS.RESOLVED) throw new AppError(409, 'Resolved tickets cannot be reassigned', 'TICKET_RESOLVED');
    if (t.assigned_to === technicianId) throw new AppError(409, 'This technician is already assigned', 'ALREADY_ASSIGNED');

    const tech = (await client.query('SELECT id, name, team FROM technicians WHERE id = $1', [technicianId])).rows[0];
    if (!tech) throw notFound('Technician');
    const prev = t.assigned_to
      ? (await client.query('SELECT name FROM technicians WHERE id = $1', [t.assigned_to])).rows[0]
      : null;

    await client.query('UPDATE tickets SET assigned_to = $2, updated_at = now() WHERE id = $1', [ticketId, technicianId]);
    await addEvent(client, {
      ticketId, type: 'assigned', actor,
      message: prev
        ? `Reassigned from ${prev.name} to ${tech.name} (${tech.team})`
        : `Assigned to ${tech.name} (${tech.team})`,
    });
  });
  return getTicketById(ticketId);
}

async function getHistory(ticketId) {
  const { rows } = await query(
    `SELECT id, event_type, message, from_status, to_status, actor_id, actor_name, created_at
       FROM ticket_events WHERE ticket_id = $1 ORDER BY created_at ASC, id ASC`,
    [ticketId]
  );
  return rows.map((e) => ({
    id: e.id,
    type: e.event_type,
    message: e.message,
    fromStatus: e.from_status,
    toStatus: e.to_status,
    actor: { id: e.actor_id, name: e.actor_name },
    createdAt: e.created_at,
  }));
}

module.exports = { createTicket, listTickets, updateStatus, assignTechnician, getHistory, slaMinutesFor };
