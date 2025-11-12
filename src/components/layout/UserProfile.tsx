import React from "react";
import { Box, Typography, Avatar, Divider, Paper, Chip } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../layout/MainLayout";

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <MainLayout title="Thông tin tài khoản">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 700,
          mx: "auto",
          borderRadius: 3,
          backgroundColor: "background.paper",
        }}
      >
        {/* Avatar + Họ tên */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 80,
              height: 80,
              fontSize: "2rem",
              fontWeight: 600,
              mr: 3,
            }}
          >
            {user.firstName?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {user.lastName} {user.firstName}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Thông tin chi tiết */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { label: "Tên đăng nhập", value: user.username },
            { label: "Email", value: user.email },
            { label: "Ngày sinh", value: user.role },
            { label: "Địa chỉ ", value: user.email || "—" },
            { label: "Số điện thoại ", value: user.email || "—" },
          ].map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid",
                borderColor: "divider",
                pb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </MainLayout>
  );
};

export default UserProfile;
