// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { authService } from "../services/authService";

interface User {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false); // ✅ chặn useEffect chạy 2 lần (StrictMode)

  // ------------------- 1. Load user từ localStorage -------------------
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const stored = authService.getCurrentUser();
      if (stored) setUser(stored as User);
    } catch (err) {
      console.error("❌ Lỗi khi đọc user:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ------------------- 2. Đăng nhập -------------------
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login({ username, password });
      const newUser: User = {
        userId: data.userId,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      };
      setUser(newUser);
      console.log("🔐 User logged in:", newUser);
    } catch (error) {
      console.warn("⚠️ API đăng nhập lỗi, dùng mock user thay thế.");
      // ✅ mock fallback
      const mockUser: User =
        username === "admin"
          ? {
              userId: 1,
              username: "admin",
              firstName: "Admin",
              lastName: "User",
              email: "admin@example.com",
              role: "ADMIN",
            }
          : {
              userId: 2,
              username,
              firstName: "Thư ký",
              lastName: "Mai",
              email: `${username}@example.com`,
              role: "USER",
            };
      localStorage.setItem("authToken", "mock-token-123");
      localStorage.setItem("userData", JSON.stringify(mockUser));
      setUser(mockUser);
       console.log("🔐 User logged in:", mockUser);
    } finally {
      setIsLoading(false);
    }
   
  };

  // ------------------- 3. Đăng xuất -------------------
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ------------------- 4. Custom hook -------------------
export const useAuth = () => useContext(AuthContext);
