import api from './api';

/**
 * Authentication service handling login, session recovery, and user profile
 */
export const authService = {
  /**
   * Log in with credentials
   * @param {{ email: string, password: string }} credentials 
   * @returns {Promise<{ user: object, token: string }>}
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    if (token) {
      localStorage.setItem('quickfix_token', token);
    }
    if (user) {
      localStorage.setItem('quickfix_user', JSON.stringify(user));
    }
    return response.data;
  },

  /**
   * Log out and clear saved credentials
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('quickfix_token');
      localStorage.removeItem('quickfix_user');
    }
  },

  /**
   * Fetch current authenticated user info
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Update profile information
   */
  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

export default authService;
