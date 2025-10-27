import api from './api';
import type { AudioRecording, Transcript, ApiResponse, AxiosProgressEvent } from '../types';

export const audioService = {
  uploadAudio: (meetingId: string, formData: FormData, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) => 
    api.post<ApiResponse<{ jobId: string; status: string }>>(`/audio/upload/${meetingId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  
  getTranscriptionStatus: (jobId: string) => 
    api.get<ApiResponse<{ status: string; transcript?: Transcript }>>(`/audio/status/${jobId}`),
  
  getUploadHistory: () => 
    api.get<ApiResponse<AudioRecording[]>>('/audio/history'),
  
  getRecording: (id: string) => 
    api.get<ApiResponse<AudioRecording>>(`/audio/recordings/${id}`),
  
  deleteRecording: (id: string) => 
    api.delete<ApiResponse<null>>(`/audio/recordings/${id}`),
  
  getRecordingsByMeeting: (meetingId: string) => 
    api.get<ApiResponse<AudioRecording[]>>(`/audio/meetings/${meetingId}/recordings`),
};