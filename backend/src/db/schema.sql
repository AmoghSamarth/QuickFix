CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS technicians (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150),
  team       VARCHAR(60) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1001;

CREATE TABLE IF NOT EXISTS tickets (
  id                SERIAL PRIMARY KEY,
  ticket_number     VARCHAR(20) NOT NULL UNIQUE,
  title             VARCHAR(150) NOT NULL,
  description       TEXT NOT NULL,
  category          VARCHAR(40) NOT NULL,
  location          VARCHAR(150) NOT NULL,
  priority          VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status            VARCHAR(20) NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending', 'In Progress', 'Resolved', 'Escalated')),
  created_by        INTEGER NOT NULL REFERENCES users(id),
  assigned_to       INTEGER REFERENCES technicians(id) ON DELETE SET NULL,
  sla_deadline      TIMESTAMPTZ NOT NULL,
  escalated_at      TIMESTAMPTZ,
  escalation_reason TEXT,
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_deadline ON tickets(sla_deadline) WHERE status <> 'Resolved';

-- One row per escalated ticket: the UNIQUE constraint guarantees no duplicate escalation logs.
CREATE TABLE IF NOT EXISTS escalations (
  id           SERIAL PRIMARY KEY,
  ticket_id    INTEGER NOT NULL UNIQUE REFERENCES tickets(id) ON DELETE CASCADE,
  reason       TEXT NOT NULL,
  escalated_to VARCHAR(100) NOT NULL,
  trigger_type VARCHAR(10) NOT NULL CHECK (trigger_type IN ('auto', 'manual')),
  escalated_by INTEGER REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Real events only: powers the activity timeline.
CREATE TABLE IF NOT EXISTS ticket_events (
  id          SERIAL PRIMARY KEY,
  ticket_id   INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  event_type  VARCHAR(30) NOT NULL,
  message     TEXT NOT NULL,
  from_status VARCHAR(20),
  to_status   VARCHAR(20),
  actor_id    INTEGER REFERENCES users(id),
  actor_name  VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_ticket ON ticket_events(ticket_id, created_at);
