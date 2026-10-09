const ticketService = require('../services/ticketService');
const adminService = require('../services/adminService');
const escalationService = require('../services/escalationService');
const { getVisibleTicketOrThrow } = require('../services/ticketQueries');
const { parsePagination } = require('../utils/pagination');

exports.create = async (req, res) => {
  const ticket = await ticketService.createTicket(req.user, req.body);
  res.status(201).json({ message: `Ticket ${ticket.ticketNumber} created`, ticket });
};

exports.listMine = async (req, res) => {
  const { page, limit } = parsePagination(req.validQuery);
  res.json(await ticketService.listTickets({ scopeUserId: req.user.id, filters: req.validQuery, page, limit }));
};

exports.mySummary = async (req, res) => {
  res.json({ summary: await adminService.getMySummary(req.user.id) });
};

exports.getOne = async (req, res) => {
  res.json({ ticket: await getVisibleTicketOrThrow(req.params.id, req.user) });
};

exports.history = async (req, res) => {
  const ticket = await getVisibleTicketOrThrow(req.params.id, req.user);
  res.json({ data: await ticketService.getHistory(ticket.id) });
};

exports.updateStatus = async (req, res) => {
  const ticket = await ticketService.updateStatus(Number(req.params.id), req.body.status, req.user);
  res.json({ message: `Status updated to ${ticket.status}`, ticket });
};

exports.assign = async (req, res) => {
  const ticket = await ticketService.assignTechnician(Number(req.params.id), req.body.technicianId, req.user);
  res.json({ message: `Assigned to ${ticket.assignedTo.name}`, ticket });
};

exports.escalate = async (req, res) => {
  const ticket = await escalationService.escalateManually(Number(req.params.id), req.body.reason, req.user);
  res.json({ message: 'Ticket escalated', ticket });
};
