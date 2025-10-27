// Import real services
import { authService } from './authService';
import { meetingService } from './meetingService';
import { roomService } from './roomService';
import { audioService } from './audioService';
import { userService } from './userService';
import { transcriptService, summaryService, approvalService, minutesService, notificationService } from './otherServices';

// Import mock services
import { mockServices } from './mockApi';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.VITE_API_BASE_URL;

export const services = {
  auth: USE_MOCK_API ? mockServices.auth : authService,
  meeting: USE_MOCK_API ? mockServices.meeting : meetingService,
  room: USE_MOCK_API ? mockServices.room : roomService,
  audio: USE_MOCK_API ? mockServices.audio : audioService,
  user: USE_MOCK_API ? mockServices.user : userService,
  transcript: USE_MOCK_API ? mockServices.transcript : transcriptService,
  summary: USE_MOCK_API ? mockServices.summary : summaryService,
  approval: USE_MOCK_API ? mockServices.approval : approvalService,
  minutes: minutesService,
  notification: notificationService
};

// Export individual services for direct import if needed
export { authService, meetingService, roomService, audioService, userService };
export { transcriptService, summaryService, approvalService, minutesService, notificationService };
export * from './mockApi';