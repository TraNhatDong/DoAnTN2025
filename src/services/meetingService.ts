import api from './api';
import type { MeetingParticipant,Meeting, CreateMeetingRequest, UpdateMeetingRequest, ApiResponse, MeetingFilter, PaginationParams } from '../types';

export const meetingService = {
  getAllMeetings: () => api.get<Meeting[]>('/meetings'),
  getMeeting: (id: number) => api.get<Meeting>(`/meetings/${id}`),
  getParticipant: (id: number) => api.get<MeetingParticipant[]>(`/meetings/${id}/participants`),
  
  getUserMeetings: (filters?: MeetingFilter & PaginationParams) => 
    api.get<ApiResponse<Meeting[]>>('/meetings/my-meetings', { params: filters }),
  

  
  createMeeting: (meetingData: CreateMeetingRequest) => 
    api.post<ApiResponse<Meeting>>('/meetings', meetingData),
  
  updateMeeting: (id: string, meetingData: UpdateMeetingRequest) => 
    api.put<ApiResponse<Meeting>>(`/meetings/${id}`, meetingData),
  
  deleteMeeting: (id: string) => 
    api.delete<ApiResponse<null>>(`/meetings/${id}`),
  

  
  addParticipant: (meetingId: string, userId: string) => 
    api.post<ApiResponse<Meeting>>(`/meetings/${meetingId}/participants`, { userId }),
  
  removeParticipant: (meetingId: string, userId: string) => 
    api.delete<ApiResponse<Meeting>>(`/meetings/${meetingId}/participants/${userId}`),
  
  updateMeetingStatus: (meetingId: string, status: Meeting['status']) => 
    api.patch<ApiResponse<Meeting>>(`/meetings/${meetingId}/status`, { status }),
};