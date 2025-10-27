import React from "react";
import { Box, Card, Typography, Button } from "@mui/material";
import { VideoCall, Add } from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import MeetingCard from "./MeetingCard";
import type { Meeting } from "./MeetingCard";

const meetings: Meeting[] = [
  {
    id: "123",
    title: "INT1306 - Cấu trúc dữ liệu và giải thuật",
    classCode: "D21CQDT01-N",
    teacher: "Minh Ho Nhut",
    time: "09:00 - 11:00",
    date: "Thứ 3, 15/04/2024",
    participants: 24,
    status: "Đang diễn ra",
    room: "Phòng A1"
  },
  {
    id: "2",
    title: "INT2202 - Lập trình hướng đối tượng",
    classCode: "D21CQCN02-B",
    teacher: "Trần Văn Long",
    time: "14:00 - 16:00",
    date: "Thứ 5, 17/04/2024",
    participants: 30,
    status: "Sắp diễn ra",
    room: "Phòng B2"
  },
  {
    id: "3",
    title: "INT3304 - Phát triển ứng dụng web",
    classCode: "D21CQVT03-N",
    teacher: "Lê Thị Hương",
    time: "07:30 - 09:30",
    date: "Thứ 2, 14/04/2024",
    participants: 28,
    status: "Đã kết thúc",
    room: "Phòng C3"
  },
    {
    id: "4",
    title: "INT3304 - Phát triển ứng dụng web",
    classCode: "D21CQVT03-N",
    teacher: "Lê Thị Hương",
    time: "07:30 - 09:30",
    date: "Thứ 2, 14/04/2024",
    participants: 28,
    status: "Đã kết thúc",
    room: "Phòng C3"
  }
];

const MeetingList: React.FC = () => {
  const handleCreateMeeting = () => {
    // Xử lý tạo cuộc họp mới
    console.log("Tạo cuộc họp mới");
    // Có thể mở modal hoặc chuyển hướng đến trang tạo cuộc họp
  };

  return (
    <MainLayout title="Cuộc họp của tôi">
      <Box sx={{ p: 3 }}>
        {/* Header với nút tạo cuộc họp */}
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            mb: 3 
          }}
        >
          <Typography variant="h5" component="h1" fontWeight="bold">
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateMeeting}
            size="large"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3
            }}
          >
            Tạo cuộc họp mới
          </Button>
        </Box>

        {/* Danh sách cuộc họp */}
        {meetings.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 2
            }}
          >
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </Box>
        ) : (
          // Hiển thị khi không có cuộc họp nào
          <Card
            sx={{
              p: 5,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              boxShadow: 2,
              borderRadius: 3
            }}
          >
            <VideoCall sx={{ fontSize: 60, color: "text.secondary" }} />
            <Typography variant="h6">Chưa có cuộc họp nào</Typography>
            <Typography color="text.secondary">
              Bạn chưa tham gia hoặc chưa có cuộc họp được lên lịch.
            </Typography>
          </Card>
        )}
      </Box>
    </MainLayout>
  );
};

export default MeetingList;