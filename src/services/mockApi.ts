import type {
  User,
  Meeting,
  Room,
  Transcript,
  Summary,
  ActionItem,
  Approval,
  MeetingMinutes,
  AudioRecording,
  Notification,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  CreateRoomRequest,
  ApiResponse,
  MeetingFilter,
  RoomFilter,
  PaginationParams,
  AxiosProgressEvent
} from '../types';

// Mock Data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Secretary',
    email: 'secretary@company.com',
    role: 'secretary',
    avatar: 'JS',
    department: 'Administration',
    position: 'Executive Secretary',
    phone: '+1234567890',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Alice Member',
    email: 'member@company.com',
    role: 'member',
    avatar: 'AM',
    department: 'Engineering',
    position: 'Senior Developer',
    phone: '+1234567891',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Bob Chairperson',
    email: 'chairperson@company.com',
    role: 'chairperson',
    avatar: 'BC',
    department: 'Management',
    position: 'Department Head',
    phone: '+1234567892',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Conference Room A',
    capacity: 20,
    location: 'Floor 5',
    facilities: ['Projector', 'Whiteboard', 'Video Conference', 'Sound System'],
    status: 'available',
    description: 'Main conference room with advanced AV equipment',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Meeting Room B',
    capacity: 8,
    location: 'Floor 4',
    facilities: ['Monitor', 'Speakerphone'],
    status: 'available',
    description: 'Small meeting room for team discussions',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Board Room',
    capacity: 12,
    location: 'Floor 6',
    facilities: ['Projector', 'Video Conference', 'Catering'],
    status: 'maintenance',
    description: 'Executive board room',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Quarterly Planning Session',
    description: 'Q1 2024 planning and strategy discussion',
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T12:00:00Z',
    organizer: mockUsers[0],
    participants: [mockUsers[1], mockUsers[2]],
    room: mockRooms[0],
    status: 'completed',
    agenda: ['Q1 Review', 'Q2 Planning', 'Budget Discussion'],
    approvals: [],
    audioRecordings: [],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: '2',
    title: 'Team Sync Meeting',
    description: 'Weekly team synchronization',
    startTime: '2024-01-16T14:00:00Z',
    endTime: '2024-01-16T15:00:00Z',
    organizer: mockUsers[0],
    participants: [mockUsers[1]],
    room: mockRooms[1],
    status: 'completed',
    agenda: ['Project Updates', 'Blockers Discussion', 'Next Steps'],
    approvals: [],
    audioRecordings: [],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-16T15:00:00Z'
  },
  {
    id: '3',
    title: 'Project Kickoff',
    description: 'New project initiation meeting',
    startTime: '2024-01-20T09:00:00Z',
    endTime: '2024-01-20T11:00:00Z',
    organizer: mockUsers[2],
    participants: [mockUsers[0], mockUsers[1]],
    room: mockRooms[0],
    status: 'scheduled',
    agenda: ['Project Scope', 'Team Roles', 'Timeline'],
    approvals: [],
    audioRecordings: [],
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z'
  }
];

const mockUploadHistory: AudioRecording[] = [
  {
    id: '1',
    meetingId: '1',
    fileName: 'quarterly_planning.mp3',
    fileSize: 25485764,
    fileType: 'audio/mpeg',
    duration: 7200,
    status: 'completed',
    progress: 100,
    createdAt: '2024-01-15T12:30:00Z',
    updatedAt: '2024-01-15T13:00:00Z'
  },
  {
    id: '2',
    meetingId: '2',
    fileName: 'team_sync.wav',
    fileSize: 15485764,
    fileType: 'audio/wav',
    duration: 3600,
    status: 'processing',
    progress: 75,
    createdAt: '2024-01-16T15:30:00Z',
    updatedAt: '2024-01-16T15:45:00Z'
  }
];

// Mock API functions
const createMockResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message
});

const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock Auth Services
export const mockAuthService = {
  login: async (credentials: LoginRequest) => {
    await simulateDelay(1000);
    const user = mockUsers.find(u => u.email === credentials.email && credentials.password === 'password');
    if (user) {
      return { data: createMockResponse<LoginResponse>({
        token: 'mock-jwt-token',
        user,
        expiresIn: 3600
      }) };
    }
    throw new Error('Invalid credentials');
  },

  getProfile: async () => {
    await simulateDelay(500);
    return { data: createMockResponse(mockUsers[0]) };
  }
};

// Mock Meeting Services
export const mockMeetingService = {
  getAllMeetings: async () => {
    await simulateDelay(800);
    return { data: createMockResponse(mockMeetings) };
  },

  getUserMeetings: async () => {
    await simulateDelay(600);
    return { data: createMockResponse(mockMeetings) };
  },

  getCompletedMeetings: async () => {
    await simulateDelay(400);
    const completedMeetings = mockMeetings.filter(m => m.status === 'completed');
    return { data: createMockResponse(completedMeetings) };
  },

  getMeeting: async (id: string) => {
    await simulateDelay(300);
    const meeting = mockMeetings.find(m => m.id === id);
    if (meeting) {
      return { data: createMockResponse(meeting) };
    }
    throw new Error('Meeting not found');
  }
};

// Mock Room Services
export const mockRoomService = {
  getAllRooms: async () => {
    await simulateDelay(500);
    return { data: createMockResponse(mockRooms) };
  },

  getAvailableRooms: async () => {
    await simulateDelay(400);
    const availableRooms = mockRooms.filter(r => r.status === 'available');
    return { data: createMockResponse(availableRooms) };
  }
};

// Mock Audio Services
export const mockAudioService = {
  uploadAudio: async (meetingId: string, formData: FormData, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) => {
    // Simulate upload progress
    if (onUploadProgress) {
      const total = 100;
      for (let i = 0; i <= total; i += 10) {
        setTimeout(() => {
          const progressEvent: AxiosProgressEvent = {
            loaded: i,
            total: total,
            progress: i / total,
            bytes: i * 1024,
            upload: true
          };
          onUploadProgress(progressEvent);
        }, i * 50);
      }
    }

    await simulateDelay(2000);
    
    const newRecording: AudioRecording = {
      id: `rec-${Date.now()}`,
      meetingId,
      fileName: (formData.get('audio') as File).name,
      fileSize: (formData.get('audio') as File).size,
      fileType: (formData.get('audio') as File).type,
      duration: 0,
      status: 'uploading',
      progress: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockUploadHistory.unshift(newRecording);

    return { 
      data: createMockResponse({
        jobId: `job-${Date.now()}`,
        status: 'uploaded'
      }) 
    };
  },

  getUploadHistory: async () => {
    await simulateDelay(600);
    return { data: createMockResponse(mockUploadHistory) };
  }
};

// Mock User Services
export const mockUserService = {
  getAllUsers: async () => {
    await simulateDelay(700);
    return { data: createMockResponse(mockUsers) };
  }
};

// Export all mock services
export const mockServices = {
  auth: mockAuthService,
  meeting: mockMeetingService,
  room: mockRoomService,
  audio: mockAudioService,
  user: mockUserService
};