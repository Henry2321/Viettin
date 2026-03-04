// Chờ generate domain xong rồi cập nhật URL thực
const API_BASE_URL = "https://viettin-production-757f.up.railway.app";

export const apiClient = {
  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // AI Try-on
  async aiTryon(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-tryon`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error('AI Try-on failed:', error);
      throw error;
    }
  },

  // Root endpoint
  async getStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Get status failed:', error);
      throw error;
    }
  },
};
