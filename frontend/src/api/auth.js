import axios from 'axios';

// Base URL for API - adjust as needed
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

export const logout = async () => {
  try {
    await axios.post(`${API_BASE_URL}/auth/logout`);
  } catch (error) {
    console.error('Logout error:', error);
  }
};