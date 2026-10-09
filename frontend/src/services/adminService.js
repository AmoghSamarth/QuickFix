import api from './api';

/**
 * Service for administrator ticket and escalation workflows
 */
export const adminService = {
  /**
   * Fetch all tickets with filters and pagination
   * @param {object} params - { status, priority, technicianId, search, page, limit }
   */
  async getAllTickets(params = {}) {
    const response = await api.get('/admin/tickets', { params });
    return response.data;
  },

  /**
   * Fetch administrator dashboard KPI metrics and summary
   */
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  /**
   * Update the status of any ticket
   * @param {string|number} id 
   * @param {{ status: string, note?: string }} data 
   */
  async updateTicketStatus(id, data) {
    const response = await api.patch(`/admin/tickets/${id}/status`, data);
    return response.data;
  },

  /**
   * Assign a technician to a ticket
   * @param {string|number} id 
   * @param {{ technicianId: string|number, technicianName?: string, notes?: string }} data 
   */
  async assignTechnician(id, data) {
    const response = await api.post(`/admin/tickets/${id}/assign`, data);
    return response.data;
  },

  /**
   * Fetch all escalated or overdue tickets
   * @param {object} params 
   */
  async getEscalations(params = {}) {
    const response = await api.get('/admin/escalations', { params });
    return response.data;
  },

  /**
   * Manually escalate a ticket
   * @param {string|number} id 
   * @param {{ reason: string, urgencyLevel?: string }} data 
   */
  async escalateTicket(id, data) {
    const response = await api.post(`/admin/tickets/${id}/escalate`, data);
    return response.data;
  },
};

export default adminService;
