import React, { useState ,useEffect} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { Box, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import type { Meeting } from "../../types";
import { meetingService } from "../../services/meetingService";

const MeetingCalendar: React.FC = () => {
  const navigate = useNavigate();
 const [meetings, setMeetings] = useState<Meeting[]>([]);
 useEffect(() => {
     const fetchMeetings = async () => {
       try {
         const response = await meetingService.getAllMeetings();
         const meetingsData: Meeting[] = response.data;
 
         setMeetings(meetingsData);
       } catch (error) {
         console.error("Lỗi khi lấy danh sách cuộc họp:", error);
       } 
     };
 
     fetchMeetings();
   }, []);
 
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);

  const handleEventClick = (info: EventClickArg) => {
    const meeting = meetings.find((m) => String(m.id) === info.event.id);
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
              id: String(m.id),
              title: m.name,
              start: m.startTime,
              end: m.endTime,
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
            <DialogTitle>📋 {selectedMeeting.name}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Thời gian:</strong>{" "}
                {new Date(selectedMeeting.startTime).toLocaleTimeString("vi-VN")} -{" "}
                {new Date(selectedMeeting.endTime).toLocaleString("vi-VN")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Địa điểm:</strong> {selectedMeeting.roomId}
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
