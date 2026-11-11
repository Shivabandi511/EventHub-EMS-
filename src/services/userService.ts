import api from './api';
import type { User } from '../context/AuthContext';

export interface AdminUser extends User {
  createdAt?: string;
  eventsCount?: number;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
}

export const userService = {
  getMe: () => api.get<AdminUser>('/users/me'),
  getAllUsers: () => api.get<AdminUser[]>('/super-admin/users'),
  updateUserRole: (id: number, role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN') =>
    api.patch<AdminUser>(`/super-admin/users/${id}/role`, { role }),
  createUser: (data: CreateAdminPayload) =>
    api.post<AdminUser>('/super-admin/users', data),
};

