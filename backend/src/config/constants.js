// Single source of truth for domain values. Exposed to the frontend via GET /api/meta.

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'IT & Networking',
  'Air Conditioning/HVAC',
  'Furniture',
  'Infrastructure',
  'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  ESCALATED: 'Escalated',
};
const STATUSES = Object.values(STATUS);

// Allowed status transitions. "Escalated" is entered only via escalation (auto or manual),
// never via the plain status endpoint, so an escalation reason is always logged.
// Resolved is terminal (no reopening) - agree with the team if you want to change this.
const TRANSITIONS = {
  [STATUS.PENDING]: [STATUS.IN_PROGRESS, STATUS.ESCALATED],
  [STATUS.IN_PROGRESS]: [STATUS.RESOLVED, STATUS.ESCALATED],
  [STATUS.ESCALATED]: [STATUS.IN_PROGRESS, STATUS.RESOLVED],
  [STATUS.RESOLVED]: [],
};

// Category -> team used for automatic technician assignment
const CATEGORY_TEAM = {
  Electrical: 'Electrical Team',
  Plumbing: 'Plumbing Team',
  'IT & Networking': 'IT Support',
  'Air Conditioning/HVAC': 'HVAC Team',
  Furniture: 'Facilities',
  Infrastructure: 'Facilities',
  Other: 'Facilities',
};

// SLA durations per priority, in minutes.
const SLA_MINUTES = {
  // demo: short deadlines so escalation can be shown live in a 2 minute demo
  demo: { Critical: 2, High: 3, Medium: 4, Low: 5 },
  // standard: realistic deadlines
  standard: { Critical: 4 * 60, High: 8 * 60, Medium: 24 * 60, Low: 72 * 60 },
};

const ESCALATION_TARGET = 'Maintenance Manager';

const ROLES = { EMPLOYEE: 'employee', ADMIN: 'admin' };

module.exports = {
  CATEGORIES, PRIORITIES, STATUS, STATUSES, TRANSITIONS, CATEGORY_TEAM,
  SLA_MINUTES, ESCALATION_TARGET, ROLES,
};
