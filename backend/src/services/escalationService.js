const { query, withTransaction } = require('../db/pool');
const { STATUS, ESCALATION_TARGET } = require('../config/constants');
const { AppError, notFound } = require('../utils/AppError');
const { formatDuration } = require('../utils/format');
const { addEvent, SYSTEM_ACTOR } = require('./eventService');
const { getTicketById } = require('./ticketQueries');

/**
 * Escalates one ticket inside an open transaction.
 * Rules: resolved tickets never escalate; a ticket escalates at most once (also enforced by a
 * UNIQUE constraint on escalations.ticket_id); auto-escalation requires the SLA deadline to have passed.
 * Returns { escalated: boolean, skipped?: reason }.
 */
async function escalateInTx(client, ticketId, { trigger, actor, reason }) {
  const { rows } = await client.query(
    `SELECT *, (sla_deadline < now()) AS past_deadline,
            EXTRACT(EPOCH FROM (now() - sla_deadline)) AS overdue_secs
       FROM tickets WHERE id = $1 FOR UPDATE`,
    [ticketId]
  );
  const t = rows[0];
  if (!t) throw notFound('Ticket');

  if (t.status === STATUS.RESOLVED) return { escalated: false, skipped: 'resolved' };
  if (t.escalated_at) return { escalated: false, skipped: 'already_escalated' };
  if (trigger === 'auto' && !t.past_deadline) return { escalated: false, skipped: 'not_overdue' };

  const finalReason =
    reason ||
    `SLA deadline exceeded by ${formatDuration(t.overdue_secs)} while ticket was "${t.status}" ` +
      `(${t.priority} priority). Auto-escalated to ${ESCALATION_TARGET}.`;

  const ins = await client.query(
    `INSERT INTO escalations (ticket_id, reason, escalated_to, trigger_type, escalated_by)
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (ticket_id) DO NOTHING RETURNING id`,
    [ticketId, finalReason, ESCALATION_TARGET, trigger, actor.id ?? null]
  );
  if (ins.rowCount === 0) return { escalated: false, skipped: 'already_escalated' };

  await client.query(
    `UPDATE tickets SET status = $2, escalated_at = now(), escalation_reason = $3, updated_at = now() WHERE id = $1`,
    [ticketId, STATUS.ESCALATED, finalReason]
  );
  await addEvent(client, {
    ticketId,
    type: 'escalated',
    message: `Escalated to ${ESCALATION_TARGET} (${trigger}): ${finalReason}`,
    fromStatus: t.status,
    toStatus: STATUS.ESCALATED,
    actor,
  });
  return { escalated: true };
}

/** Manual escalation by an admin (fallback). Throws clear errors instead of silently skipping. */
async function escalateManually(ticketId, reason, actor) {
  const result = await withTransaction((client) => escalateInTx(client, ticketId, { trigger: 'manual', actor, reason }));
  if (!result.escalated) {
    const msg = result.skipped === 'resolved'
      ? 'Resolved tickets cannot be escalated'
      : 'This ticket has already been escalated';
    throw new AppError(409, msg, result.skipped === 'resolved' ? 'TICKET_RESOLVED' : 'ALREADY_ESCALATED');
  }
  return getTicketById(ticketId);
}

let running = null;

/**
 * Finds every unresolved, not-yet-escalated ticket past its SLA deadline and escalates it.
 * Safe to call repeatedly / concurrently (row locks + unique constraint prevent duplicates).
 */
function runEscalationCheck() {
  if (running) return running;
  running = (async () => {
    const { rows } = await query(
      `SELECT id FROM tickets
        WHERE status IN ('Pending', 'In Progress') AND escalated_at IS NULL AND sla_deadline < now()
        ORDER BY sla_deadline`
    );
    const escalated = [];
    for (const { id } of rows) {
      const r = await withTransaction((client) => escalateInTx(client, id, { trigger: 'auto', actor: SYSTEM_ACTOR }));
      if (r.escalated) escalated.push(await getTicketById(id));
    }
    return { checked: rows.length, escalatedCount: escalated.length, escalated };
  })().finally(() => { running = null; });
  return running;
}

module.exports = { runEscalationCheck, escalateManually };
