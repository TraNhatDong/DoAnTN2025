import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { Box, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";

const MeetingCalendar: React.FC = () => {
  const navigate = useNavigate();

  // --- Mock dữ liệu cuộc họp ---
  const [meetings] = useState([
    {
      id: "1",
      title: "Họp dự án Alpha",
      start: "2025-10-24T09:00:00",
      end: "2025-10-24T10:30:00",
      location: "Phòng A1",
      description: "Thảo luận tiến độ module quản lý người dùng",
    },
    {
      id: "2",
      title: "Sprint Review - Dự án Bravo",
      start: "2025-10-26T14:00:00",
      end: "2025-10-26T15:30:00",
      location: "Zoom #321",
      description: "Đánh giá kết quả Sprint 5 và kế hoạch tiếp theo",
    },
    {
      id: "3",
      title: "Họp nhóm kỹ thuật",
      start: "2025-10-27T13:00:00",
      end: "2025-10-27T14:00:00",
      location: "Phòng họp B2",
      description: "Phân tích lỗi hệ thống backend",
    },
  ]);

  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);

  const handleEventClick = (info: EventClickArg) => {
    const meeting = meetings.find((m) => m.id === info.event.id);
    if (meeting) setSelectedMeeting(meeting);
  };

  const handleCloseDialog = () => setSelectedMeeting(null);

  return (
    <MainLayout title="Lịch cuộc họp">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          🗓️ Lịch tất cả cuộc họp
        </Typography>
        <Typography color="text.secondary">
          Xem nhanh toàn bộ các cuộc họp của bạn theo ngày, tuần hoặc tháng.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            height="75vh"
            locale="vi"
            events={meetings.map((m) => ({
              id: m.id,
              title: m.title,
              start: m.start,
              end: m.end,
            }))}
            eventClick={handleEventClick}
            dateClick={(arg: DateClickArg) => console.log("Click date:", arg.dateStr)}
          />
        </CardContent>
      </Card>

      {/* --- Hộp thoại chi tiết cuộc họp --- */}
      <Dialog open={!!selectedMeeting} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedMeeting && (
          <>
            <DialogTitle>📋 {selectedMeeting.title}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Thời gian:</strong>{" "}
                {new Date(selectedMeeting.start).toLocaleString("vi-VN")} -{" "}
                {new Date(selectedMeeting.end).toLocaleTimeString("vi-VN")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Địa điểm:</strong> {selectedMeeting.location}
              </Typography>
              <Typography variant="body1">
                <strong>Nội dung:</strong> {selectedMeeting.description}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Đóng</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/meetings/${selectedMeeting.id}`)}
              >
                Xem chi tiết
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </MainLayout>
  );
};

export default MeetingCalendar;
