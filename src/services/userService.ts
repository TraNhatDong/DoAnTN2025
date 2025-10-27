import api from './api';
import type { User, ApiResponse, PaginationParams } from '../types';

export const userService = {
  getAllUsers: (params?: PaginationParams) => 
    api.get<ApiResponse<User[]>>('/users', { params }),
  
  getUser: (id: string) => 
    api.get<ApiResponse<User>>(`/users/${id}`),
  
  updateUser: (id: string, userData: Partial<User>) => 
    api.put<ApiResponse<User>>(`/users/${id}`, userData),
  
  deleteUser: (id: string) => 
    api.delete<ApiResponse<null>>(`/users/${id}`),
  
  getUsersByRole: (role: User['role']) => 
    api.get<ApiResponse<User[]>>(`/users/role/${role}`),
};