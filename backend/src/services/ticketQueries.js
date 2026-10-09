const { query } = require('../db/pool');
const { notFound } = require('../utils/AppError');

// Shared SELECT: ticket + creator + technician + computed overdue fields.
// "Overdue" (past SLA deadline & unresolved) is deliberately separate from "Escalated".
const TICKET_SELECT = `
  SELECT t.*,
         cu.name  AS creator_name,  cu.email AS creator_email,
         te.name  AS tech_name,     te.team  AS tech_team, te.email AS tech_email,
         (t.status <> 'Resolved' AND t.sla_deadline < now()) AS is_overdue,
         CASE WHEN t.status <> 'Resolved' AND t.sla_deadline < now()
              THEN FLOOR(EXTRACT(EPOCH FROM (now() - t.sla_deadline)))::int END AS overdue_seconds
    FROM tickets t
    JOIN users cu ON cu.id = t.created_by
    LEFT JOIN technicians te ON te.id = t.assigned_to`;

function formatTicket(r) {
  return {
    id: r.id,
    ticketNumber: r.ticket_number,
    title: r.title,
    description: r.description,
    category: r.category,
    location: r.location,
    priority: r.priority,
    status: r.status,
    createdBy: { id: r.created_by, name: r.creator_name, email: r.creator_email },
    assignedTo: r.assigned_to
      ? { id: r.assigned_to, name: r.tech_name, team: r.tech_team, email: r.tech_email }
      : null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    slaDeadline: r.sla_deadline,
    escalatedAt: r.escalated_at,
    escalationReason: r.escalation_reason,
    resolvedAt: r.resolved_at,
    isOverdue: r.is_overdue,
    overdueSeconds: r.overdue_seconds,
  };
}

/** Fetch one formatted ticket (optionally within a transaction client). */
async function getTicketById(id, client) {
  const run = client ? client.query.bind(client) : query;
  const { rows } = await run(`${TICKET_SELECT} WHERE t.id = $1`, [id]);
  return rows[0] ? formatTicket(rows[0]) : null;
}

/** Fetch a ticket the given user may see; employees only see their own (404 otherwise, no existence leak). */
async function getVisibleTicketOrThrow(id, user) {
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId) || ticketId <= 0) throw notFound('Ticket');
  const ticket = await getTicketById(ticketId);
  if (!ticket || (user.role !== 'admin' && ticket.createdBy.id !== user.id)) throw notFound('Ticket');
  return ticket;
}

module.exports = { TICKET_SELECT, formatTicket, getTicketById, getVisibleTicketOrThrow };
