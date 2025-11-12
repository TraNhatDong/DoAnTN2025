import api from './api';
import type { User, ApiResponse, PaginationParams } from '../types';

export const userService = {
  getAllUsers: () => 
    api.get<PaginationParams[]>('/users/active'),
  
  getUser: (id: number) => 
    api.get<User>(`/users/info/${id}`),
  
  updateUser: (id: string, userData: Partial<User>) => 
    api.put<ApiResponse<User>>(`/users/${id}`, userData),
  
  deleteUser: (id: string) => 
    api.delete<ApiResponse<null>>(`/users/${id}`),
  
};