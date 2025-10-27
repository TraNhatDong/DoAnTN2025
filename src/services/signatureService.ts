// src/services/signatureService.ts
import api from './api';
import type {
  Minute,
  GenerateMinuteResponse,
  SignMinuteResponse,
  VerifyResponse,
  VerifyUploadResponse,
  ReleaseResponse,
  ErrorResponse,
  ApiResponse
} from '../types';

export const signatureService = {
  // ------------------- 1. Sinh biên bản PDF từ Meeting + Summary -------------------
  generateMinute: async (meetingId: string): Promise<GenerateMinuteResponse> => {
    const response = await api.post<GenerateMinuteResponse | ErrorResponse>(
      `/api/sign/generate/${meetingId}`
    );
    
    if ('error' in response.data) {
      throw new Error((response.data as ErrorResponse).error);
    }
    
    return response.data as GenerateMinuteResponse;
  },

  // ------------------- 2. Ký biên bản đã generate -------------------
  signMinute: async (minuteId: string): Promise<SignMinuteResponse> => {
    const response = await api.post<SignMinuteResponse | ErrorResponse>(
      `/api/sign/sign/${minuteId}`
    );
    
    if ('error' in response.data) {
      throw new Error((response.data as ErrorResponse).error);
    }
    
    return response.data as SignMinuteResponse;
  },

  // ------------------- 3. Upload + ký ngay file PDF -------------------
  signPdf: async (meetingId: string, file: File): Promise<Minute> => {
    const formData = new FormData();
    formData.append('meetingId', meetingId);
    formData.append('file', file);

    const response = await api.post<Minute>(
      '/api/sign/pdf',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    
    return response.data;
  },

  // ------------------- 4. Verify từ MinIO (path) -------------------
  verifyPaths: async (pdfPath: string, sigPath: string): Promise<VerifyResponse> => {
    const response = await api.get<VerifyResponse>(
      '/api/sign/verify',
      {
        params: { pdfPath, sigPath },
      }
    );
    
    return response.data;
  },

  // ------------------- 5. Verify từ upload file -------------------
  verifyUpload: async (pdfFile: File, sigFile: File): Promise<VerifyUploadResponse> => {
    const formData = new FormData();
    formData.append('pdfFile', pdfFile);
    formData.append('sigFile', sigFile);

    const response = await api.post<VerifyUploadResponse>(
      '/api/sign/verify/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    
    return response.data;
  },

  // ------------------- 6. Xuất public key -------------------
  exportPublicKey: async (): Promise<string> => {
    const response = await api.get<string>('/api/sign/public-key');
    return response.data;
  },

  // ------------------- 7. Download file từ MinIO -------------------
  downloadFile: async (objectName: string): Promise<Blob> => {
    const response = await api.get<Blob>(
      '/api/sign/download',
      {
        params: { objectName },
        responseType: 'blob',
      }
    );
    
    return response.data;
  },

  // ------------------- 8. Phát hành biên bản đã ký -------------------
  releaseMinute: async (minuteId: string): Promise<ReleaseResponse> => {
    const response = await api.post<ReleaseResponse | ErrorResponse>(
      `/api/sign/release/${minuteId}`
    );
    
    if ('error' in response.data) {
      throw new Error((response.data as ErrorResponse).error);
    }
    
    return response.data as ReleaseResponse;
  },
};