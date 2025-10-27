// src/services/authService.ts
import api from "./api";
import type { ErrorResponse } from "../types";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  msg: string;
  token: string;
  role: string;
  username: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}

export const authService = {
  // ------------------- 1. Đăng nhập -------------------
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse | ErrorResponse>(
      "/users/login",
      payload
    );

    if ("error" in response.data) {
      throw new Error((response.data as ErrorResponse).error);
    }

    const data = response.data as LoginResponse;

    // Lưu token và thông tin user vào localStorage
    localStorage.setItem("authToken", data.token);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: data.userId,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      })
    );

    return data;
  },

  // ------------------- 2. Đăng xuất -------------------
  logout: (): void => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "/login";
  },

  // ------------------- 3. Lấy thông tin user hiện tại -------------------
  getCurrentUser: (): LoginResponse | null => {
    const userData = localStorage.getItem("userData");
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },
};
