/**
 * QuickFix Mock Data
 * Isolated sample dataset for frontend exploration, prototyping, and UI verification.
 */

export const DEMO_USERS = {
  employee: {
    id: 'emp-101',
    name: 'Alex Rivera',
    email: 'alex.rivera@company.com',
    role: 'employee',
    department: 'Operations & Facilities',
    avatar: 'AR',
  },
  admin: {
    id: 'adm-201',
    name: 'Jordan Vance',
    email: 'jordan.vance@quickfix.internal',
    role: 'admin',
    department: 'Maintenance Administration',
    avatar: 'JV',
  },
};

export const MOCK_TICKETS = [
  {
    id: 'TICK-1001',
    title: 'AC unit leaking water on 3rd floor west wing',
    description: 'The ceiling HVAC unit in Room 304 is dripping condensation water onto the work desk and carpet.',
    category: 'HVAC & Climate',
    location: 'Building B, Floor 3, Room 304',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2026-10-09T09:15:00Z',
    updatedAt: '2026-10-09T10:30:00Z',
    employee: {
      id: 'emp-101',
      name: 'Alex Rivera',
      email: 'alex.rivera@company.com',
    },
    technician: {
      id: 'tech-01',
      name: 'Carlos Mendoza',
      specialty: 'HVAC Specialist',
    },
    events: [
      {
        id: 'ev-1',
        type: 'created',
        title: 'Maintenance Request Submitted',
        description: 'Report filed by Alex Rivera regarding HVAC leak.',
        actor: 'Alex Rivera',
        timestamp: '2026-10-09T09:15:00Z',
      },
      {
        id: 'ev-2',
        type: 'assigned',
        title: 'Technician Assigned',
        description: 'Assigned to Carlos Mendoza (HVAC Specialist).',
        actor: 'Admin Jordan Vance',
        timestamp: '2026-10-09T09:45:00Z',
      },
      {
        id: 'ev-3',
        type: 'status_change',
        title: 'Work In Progress',
        description: 'Drain pipe inspection in progress; parts fetched from stockroom.',
        actor: 'Carlos Mendoza',
        timestamp: '2026-10-09T10:30:00Z',
      },
    ],
  },
  {
    id: 'TICK-1002',
    title: 'Main entrance security door sensor not latching',
    description: 'The magnetic sensor on the North lobby access door fails to engage after hours.',
    category: 'Security & Access',
    location: 'Lobby North Entrance',
    priority: 'Critical',
    status: 'Escalated',
    createdAt: '2026-10-08T18:00:00Z',
    updatedAt: '2026-10-09T08:00:00Z',
    employee: {
      id: 'emp-105',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
    },
    technician: {
      id: 'tech-02',
      name: 'David Patel',
      specialty: 'Electrical & Access Systems',
    },
    events: [
      {
        id: 'ev-4',
        type: 'created',
        title: 'Ticket Created',
        description: 'Door latch failure reported.',
        actor: 'Sarah Chen',
        timestamp: '2026-10-08T18:00:00Z',
      },
      {
        id: 'ev-5',
        type: 'escalated',
        title: 'Escalated to High Priority Operations',
        description: 'Breached SLA deadline of 4 hours for perimeter security point.',
        actor: 'QuickFix Auto-Escalation Engine',
        timestamp: '2026-10-08T22:00:00Z',
      },
    ],
  },
  {
    id: 'TICK-1003',
    title: 'Flickering fluorescent fixtures in conference room 2B',
    description: 'Two overhead ballast lights are humming loudly and flickering intermittently during presentations.',
    category: 'Electrical',
    location: 'Building A, Floor 2, Conf 2B',
    priority: 'Medium',
    status: 'Pending',
    createdAt: '2026-10-09T11:20:00Z',
    updatedAt: '2026-10-09T11:20:00Z',
    employee: {
      id: 'emp-101',
      name: 'Alex Rivera',
      email: 'alex.rivera@company.com',
    },
    technician: null,
    events: [
      {
        id: 'ev-6',
        type: 'created',
        title: 'Ticket Submitted',
        description: 'Waiting for dispatcher triage and assignment.',
        actor: 'Alex Rivera',
        timestamp: '2026-10-09T11:20:00Z',
      },
    ],
  },
  {
    id: 'TICK-1004',
    title: 'Kitchenette sink faucet handle loose and dripping',
    description: 'Cold water tap handle is stripped and leaking around the base seal.',
    category: 'Plumbing',
    location: 'Building C, Breakroom 1',
    priority: 'Low',
    status: 'Resolved',
    createdAt: '2026-10-07T14:10:00Z',
    updatedAt: '2026-10-08T11:45:00Z',
    employee: {
      id: 'emp-108',
      name: 'Marcus Bell',
      email: 'marcus.bell@company.com',
    },
    technician: {
      id: 'tech-03',
      name: 'Elena Rostova',
      specialty: 'Plumbing & Facilities',
    },
    events: [
      {
        id: 'ev-7',
        type: 'created',
        title: 'Ticket Submitted',
        description: 'Reported leaking faucet.',
        actor: 'Marcus Bell',
        timestamp: '2026-10-07T14:10:00Z',
      },
      {
        id: 'ev-8',
        type: 'status_change',
        title: 'Resolved',
        description: 'Replaced cartridge and tightened locking nut.',
        actor: 'Elena Rostova',
        timestamp: '2026-10-08T11:45:00Z',
      },
    ],
  },
];

export const MOCK_ADMIN_STATS = {
  totalTickets: 42,
  pendingTickets: 12,
  inProgressTickets: 19,
  escalatedTickets: 4,
  resolvedTickets: 7,
  avgResolutionHours: 4.8,
  slaComplianceRate: 92.5,
};
