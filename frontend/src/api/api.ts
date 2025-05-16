import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

const api = {
  // User Management
  login: (username: string, password: string) => 
    axios.post(`${API_URL}accounts/login/`, { username, password }, { withCredentials: true }),
  signup: (username: string, password: string) => 
    axios.post(`${API_URL}accounts/signup/`, { username, password }, { withCredentials: true }),
  logout: () => 
    axios.get(`${API_URL}accounts/logout/`, { withCredentials: true }),

  // Transport Request CRUD
  getTransportRequests: () => 
    axios.get(`${API_URL}services/transport-requests/`, { withCredentials: true }),
  createTransportRequest: (data: any) => 
    axios.post(`${API_URL}services/transport-requests/`, data, { withCredentials: true }),
  updateTransportRequest: (id: number, data: any) => 
    axios.put(`${API_URL}services/transport-requests/${id}/`, data, { withCredentials: true }),
  deleteTransportRequest: (id: number) => 
    axios.delete(`${API_URL}services/transport-requests/${id}/`, { withCredentials: true }),

  // Logs
  getLogs: () => 
    axios.get(`${API_URL}logs/`, { withCredentials: true }),
};

export default api;
