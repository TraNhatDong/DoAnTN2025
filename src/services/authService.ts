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

export interface User {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export const authService = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    console.log("🔐 authService: Bắt đầu login", payload);
    
    try {
      const response = await api.post<LoginResponse | ErrorResponse>(
        "/users/login",
        payload
      );

      console.log("📡 authService: API response", response.data);

      if ("error" in response.data) {
        console.log("❌ authService: API trả về lỗi", response.data.error);
        throw new Error((response.data as ErrorResponse).error);
      }

      const data = response.data as LoginResponse;
      console.log("✅ authService: Login thành công", data);

      // Lưu token và thông tin user
      localStorage.setItem("authToken", data.token);
      const user: User = {
        userId: data.userId,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      };
      localStorage.setItem("user", JSON.stringify(user));
      console.log("💾 authService: Đã lưu user vào localStorage");

      return data;
    } catch (error) {
      console.error("❌ authService: Lỗi login", error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Lỗi đăng nhập không xác định");
      }
    }
  },
  logout: (): void => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    try {
      return JSON.parse(userData) as User;
    } catch {
      return null;
    }
  },
};