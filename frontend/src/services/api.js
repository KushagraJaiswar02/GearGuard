import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

export const equipmentService = {
    getAll: async (params) => {
        const response = await api.get('/equipment', { params });
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/equipment', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/equipment/${id}`, data);
        return response.data;
    },

    getDetails: async (id) => {
        const response = await api.get(`/equipment/${id}/details`);
        return response.data;
    },

    getBadgeCount: async (id) => {
        const response = await api.get(`/equipment/${id}/maintenance-badge`);
        return response.data;
    },

    scrap: async (id) => {
        const response = await api.patch(`/equipment/${id}/scrap`);
        return response.data;
    }
};

export default api;
