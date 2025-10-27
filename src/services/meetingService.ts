import api from './api';
import type { Meeting, CreateMeetingRequest, UpdateMeetingRequest, ApiResponse, MeetingFilter, PaginationParams } from '../types';

export const meetingService = {
  getAllMeetings: (filters?: MeetingFilter & PaginationParams) => 
    api.get<ApiResponse<Meeting[]>>('/meetings', { params: filters }),
  
  getUserMeetings: (filters?: MeetingFilter & PaginationParams) => 
    api.get<ApiResponse<Meeting[]>>('/meetings/my-meetings', { params: filters }),
  
  getMeeting: (id: string) => 
    api.get<ApiResponse<Meeting>>(`/meetings/${id}`),
  
  createMeeting: (meetingData: CreateMeetingRequest) => 
    api.post<ApiResponse<Meeting>>('/meetings', meetingData),
  
  updateMeeting: (id: string, meetingData: UpdateMeetingRequest) => 
    api.put<ApiResponse<Meeting>>(`/meetings/${id}`, meetingData),
  
  deleteMeeting: (id: string) => 
    api.delete<ApiResponse<null>>(`/meetings/${id}`),
  
  getCompletedMeetings: () => 
    api.get<ApiResponse<Meeting[]>>('/meetings/completed'),
  
  addParticipant: (meetingId: string, userId: string) => 
    api.post<ApiResponse<Meeting>>(`/meetings/${meetingId}/participants`, { userId }),
  
  removeParticipant: (meetingId: string, userId: string) => 
    api.delete<ApiResponse<Meeting>>(`/meetings/${meetingId}/participants/${userId}`),
  
  updateMeetingStatus: (meetingId: string, status: Meeting['status']) => 
    api.patch<ApiResponse<Meeting>>(`/meetings/${meetingId}/status`, { status }),
};