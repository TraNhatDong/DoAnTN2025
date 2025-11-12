import api from './api';
import type { MeetingParticipant,Meeting, CreateMeetingRequest, UpdateMeetingRequest, ApiResponse, MeetingFilter, PaginationParams } from '../types';

export const meetingService = {
  getAllMeetings: () => api.get<Meeting[]>('/meetings'),
  getMeeting: (id: number) => api.get<Meeting>(`/meetings/${id}`),
  getParticipant: (id: number) => api.get<MeetingParticipant[]>(`/meetings/${id}/participants`),
  
  getUserMeetings: (filters?: MeetingFilter & PaginationParams) => 
    api.get<ApiResponse<Meeting[]>>('/meetings/my-meetings', { params: filters }),
  

  
  createMeeting: (meetingData: CreateMeetingRequest) => 
    api.post<Meeting>('/meetings', meetingData),
  send: (id: number) =>
  api.post(`/meetings/send?meetingId=${id}`),

  updateMeeting: (id: string, meetingData: UpdateMeetingRequest) => 
    api.put<Meeting>(`/meetings/${id}`, meetingData),
  
 cancelMeeting: (id: number, reason: string) =>
  api.put(`/meetings/${id}/cancel`, null, {
    params: { reason }
  }),
  
  addParticipant: (meetingId: Number, participants: { userId: number, role: string }[]) => 
  api.post(`/meetings/${meetingId}/participants/batch`, participants),
  
  removeParticipant: (meetingId: string, userId: string) => 
    api.delete<ApiResponse<Meeting>>(`/meetings/${meetingId}/participants/${userId}`),
  
  updateMeetingStatus: (meetingId: string, status: Meeting['status']) => 
    api.patch<ApiResponse<Meeting>>(`/meetings/${meetingId}/status`, { status }),
};