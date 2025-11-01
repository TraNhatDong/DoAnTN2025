import React, { useEffect, useState } from "react";
import { Box, Card, Typography, Button, CircularProgress } from "@mui/material";
import { VideoCall, Add } from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import MeetingCard from "./MeetingCard";
import { meetingService } from "../../services/meetingService";
import { userService } from "../../services/userService";
import type { Meeting } from "../../types";

export interface MeetingWithCTName extends Meeting {
  ctName?: string; // Thêm trường tên CT
}

const MeetingList: React.FC = () => {
  const [meetings, setMeetings] = useState<MeetingWithCTName[]>([]);
  const [loading, setLoading] = useState(true);
   const handleCreateMeeting = () => {
    console.log("Tạo cuộc họp mới");
  };


  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const response = await meetingService.getAllMeetings();
        const meetingsData: MeetingWithCTName[] = response.data;

        // Fetch tên CT cho từng meeting
        const meetingsWithCTName = await Promise.all(
          meetingsData.map(async (meeting) => {
            const ct = meeting.participants.find((p) => p.role === "CT");
            console.log("user",ct)
            if (ct) {
              try {
                const userRes = await userService.getUser(ct.userId);
                return { ...meeting, ctName: `${userRes.data.firstName} ${userRes.data.lastName}` };
              } catch {
                return { ...meeting, ctName: "Chưa có" };
              }
            }
            return { ...meeting, ctName: "Chưa có" };
          })
        );

        setMeetings(meetingsWithCTName);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách cuộc họp:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);
  return (
    <MainLayout title="Cuộc họp của tôi">
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" component="h1" fontWeight="bold">
            Danh sách cuộc họp
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateMeeting}
            size="large"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            Tạo cuộc họp mới
          </Button>
        </Box>

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : meetings.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 2,
            }}
          >
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </Box>
        ) : (
          <Card
            sx={{
              p: 5,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              boxShadow: 2,
              borderRadius: 3,
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
