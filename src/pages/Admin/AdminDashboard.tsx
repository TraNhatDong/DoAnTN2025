import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <MainLayout title="Bảng điều khiển - Admin">
      <Typography variant="h5">Chào mừng Quản trị viên!</Typography>
      <Box mt={3}>
        <Button variant="contained" onClick={() => navigate("/meetings")}>
          Quản lý cuộc họp
        </Button>
      </Box>
    </MainLayout>
  );
};

export default AdminDashboard;
