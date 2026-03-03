// Chờ generate domain xong rồi cập nhật URL thực
const API_BASE_URL = "https://viettin-production.up.railway.app";

export const apiClient = {
  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  // AI Try-on
  async aiTryon(formData) {
    const response = await fetch(`${API_BASE_URL}/ai-tryon`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  // Root endpoint
  async getStatus() {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.json();
  },
};
