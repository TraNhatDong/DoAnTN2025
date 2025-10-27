import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { MeetingRoleProvider } from "./context/MeetingRoleContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserDashboard from "./pages/User/UserDashboard";
import MeetingList from "./pages/Meetings/MeetingList";
import MeetingDetail from "./pages/Meetings/MeetingDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import MeetingCalendar from "./pages/Meetings/MeetingCalendar";

const RoleRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "ADMIN" ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

const App: React.FC = () => (
  <MeetingRoleProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RoleRedirect />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="USER">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings"
          element={
            <ProtectedRoute role="USER">
              <MeetingList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings/:id"
          element={
            <ProtectedRoute role="USER">
              <MeetingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute role="USER">
              <MeetingCalendar />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </MeetingRoleProvider>
);

export default App;
