import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const api = {
    auth: {
        login: (credentials) => axiosInstance.post('/auth/login', credentials),
        signup: (data) => axiosInstance.post('/auth/signup', data),
    },
    equipment: {
        getAll: async (params) => {
            const response = await axiosInstance.get('/equipment', { params });
            return response.data;
        },
        create: async (data) => {
            const response = await axiosInstance.post('/equipment', data);
            return response.data;
        },
        update: async (id, data) => {
            const response = await axiosInstance.put(`/equipment/${id}`, data);
            return response.data;
        },
        getDetails: async (id) => {
            const response = await axiosInstance.get(`/equipment/${id}/details`);
            return response.data;
        },
        getBadgeCount: async (id) => {
            const response = await axiosInstance.get(`/equipment/${id}/maintenance-badge`);
            return response.data;
        },
        proposeScrap: async (id) => {
            const response = await axiosInstance.post(`/equipment/${id}/scrap-propose`);
            return response.data;
        },
        approveScrap: async (id, approved) => {
            const response = await axiosInstance.post(`/equipment/${id}/scrap-approve`, { approved });
            return response.data;
        }
    },
    requests: {
        getAll: async (params) => {
            const response = await axiosInstance.get('/requests', { params });
            return response.data;
        },
        create: async (data) => {
            const response = await axiosInstance.post('/requests', data);
            return response.data;
        },
        updateStatus: async (id, status) => {
            const response = await axiosInstance.patch(`/requests/${id}/status`, { status });
            return response.data;
        }
    },
    dashboard: {
        getStats: async () => {
            const response = await axiosInstance.get('/dashboard/manager-stats');
            return response.data;
        }
    }
};

// Backwards compatibility if other files import equipmentService directly
export const equipmentService = api.equipment;

export default axiosInstance;
