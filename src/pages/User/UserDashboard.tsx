import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  EventAvailable,
  Assignment,
  Description,
  AddCircleOutline,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  // --- Mock data ---
  const upcomingMeetings = [
    { id: 1, title: "Họp dự án Alpha", time: "24/10/2025 - 09:00", room: "Phòng A" },
    { id: 2, title: "Đánh giá sprint 5", time: "25/10/2025 - 14:00", room: "Zoom #123" },
  ];

  const myTasks = [
    { id: 1, title: "Hoàn thành báo cáo tiến độ", deadline: "26/10/2025", status: "Đang làm" },
    { id: 2, title: "Chuẩn bị tài liệu họp dự án", deadline: "27/10/2025", status: "Chưa bắt đầu" },
  ];

  const recentMinutes = [
    { id: 1, meeting: "Họp dự án Alpha", status: "Chờ phản hồi" },
    { id: 2, meeting: "Đánh giá sprint 4", status: "Đã duyệt" },
  ];

  return (
    <MainLayout title="Bảng điều khiển - Người dùng">
      <Typography variant="h5" gutterBottom>
        👋 Xin chào, đây là bảng điều khiển của bạn
      </Typography>

      {/* --- Thống kê nhanh --- */}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        mt={2}
      >
        {/* Card thống kê 1 */}
        <Box flex="1 1 250px">
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">Cuộc họp sắp tới</Typography>
              <Typography variant="h5" color="primary">
                {upcomingMeetings.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Card thống kê 2 */}
        <Box flex="1 1 250px">
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">Nhiệm vụ của tôi</Typography>
              <Typography variant="h5" color="success.main">
                {myTasks.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Card thống kê 3 */}
        <Box flex="1 1 250px">
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">Biên bản chờ duyệt</Typography>
              <Typography variant="h5" color="warning.main">
                {recentMinutes.filter((m) => m.status === "Chờ phản hồi").length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* --- Cuộc họp sắp tới --- */}
      <Box mt={4}>
        <Typography variant="h6" mb={1} display="flex" alignItems="center" gap={1}>
          <EventAvailable /> Lịch họp sắp tới
        </Typography>
        <Card>
          <CardContent>
            <List>
              {upcomingMeetings.map((m) => (
                <React.Fragment key={m.id}>
                  <ListItem
                    secondaryAction={
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/meetings/${m.id}`)}
                      >
                        Tham gia
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={m.title}
                      secondary={`${m.time} • ${m.room}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* --- Nhiệm vụ của tôi --- */}
      <Box mt={4}>
        <Typography variant="h6" mb={1} display="flex" alignItems="center" gap={1}>
          <Assignment /> Nhiệm vụ của tôi
        </Typography>
        <Card>
          <CardContent>
            <List>
              {myTasks.map((t) => (
                <React.Fragment key={t.id}>
                  <ListItem
                    secondaryAction={
                      <Chip
                        label={t.status}
                        color={
                          t.status === "Hoàn thành"
                            ? "success"
                            : t.status === "Đang làm"
                            ? "info"
                            : "default"
                        }
                      />
                    }
                  >
                    <ListItemText
                      primary={t.title}
                      secondary={`Hạn chót: ${t.deadline}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <Button
              sx={{ mt: 2 }}
              variant="outlined"
              onClick={() => navigate("/tasks")}
            >
              Xem tất cả nhiệm vụ
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* --- Biên bản gần đây --- */}
      <Box mt={4} mb={6}>
        <Typography variant="h6" mb={1} display="flex" alignItems="center" gap={1}>
          <Description /> Biên bản gần đây
        </Typography>
        <Card>
          <CardContent>
            <List>
              {recentMinutes.map((m) => (
                <React.Fragment key={m.id}>
                  <ListItem
                    secondaryAction={
                      <Chip
                        label={m.status}
                        color={m.status === "Đã duyệt" ? "success" : "warning"}
                      />
                    }
                  >
                    <ListItemText primary={m.meeting} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>

            <Button
              sx={{ mt: 2 }}
              variant="outlined"
              onClick={() => navigate("/minutes")}
              startIcon={<AddCircleOutline />}
            >
              Xem tất cả biên bản
            </Button>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default UserDashboard;
