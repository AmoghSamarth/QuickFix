/** Appends a real event to a ticket's activity history. Always call inside the same transaction as the change. */
async function addEvent(client, { ticketId, type, message, fromStatus = null, toStatus = null, actor }) {
  await client.query(
    `INSERT INTO ticket_events (ticket_id, event_type, message, from_status, to_status, actor_id, actor_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [ticketId, type, message, fromStatus, toStatus, actor.id ?? null, actor.name]
  );
}

const SYSTEM_ACTOR = { id: null, name: 'System (SLA engine)' };

module.exports = { addEvent, SYSTEM_ACTOR };
