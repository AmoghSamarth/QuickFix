const ticketService = require('../services/ticketService');
const adminService = require('../services/adminService');
const { runEscalationCheck } = require('../services/escalationService');
const { parsePagination } = require('../utils/pagination');

exports.listTickets = async (req, res) => {
  const { page, limit } = parsePagination(req.validQuery);
  res.json(await ticketService.listTickets({ filters: req.validQuery, page, limit }));
};

exports.dashboard = async (req, res) => {
  res.json(await adminService.getDashboard());
};

exports.escalations = async (req, res) => {
  const { page, limit } = parsePagination(req.validQuery);
  res.json(await adminService.listEscalations({ filters: req.validQuery, page, limit }));
};

// Demo button: "Run escalation check"
exports.runEscalationCheck = async (req, res) => {
  const result = await runEscalationCheck();
  res.json({
    message: result.escalatedCount
      ? `${result.escalatedCount} ticket(s) escalated`
      : 'No overdue tickets needed escalation',
    ...result,
  });
};

exports.technicians = async (req, res) => {
  res.json({ data: await adminService.listTechnicians(req.query.team) });
};
