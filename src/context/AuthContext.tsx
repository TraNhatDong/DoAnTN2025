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
  login: (username: string, password: string) => Promise<User>; // ✅ Trả về User
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

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

  const login = async (username: string, password: string): Promise<User> => {
  setIsLoading(true);
  try {
    console.log("🔐 AuthContext: Gọi authService.login...");
    const data = await authService.login({ username, password });
    console.log("✅ AuthContext: authService.login thành công", data);
    
    const newUser: User = {
      userId: data.userId,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
    };
    
    setUser(newUser);
    console.log("👤 AuthContext: Đã set user", newUser);
    
    return newUser;
    
  } catch (error) {
    console.error("❌ AuthContext: Lỗi login", error);
    
    // ✅ QUAN TRỌNG: Đảm bảo KHÔNG setUser(null) ở đây
    // ✅ VÀ KHÔNG có navigation nào ở đây
    
    throw error; // Phải throw để component Login bắt được
  } finally {
    setIsLoading(false);
    console.log("🔚 AuthContext: Kết thúc login function");
  }
};

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

export const useAuth = () => useContext(AuthContext);