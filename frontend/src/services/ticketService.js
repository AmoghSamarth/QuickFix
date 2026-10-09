import api from './api';

/**
 * Service for managing maintenance requests from an employee perspective
 */
export const ticketService = {
  /**
   * Fetch tickets created by the current employee
   * @param {object} params - { status, priority, page, limit, search }
   */
  async getEmployeeTickets(params = {}) {
    const response = await api.get('/tickets/my-requests', { params });
    return response.data;
  },

  /**
   * Create a new maintenance ticket
   * @param {object} ticketData - { title, description, category, location, priority, urgency }
   */
  async createTicket(ticketData) {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  /**
   * Fetch specific ticket details by ID
   * @param {string|number} id 
   */
  async getTicketById(id) {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  /**
   * Fetch history/timeline for a ticket
   * @param {string|number} id 
   */
  async getTicketTimeline(id) {
    const response = await api.get(`/tickets/${id}/timeline`);
    return response.data;
  },

  /**
   * Cancel or withdraw a ticket
   * @param {string|number} id 
   */
  async cancelTicket(id) {
    const response = await api.post(`/tickets/${id}/cancel`);
    return response.data;
  },
};

export default ticketService;
