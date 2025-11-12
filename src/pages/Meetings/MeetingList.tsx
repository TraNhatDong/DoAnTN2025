import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  VideoCall,
  Add,
  FilterList,
  Clear,
} from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import MeetingCard from "./MeetingCard";
import { meetingService } from "../../services/meetingService";
import { userService } from "../../services/userService";
import type { Meeting } from "../../types";
import { CreateMeetingDialog } from "./CreateMeetingDialog";
import { useAuth } from "../../context/AuthContext";
import { roomService } from "../../services/roomService";
export interface MeetingWithCTName extends Meeting {
  ctName?: string;
  roomName?:string;
  floor?:number;

}

// Interface cho bộ lọc
interface FilterState {
  status: string;
  role: string;
  timeRange: string;
  startDate: string;
  endDate: string;
}

const MeetingList: React.FC = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<MeetingWithCTName[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<MeetingWithCTName[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  
  // State cho bộ lọc
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    role: "all",
    timeRange: "all",
    startDate: "",
    endDate: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleCreateMeeting = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

const fetchMeetings = async () => {
  try {
    setLoading(true);
    const response = await meetingService.getAllMeetings();
    const meetingsData: MeetingWithCTName[] = response.data;

    const meetingsWithCTName = await Promise.all(
      meetingsData.map(async (meeting) => {
        // --- Gắn Chủ trì ---
        const ct = meeting.participants.find((p) => p.role === "CT");
        let ctName = "Chưa có";
        if (ct) {
          try {
            const userRes = await userService.getUser(ct.userId);
            ctName = `${userRes.data.firstName} ${userRes.data.lastName}`;
          } catch {
            ctName = "Chưa có";
          }
        }
        // --- Gắn thông tin phòng ---
        let roomName = "Chưa có";
        let floor =1;
        try {
          const roomRes = await roomService.getRoom(meeting.roomId);
          roomName = roomRes.data.roomName;
          floor = Number(roomRes.data.floor);
        } catch {
          roomName = "Chưa có";
          floor = 1;
        }

        return {
          ...meeting,
          ctName,
          roomName,
          floor,
        };
      })
    );

    setMeetings(meetingsWithCTName);
    setFilteredMeetings(meetingsWithCTName);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách cuộc họp:", error);
  } finally {
    setLoading(false);
  }
};


  // Hàm kiểm tra vai trò của user hiện tại trong cuộc họp - ĐÃ SỬA
  const getUserRoleInMeeting = (meeting: Meeting): string | null => {
    const participant = meeting.participants.find(p => p.userId === user?.userId);
    return participant ? participant.role : null;
  };

  // Hàm áp dụng bộ lọc - ĐÃ SỬA
  const applyFilters = () => {
    let result = [...meetings];

    // Lọc theo trạng thái
    if (filters.status !== "all") {
      result = result.filter(meeting => meeting.status === filters.status);
    }

    // Lọc theo vai trò - ĐÃ SỬA
    if (filters.role !== "all") {
      result = result.filter(meeting => {
        const userRole = getUserRoleInMeeting(meeting);
        return userRole === filters.role;
      });
    }

    // Lọc theo khoảng thời gian
    const now = new Date();
    if (filters.timeRange !== "all") {
      result = result.filter(meeting => {
        const startTime = new Date(meeting.startTime);
        const endTime = new Date(meeting.endTime);

        switch (filters.timeRange) {
          case "today":
            return startTime.toDateString() === now.toDateString();
          case "upcoming":
            return startTime > now;
          case "ongoing":
            return startTime <= now && endTime >= now;
          case "past":
            return endTime < now;
          case "thisWeek":
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            return startTime >= startOfWeek && startTime <= endOfWeek;
          case "thisMonth":
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            return startTime >= startOfMonth && startTime <= endOfMonth;
          default:
            return true;
        }
      });
    }

    // Lọc theo ngày tùy chỉnh
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);

      result = result.filter(meeting => {
        const meetingStart = new Date(meeting.startTime);
        return meetingStart >= startDate && meetingStart <= endDate;
      });
    }

    setFilteredMeetings(result);
  };

  // Reset bộ lọc
  const resetFilters = () => {
    setFilters({
      status: "all",
      role: "all",
      timeRange: "all",
      startDate: "",
      endDate: "",
    });
    setFilteredMeetings(meetings);
  };

  // Xử lý thay đổi filter
  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Áp dụng filter khi filters thay đổi
  useEffect(() => {
    applyFilters();
  }, [filters, meetings]);

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Thống kê - ĐÃ SỬA
  const getStats = () => {
    const total = meetings.length;
    const upcoming = meetings.filter(m => new Date(m.startTime) > new Date()).length;
    const ongoing = meetings.filter(m => {
      const now = new Date();
      return new Date(m.startTime) <= now && new Date(m.endTime) >= now;
    }).length;
    const past = meetings.filter(m => new Date(m.endTime) < new Date()).length;

    // Thống kê theo vai trò
    const asChuTri = meetings.filter(m => getUserRoleInMeeting(m) === "CT").length;
    const asThuKy = meetings.filter(m => getUserRoleInMeeting(m) === "TK").length;
    const asThanhVien = meetings.filter(m => getUserRoleInMeeting(m) === "TV").length;

    return { total, upcoming, ongoing, past, asChuTri, asThuKy, asThanhVien };
  };

  const stats = getStats();

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
          <Box>
            <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
              Danh sách cuộc họp
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Bộ lọc">
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{ borderRadius: 2 }}
              >
                Lọc
                {Object.values(filters).some(filter => filter !== "all" && filter !== "") && (
                  <Chip 
                    label="!" 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1, minWidth: 20, height: 20 }} 
                  />
                )}
              </Button>
            </Tooltip>
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
        </Box>

        {/* Bộ lọc */}
        {showFilters && (
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FilterList /> Bộ lọc cuộc họp
              </Typography>
              <Button
                startIcon={<Clear />}
                onClick={resetFilters}
                size="small"
              >
                Xóa bộ lọc
              </Button>
            </Box>

            {/* Bộ lọc - không dùng Grid */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Hàng 1: Status và Role */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filters.status}
                    label="Trạng thái"
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                  >
                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                    <MenuItem value="DRAFT">Bản nháp</MenuItem>
                    <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                    <MenuItem value="APPROVED">Đã duyệt</MenuItem>
                    <MenuItem value="ONGOING">Đang diễn ra</MenuItem>
                    <MenuItem value="COMPLETED">Đã kết thúc</MenuItem>
                    <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Vai trò của tôi</InputLabel>
                  <Select
                    value={filters.role}
                    label="Vai trò của tôi"
                    onChange={(e) => handleFilterChange("role", e.target.value)}
                  >
                    <MenuItem value="all">Tất cả vai trò</MenuItem>
                    <MenuItem value="CT">Chủ trì</MenuItem>
                    <MenuItem value="TK">Thư ký</MenuItem>
                    <MenuItem value="TV">Thành viên</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Hàng 2: Time Range và Custom Date */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Khoảng thời gian</InputLabel>
                  <Select
                    value={filters.timeRange}
                    label="Khoảng thời gian"
                    onChange={(e) => handleFilterChange("timeRange", e.target.value)}
                  >
                    <MenuItem value="all">Tất cả thời gian</MenuItem>
                    <MenuItem value="today">Hôm nay</MenuItem>
                    <MenuItem value="thisWeek">Tuần này</MenuItem>
                    <MenuItem value="thisMonth">Tháng này</MenuItem>
                    <MenuItem value="upcoming">Sắp tới</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                  <TextField
                    label="Từ ngày"
                    type="date"
                    size="small"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Đến ngày"
                    type="date"
                    size="small"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Kết quả lọc */}
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Đang hiển thị {filteredMeetings.length} / {meetings.length} cuộc họp
              </Typography>
              {filteredMeetings.length !== meetings.length && (
                <Chip 
                  label={`Đã lọc: ${filteredMeetings.length}`} 
                  color="primary" 
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Paper>
        )}

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : filteredMeetings.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {filteredMeetings.map((meeting) => (
              <Box key={meeting.id} sx={{ width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(33.333% - 11px)", lg: "calc(25% - 12px)" } }}>
                <MeetingCard meeting={meeting} />
              </Box>
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
            <Typography variant="h6">
              {meetings.length === 0 ? "Chưa có cuộc họp nào" : "Không tìm thấy cuộc họp phù hợp"}
            </Typography>
            <Typography color="text.secondary">
              {meetings.length === 0 
                ? "Bạn chưa tham gia hoặc chưa có cuộc họp được lên lịch."
                : "Hãy thử điều chỉnh bộ lọc để xem nhiều kết quả hơn."
              }
            </Typography>
            {meetings.length === 0 && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateMeeting}
                sx={{ mt: 1 }}
              >
                Tạo cuộc họp đầu tiên
              </Button>
            )}
          </Card>
        )}
      </Box>

      {/* Dialog tạo cuộc họp */}
      <CreateMeetingDialog
        open={openDialog}
        onClose={handleDialogClose}
        onCreated={fetchMeetings}
      />
    </MainLayout>
  );
};

export default MeetingList;