export interface User {
  id: string;
  name: string;
  email: string;
  role: 'secretary' | 'member' | 'chairperson';
  avatar?: string;
  department?: string;
  position?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string[];
  status: 'available' | 'occupied' | 'maintenance';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transcript {
  id: string;
  meetingId: string;
  content: string;
  rawText: string;
  confidence: number;
  status: 'processing' | 'completed' | 'failed';
  language: string;
  duration: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  summaryId: string;
  description: string;
  assignedTo: User;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Summary {
  id: string;
  meetingId: string;
  content: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  status: 'processing' | 'completed' | 'failed';
  summaryType: 'executive' | 'detailed' | 'action-oriented';
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  meetingId: string;
  userId: string;
  user: User;
  approved: boolean;
  approvedAt?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudioRecording {
  id: string;
  meetingId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  duration: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  transcript?: Transcript;
  uploadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  organizer: User;
  participants: User[];
  room: Room;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  agenda?: string[];
  transcript?: Transcript;
  summary?: Summary;
  approvals: Approval[];
  audioRecordings: AudioRecording[];
  createdAt: string;
  updatedAt: string;
}

export interface MeetingMinutes {
  id: string;
  meetingId: string;
  content: string;
  version: number;
  status: 'draft' | 'final' | 'signed';
  signedBy?: User;
  signedAt?: string;
  digitalSignature?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'meeting_invite' | 'approval_request' | 'transcript_ready' | 'summary_ready' | 'minutes_ready';
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'secretary' | 'member' | 'chairperson';
  department?: string;
  position?: string;
  phone?: string;
}

export interface CreateMeetingRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  roomId: string;
  participantIds: string[];
  agenda?: string[];
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  roomId?: string;
  participantIds?: string[];
  agenda?: string[];
  status?: Meeting['status'];
}

export interface CreateRoomRequest {
  name: string;
  capacity: number;
  location: string;
  facilities: string[];
  description?: string;
}

// Response Types
export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Progress Event Types
export interface AxiosProgressEvent {
  loaded: number;
  total?: number;
  progress?: number;
  bytes: number;
  rate?: number;
  estimated?: number;
  upload?: boolean;
  download?: boolean;
}

// Filter Types
export interface MeetingFilter {
  status?: Meeting['status'];
  startDate?: string;
  endDate?: string;
  roomId?: string;
  organizerId?: string;
}

export interface RoomFilter {
  status?: Room['status'];
  capacity?: number;
  facilities?: string[];
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
// src/types/signature.ts
export interface Minute {
  id: string;
  meetingId: string;
  pdfPath: string;
  sigPath?: string;
  status: 'draft' | 'signed' | 'released';
  createdAt: string;
  updatedAt: string;
}

export interface GenerateMinuteResponse {
  message: string;
  minuteId: string;
  meetingId: string;
  status: string;
  pdfPath: string;
}

export interface SignMinuteResponse {
  message: string;
  minuteId: string;
  meetingId: string;
  status: string;
  pdfPath: string;
  sigPath: string;
}

export interface VerifyResponse {
  valid: boolean;
  pdfPath?: string;
  sigPath?: string;
  message?: string;
}

export interface VerifyUploadResponse {
  valid: boolean;
  message: string;
}

export interface ReleaseResponse {
  message: string;
  minuteId: string;
  meetingId: string;
  status: string;
  pdfPath: string;
  sigPath: string;
}

export interface ErrorResponse {
  error: string;
}