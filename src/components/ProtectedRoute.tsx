import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  role: "ADMIN" | "USER";
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ role, children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log("🛡️ ProtectedRoute - user:", user, "isLoading:", isLoading, "requiredRole:", role);

  // Đang load user từ context/localStorage
  if (isLoading) {
    console.log("⏳ ProtectedRoute: Đang loading...");
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.1rem",
          color: "#666",
        }}
      >
        Đang tải thông tin người dùng...
      </div>
    );
  }

  // Chưa login → redirect về login và lưu đường dẫn hiện tại
  if (!user) {
    console.log("🔐 ProtectedRoute: Chưa login, redirect đến /login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role không đúng → redirect về home
  if (user.role !== role) {
    console.log("🚫 ProtectedRoute: Role không đúng, redirect đến /");
    return <Navigate to="/" replace />;
  }

  console.log("✅ ProtectedRoute: Cho phép truy cập");
  return <>{children}</>;
};

export default ProtectedRoute;
