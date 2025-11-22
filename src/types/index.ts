
export interface MeetingParticipant {
  id: number;
  userId: number;
  role: 'CT' | 'TK' | 'TV'; // Chủ trì, Thư ký, Thành viên
  status: string;           // Ví dụ: 'Approve', 'Pending', 'Reject'
}

export interface ParticipantRequest {
  userId: number;
  role: "CT" | "TK" | "TV";
}

export interface MeetingRequest {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  roomId: number;
  participants: ParticipantRequest[];
}

export interface Meeting {
  id: number;
  name: string;
  description: string;
  status: 'DRAFT' | 'PENDING' |'APPROVED'|'ONGOING'| 'COMPLETED' |'CANCELLED';
  startTime: string;
  endTime: string;
  roomId: number;
  cancelReason?: string | null;
  participants: MeetingParticipant[];
}
export interface User {
  userId: number;           // Long → number
  email: string;
  firstName?: string;       // Có thể null → dùng optional
  lastName?: string;
  address?: string;
  phoneNumber?: string;
  birthday?: string;        // LocalDate → string (ISO format)
  idCard?: string;
  status: 'ACTIVE'|'INACTIVE';
}

export interface Room {
  roomId: number;
  roomName: string;
  capacity: number;
  floor: number;
  status: "AVAI" | "INAVAI";
}

export interface Transcript {
  transcript_id: string;
  meeting_id: string;
  content: string;
  status: "PROCESSING" | "COMPLETED";
  created_by: string;
  created_at: string;
  updated_at: string;
}
export interface TranscriptData {
  transcript_id: string;
  meeting_id: string;
  content: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  created_by: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
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
 

export interface ReviewData {
  review_id: string;
  summary_id: string;
  user_id: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  comment: string | null;
  reviewed_at: string | null;
  handled: boolean | null; 
}

export interface SummaryData {
  summary_id: string;
  meeting_id: string;
  status: "DRAFT" | "PENDING_REVIEW" | "REVISED" | "PENDING_CHAIR_APPROVAL"| "PUBLISHED" | "REVIEWED"|"APPROVED";
  content: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
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
export interface MinuteData {
  pdfPath: string;
  minuteId: string;
  meetingId: string; 
  sigPath?: string;
  createdAt?: string;
  status: "GENERATED" | "SIGNED" | "PUBLISHED";
  
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
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  birthday: string; // hoặc Date nếu bạn parse sang Date object
  idCard: string;
  accountUsername: string;
  accountStatus: "ACTIVE" | "INACTIVE"; // nếu chỉ có 2 trạng thái
  userStatus: "ACTIVE" | "INACTIVE";
  accountId: number;
  role: "USER" | "ADMIN" | "CT" | "TK"; 
}
// src/types/signature.ts
export interface Minute {
  pdfPath: string;      // Đường dẫn tới file PDF
  minuteId: string;     // ID của biên bản
  meetingId: string; 
  sigPath: string;
  createdAt?: string;   // ID của cuộc họp
  status: "GENERATED" |"SIGNED" | "PUBLISHED"; // Các trạng thái có thể có
}

export interface GenerateMinuteResponse {
  message: string;
  minuteId: string;
  meetingId: string;
  status: "GENERATED" |"SIGNED" | "PUBLISHED";
  pdfPath: string;
}

export interface SignMinuteResponse {
  message: string;
  minuteId: string;
  meetingId: string;
  status: "GENERATED" |"SIGNED" | "PUBLISHED";
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
  status: "GENERATED" |"SIGNED" | "PUBLISHED";
  pdfPath: string;
  sigPath: string;
}

export interface ErrorResponse {
  error: string;
}