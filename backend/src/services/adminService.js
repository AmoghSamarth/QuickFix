const { query } = require('../db/pool');
const { TICKET_SELECT, formatTicket } = require('./ticketQueries');
const { buildPagination } = require('../utils/pagination');

async function getDashboard() {
  const counts = (await query(`
    SELECT count(*)::int AS total,
           count(*) FILTER (WHERE status = 'Pending')::int     AS pending,
           count(*) FILTER (WHERE status = 'In Progress')::int AS in_progress,
           count(*) FILTER (WHERE status = 'Resolved')::int    AS resolved,
           count(*) FILTER (WHERE status = 'Escalated')::int   AS escalated,
           count(*) FILTER (WHERE status <> 'Resolved' AND sla_deadline < now())::int AS overdue,
           count(*) FILTER (WHERE status <> 'Resolved' AND priority = 'Critical')::int AS critical_open
      FROM tickets`)).rows[0];

  const byCategory = (await query(
    `SELECT category AS name, count(*)::int AS count FROM tickets GROUP BY category ORDER BY count DESC`)).rows;
  const byPriority = (await query(
    `SELECT priority AS name, count(*)::int AS count FROM tickets GROUP BY priority`)).rows;

  // Attention list: unresolved tickets that are critical, overdue or escalated
  const attention = (await query(
    `${TICKET_SELECT}
      WHERE t.status <> 'Resolved' AND (t.priority = 'Critical' OR t.sla_deadline < now() OR t.status = 'Escalated')
      ORDER BY (t.status = 'Escalated') DESC, t.sla_deadline ASC LIMIT 10`)).rows;
  const recent = (await query(`${TICKET_SELECT} ORDER BY t.created_at DESC, t.id DESC LIMIT 10`)).rows;

  return {
    metrics: {
      total: counts.total,
      pending: counts.pending,
      inProgress: counts.in_progress,
      resolved: counts.resolved,
      escalated: counts.escalated,
      overdue: counts.overdue,
      criticalOpen: counts.critical_open,
    },
    byCategory,
    byPriority,
    priorityTickets: attention.map(formatTicket),
    recentTickets: recent.map(formatTicket),
  };
}

async function getMySummary(userId) {
  const r = (await query(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE status = 'Pending')::int     AS pending,
            count(*) FILTER (WHERE status = 'In Progress')::int AS in_progress,
            count(*) FILTER (WHERE status = 'Resolved')::int    AS resolved,
            count(*) FILTER (WHERE status = 'Escalated')::int   AS escalated
       FROM tickets WHERE created_by = $1`, [userId])).rows[0];
  return { total: r.total, pending: r.pending, inProgress: r.in_progress, resolved: r.resolved, escalated: r.escalated };
}

async function listEscalations({ filters, page, limit }) {
  const where = [];
  const params = [];
  const add = (sql, v) => { params.push(v); where.push(sql.replace('?', `$${params.length}`)); };
  if (filters.status) add('t.status = ?', filters.status);
  if (filters.category) add('t.category = ?', filters.category);
  if (filters.priority) add('t.priority = ?', filters.priority);
  if (filters.trigger) add('e.trigger_type = ?', filters.trigger);
  if (filters.from) add('e.created_at >= ?', filters.from);
  if (filters.to) add(`e.created_at < (?::date + 1)`, filters.to);
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const base = `FROM escalations e JOIN tickets t ON t.id = e.ticket_id LEFT JOIN users eb ON eb.id = e.escalated_by ${whereSql}`;

  const total = (await query(`SELECT count(*)::int AS n ${base}`, params)).rows[0].n;
  const escRows = (await query(
    `SELECT e.id, e.ticket_id, e.reason, e.escalated_to, e.trigger_type, e.created_at, e.escalated_by, eb.name AS escalated_by_name
       ${base} ORDER BY e.created_at DESC, e.id DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`, params)).rows;

  const ids = escRows.map((e) => e.ticket_id);
  const tickets = ids.length
    ? (await query(`${TICKET_SELECT} WHERE t.id = ANY($1::int[])`, [ids])).rows.map(formatTicket)
    : [];
  const byId = new Map(tickets.map((t) => [t.id, t]));

  const data = escRows.map((e) => {
    const t = byId.get(e.ticket_id);
    return {
      id: e.id,
      ticketId: e.ticket_id,
      ticketNumber: t.ticketNumber,
      title: t.title,
      category: t.category,
      priority: t.priority,
      status: t.status,
      assignedTo: t.assignedTo,
      isOverdue: t.isOverdue,
      overdueSeconds: t.overdueSeconds,
      slaDeadline: t.slaDeadline,
      escalatedAt: e.created_at,
      reason: e.reason,
      escalatedTo: e.escalated_to,
      trigger: e.trigger_type,
      escalatedBy: e.escalated_by ? { id: e.escalated_by, name: e.escalated_by_name } : null,
    };
  });
  return { data, pagination: buildPagination({ page, limit }, total) };
}

async function listTechnicians(team) {
  const { rows } = await query(
    `SELECT te.id, te.name, te.email, te.team,
            (SELECT count(*)::int FROM tickets t WHERE t.assigned_to = te.id AND t.status <> 'Resolved') AS open_tickets
       FROM technicians te ${team ? 'WHERE te.team = $1' : ''} ORDER BY te.team, te.name`,
    team ? [team] : []
  );
  return rows.map((r) => ({ id: r.id, name: r.name, email: r.email, team: r.team, openTickets: r.open_tickets }));
}

module.exports = { getDashboard, getMySummary, listEscalations, listTechnicians };
