import api from './api';
import type { Room, CreateRoomRequest, ApiResponse, RoomFilter, PaginationParams } from '../types';

export const roomService = {
  getAllRooms: () => 
    api.get<Room[]>('/rooms/all'),
  
  getAvailableRooms: (startTime?: string, endTime?: string) => 
    api.get<Room[]>('/rooms/available', { params: { startTime, endTime } }),
  
  getRoom: (id: Number) => 
    api.get<Room>(`/rooms/${id}`),
  
  createRoom: (roomData: CreateRoomRequest) => 
    api.post<ApiResponse<Room>>('/rooms', roomData),
  
  updateRoom: (id: string, roomData: Partial<Room>) => 
    api.put<ApiResponse<Room>>(`/rooms/${id}`, roomData),
  
  deleteRoom: (id: string) => 
    api.delete<ApiResponse<null>>(`/rooms/${id}`),
  
  updateRoomStatus: (id: string, status: Room['status']) => 
    api.patch<ApiResponse<Room>>(`/rooms/${id}/status`, { status }),
};