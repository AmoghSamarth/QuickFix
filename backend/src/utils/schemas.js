const { z } = require('zod');
const { CATEGORIES, PRIORITIES, STATUSES } = require('../config/constants');

const text = (label, min, max) =>
  z.string({ error: `${label} is required` }).trim()
    .min(min, min === 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

const oneOf = (label, values) =>
  z.enum(values, { error: `${label} must be one of: ${values.join(', ')}` });

const loginSchema = z.object({
  email: z.string({ error: 'Email is required' }).trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string({ error: 'Password is required' }).min(1, 'Password is required'),
});

const createTicketSchema = z.object({
  title: text('Title', 3, 150),
  description: text('Description', 10, 2000),
  category: oneOf('Category', CATEGORIES),
  location: text('Location', 2, 150),
  priority: oneOf('Priority', PRIORITIES),
});

const statusSchema = z.object({ status: oneOf('Status', STATUSES) });

const assignSchema = z.object({
  technicianId: z.coerce.number({ error: 'technicianId is required' }).int().positive('technicianId is required'),
});

const escalateSchema = z.object({ reason: text('Reason', 5, 500) });

// ---- query strings (all optional) ----
const optional = (schema) => z.preprocess((v) => (v === '' ? undefined : v), schema.optional());
const flag = z.preprocess((v) => (v === undefined || v === '' ? undefined : v === 'true' || v === '1'), z.boolean().optional());

const ticketListQuery = z.object({
  search: optional(z.string().trim().max(100)),
  status: optional(oneOf('status', STATUSES)),
  category: optional(oneOf('category', CATEGORIES)),
  priority: optional(oneOf('priority', PRIORITIES)),
  technicianId: optional(z.union([z.literal('unassigned'), z.coerce.number().int().positive()])),
  overdue: flag,
  escalated: flag,
  sort: optional(z.enum(['newest', 'oldest', 'priority', 'deadline'])),
  page: optional(z.coerce.number().int().min(1)),
  limit: optional(z.coerce.number().int().min(1).max(100)),
});

const escalationListQuery = z.object({
  status: optional(oneOf('status', STATUSES)),
  category: optional(oneOf('category', CATEGORIES)),
  priority: optional(oneOf('priority', PRIORITIES)),
  trigger: optional(z.enum(['auto', 'manual'])),
  from: optional(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be YYYY-MM-DD')),
  to: optional(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be YYYY-MM-DD')),
  page: optional(z.coerce.number().int().min(1)),
  limit: optional(z.coerce.number().int().min(1).max(100)),
});

module.exports = {
  loginSchema, createTicketSchema, statusSchema, assignSchema, escalateSchema,
  ticketListQuery, escalationListQuery,
};
