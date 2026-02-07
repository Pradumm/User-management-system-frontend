import axios from 'axios';
import type { User, UserFormData, ApiResponse, PaginatedResponse } from '../types/User.types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const userApi = {
    getUsers: async (page: number = 1, limit: number = 10, search: string = ''): Promise<PaginatedResponse<User[]>> => {
        const response = await api.get<PaginatedResponse<User[]>>('/users', {
            params: { page, limit, search }
        });
        return response.data;
    },

    getUserById: async (id: string): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data.data;
    },

    createUser: async (userData: UserFormData): Promise<User> => {
        const response = await api.post<ApiResponse<User>>('/users', userData);
        return response.data.data;
    },

    updateUser: async (id: string, userData: UserFormData): Promise<User> => {
        const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
        return response.data.data;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};