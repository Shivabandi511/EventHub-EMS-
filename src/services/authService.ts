import api from './api';

export interface LoginRequest  { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; phone?: string; }
export interface AuthResponse  { token: string; user: { id: number; name: string; email: string; phone?: string; role: 'CUSTOMER' | 'ADMIN'; }; }

export const authService = {
  login:    (data: LoginRequest)    => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
};
