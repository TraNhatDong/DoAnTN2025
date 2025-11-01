import api from './api';
import type { Review,Transcript, Summary, ActionItem, Approval, MeetingMinutes, Notification, ApiResponse } from '../types';


export const summaryService = {
  getSummary: (meetingId: string) => 
    api.get<Summary>(`/summaries/${meetingId}`),
  getTranscript: (meetingId: string) => 
    api.get<Transcript>(`/summaries/transcripts/${meetingId}`),
  getReviewsBySummary : (summaryId: string) =>
  api.get<Review[]>(`/summaries/summary-reviews/${summaryId}`),
   updateReview : (summaryId: string, userId: string, data: { status?: "PENDING" | "CONFIRMED" | "REJECTED"; comment?: string }) =>
  api.put<Review>(`/summary-reviews/update`, { summary_id: summaryId, user_id: userId, ...data }),
  addReviews : (summaryId: string, reviewers: string[], status: "PENDING" | "CONFIRMED" | "REJECTED" = "PENDING", comment?: string) =>
  api.post<{ message: string; reviews: Review[] }>(`/summary-reviews`, {
    summary_id: summaryId,
    reviewers,
    status,
    comment,
  }),

  
  
  updateSummary: (meetingId: string, content: string, keyPoints?: string[]) => 
    api.put<ApiResponse<Summary>>(`/summary/${meetingId}`, { content, keyPoints }),
  
  getSummaryStatus: (jobId: string) => 
    api.get<ApiResponse<{ status: string; summary?: Summary }>>(`/summary/status/${jobId}`),
  
  updateActionItem: (actionItemId: string, updates: Partial<ActionItem>) => 
    api.put<ApiResponse<ActionItem>>(`/summary/action-items/${actionItemId}`, updates),

  
  generateTranscript: (meetingId: string) => 
    api.post<ApiResponse<{ jobId: string; status: string }>>(`/transcripts/generate/${meetingId}`),
  
  updateTranscript: (meetingId: string, content: string) => 
    api.put<ApiResponse<Transcript>>(`/transcripts/${meetingId}`, { content }),
  
  getTranscriptStatus: (jobId: string) => 
    api.get<ApiResponse<{ status: string; transcript?: Transcript }>>(`/transcripts/status/${jobId}`)
};

export const approvalService = {
  approveTranscript: (meetingId: string, comments?: string) => 
    api.post<ApiResponse<Approval>>(`/approvals/${meetingId}/approve`, { comments }),
  
  rejectTranscript: (meetingId: string, comments: string) => 
    api.post<ApiResponse<Approval>>(`/approvals/${meetingId}/reject`, { comments }),
  
  getApprovals: (meetingId: string) => 
    api.get<ApiResponse<Approval[]>>(`/approvals/${meetingId}`),
  
  getUserApprovals: () => 
    api.get<ApiResponse<Approval[]>>('/approvals/my-approvals'),
};

export const minutesService = {
  generateMinutes: (meetingId: string) => 
    api.post<ApiResponse<{ jobId: string; minutes: MeetingMinutes }>>(`/minutes/generate/${meetingId}`),
  
  getMinutes: (meetingId: string) => 
    api.get<ApiResponse<MeetingMinutes>>(`/minutes/${meetingId}`),
  
  signMinutes: (meetingId: string, signature: string) => 
    api.post<ApiResponse<MeetingMinutes>>(`/minutes/${meetingId}/sign`, { signature }),
  
  downloadMinutes: (meetingId: string) => 
    api.get<Blob>(`/minutes/${meetingId}/download`, { responseType: 'blob' }),
  
  getMinutesHistory: (meetingId: string) => 
    api.get<ApiResponse<MeetingMinutes[]>>(`/minutes/${meetingId}/history`),
};

export const notificationService = {
  getNotifications: () => 
    api.get<ApiResponse<Notification[]>>('/notifications'),
  
  markAsRead: (notificationId: string) => 
    api.patch<ApiResponse<Notification>>(`/notifications/${notificationId}/read`),
  
  markAllAsRead: () => 
    api.patch<ApiResponse<null>>('/notifications/read-all'),
  
  getUnreadCount: () => 
    api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
};