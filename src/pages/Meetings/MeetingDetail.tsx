import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  Checkbox,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  InputAdornment,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress
} from "@mui/material";
import {
  InfoOutlined,
  Assignment,
  Person,
  Description,
  Room,
  Email,
  ResetTv,
  Edit,
  Leaderboard,
  Groups,
  CheckCircle,
  RecordVoiceOver,
  SearchOff,
  Search,
  CalendarMonth,
  AccessTime,
  WarningAmber,
  PersonAdd,
  Close
} from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import MinutesTab from "../../components/Minutes/MinutesTab";
import type { Meeting, MeetingParticipant } from "../../types";
import { meetingService } from "../../services/meetingService";
import { userService } from "../../services/userService";
import { EditMeetingDialog } from "./EditMeetingDialog";
import { ResetMeetingDialog } from "./ResetMeetingDialog";
const ROLE_LABELS: { [key: string]: string } = {
  "CT": "Chủ trì",
  "TK": "Thư ký", 
  "TV": "Thành viên"
};

// Utility functions
const getRoleLabel = (role: string): string => ROLE_LABELS[role] || "Khác";

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Hàm tạo màu gradient
const generateRandomGradient = () => {
  const colorPairs = [
    ['rgba(20, 136, 204, 0.9)', 'rgba(43, 50, 178, 0.9)'],
  ];
  return colorPairs[0];
};

// Custom hooks
const useMeetingData = (id: string | undefined) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeeting = useCallback(async () => {
    if (!id) {
      setError("Không tìm thấy ID cuộc họp");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const meetingId = parseInt(id);
      
      if (isNaN(meetingId)) {
        throw new Error("ID cuộc họp không hợp lệ");
      }

      const response = await meetingService.getMeeting(meetingId);
      setMeeting(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi khi tải thông tin cuộc họp";
      setError(errorMessage);
      console.error("Lỗi khi lấy chi tiết cuộc họp:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  const refetch = useCallback(async () => {
    return await fetchMeeting();
  }, [fetchMeeting]);

  return { meeting, loading, error, refetch };
};

const useParticipantsInfo = (participants: MeetingParticipant[] = []) => {
  const [participantsInfo, setParticipantsInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchParticipantUsers = async () => {
      if (!participants.length) {
        setParticipantsInfo([]);
        return;
      }

      try {
        setLoading(true);
        const uniqueUserIds = [...new Set(participants.map(p => p.userId))];
        
        const userPromises = uniqueUserIds.map(id => userService.getUser(id));
        const userResponses = await Promise.all(userPromises);
        
        const userMap = userResponses.reduce((acc, response) => {
          acc[response.data.userId] = response.data;
          return acc;
        }, {} as any);

        const merged = participants.map(participant => ({
          ...participant,
          user: userMap[participant.userId] || null
        }));

        setParticipantsInfo(merged);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipantUsers();
  }, [participants]);

  return { participantsInfo, loading };
};

const useUserRole = (meeting: Meeting | null, user: any) => {
  return useMemo(() => {
    if (!meeting || !user) return "Không có vai trò";
    
    const participant = meeting.participants.find(p => p.userId === user.userId);
    return participant ? getRoleLabel(participant.role) : "Không có vai trò";
  }, [meeting, user]);
};

// Sub-components
const LoadingState: React.FC = () => (
  <MainLayout title="Đang tải...">
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" color="text.secondary">
        Đang tải thông tin cuộc họp...
      </Typography>
    </Box>
  </MainLayout>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <MainLayout title="Lỗi">
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
      <WarningAmber sx={{ fontSize: 60, color: 'error.main' }} />
      <Typography variant="h6" color="error" textAlign="center">
        {message}
      </Typography>
    </Box>
  </MainLayout>
);

const MeetingHeader: React.FC<{ 
  meeting: Meeting; 
  userRole: string;
  onInfoClick: () => void;
}> = ({ meeting, userRole, onInfoClick }) => {
  const [gradientColors] = useState(() => generateRandomGradient());

  return (
    <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{
          background: `
            linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%),
            url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: "white",
          p: 4,
          position: "relative",
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {meeting.name}
        </Typography>
        <Typography variant="h6" fontWeight={500} sx={{ opacity: 0.9 }}>
          {meeting.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={meeting.status} 
            color="primary" 
            sx={{ color: 'white', fontWeight: 600 }}
          />
          <Chip 
            label={`Vai trò: ${userRole}`}
            variant="outlined" 
            sx={{ 
              borderColor: 'white', 
              color: 'white',
              fontWeight: 600 
            }}
          />
        </Box>

        <Tooltip title="Thông tin chi tiết">
          <IconButton
            onClick={onInfoClick}
            sx={{
              position: "absolute",
              right: 16,
              bottom: 16,
              color: "white",
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <InfoOutlined />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

interface MeetingInfoTabProps {
  meeting: Meeting;
  participantsInfo: any[];
  userRole: string;
  onEdit?: () => void;
  onReset?: () => void;
  onSendEmail?: () => void;
  reloadMeeting: () => Promise<void>;
}

const MeetingInfoTab: React.FC<MeetingInfoTabProps> = ({ 
  meeting, 
  participantsInfo, 
  userRole, 
  onEdit, 
  onReset, 
  onSendEmail,
  reloadMeeting 
}) => {
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const chairman = useMemo(() => 
    participantsInfo.find(p => p.role === "CT"),
    [participantsInfo]
  );

  const meetingStatus = useMemo(() => {
    const now = new Date();
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    
    if (now < start) return { text: "Sắp diễn ra", color: "warning" };
    if (now >= start && now <= end) return { text: "Đang diễn ra", color: "success" };
    return { text: "Đã kết thúc", color: "default" };
  }, [meeting]);

  const calculateDuration = (start: string, end: string): string => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} giờ ${minutes} phút`;
  };

  const calculateProgress = (start: string, end: string): number => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const now = new Date().getTime();
    const total = endTime - startTime;
    const elapsed = now - startTime;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const handleCancelMeeting = async (reason: string) => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do hủy");
      return;
    }

    try {
      setIsCanceling(true);
      await meetingService.cancelMeeting(meeting.id, reason);
      alert("Đã hủy cuộc họp thành công!");
      setShowCancelReason(false);
      setCancelReason("");
      await reloadMeeting();
    } catch (error) {
      console.error("Lỗi khi hủy cuộc họp:", error);
      alert("Hủy cuộc họp thất bại!");
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Box display="flex" gap={3} flexDirection={{ xs: "column", lg: "row" }}>
      {/* Thông tin chính */}
      <Card sx={{ flex: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header với status và action buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                Thông tin cuộc họp
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={meetingStatus.text} 
                color={meetingStatus.color as any}
                variant="filled"
                size="small"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Cột trái - Thông tin cơ bản */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  bgcolor: 'primary.50', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CalendarMonth fontSize="small" color="primary" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    NGÀY HỌP
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(meeting.startTime)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  bgcolor: 'success.50', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AccessTime fontSize="small" color="success" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    THỜI GIAN
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({calculateDuration(meeting.startTime, meeting.endTime)})
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  bgcolor: 'warning.50', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Room fontSize="small" color="warning" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    ĐỊA ĐIỂM
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {meeting.roomId ? `Phòng ${meeting.roomId}` : "Chưa xác định"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Cột phải - Thông tin bổ sung */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  bgcolor: 'error.50', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Person fontSize="small" color="error" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    CHỦ TRÌ
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {chairman 
                      ? `${chairman.user.lastName} ${chairman.user.firstName}`
                      : "Chưa có chủ trì"
                    }
                  </Typography>
                  {chairman && (
                    <Typography variant="caption" color="primary.main">
                      {chairman.user.email}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box sx={{ 
                  p: 1, 
                  bgcolor: 'grey.50', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Description fontSize="small" color="action" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    MÔ TẢ
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {meeting.description || "Không có mô tả chi tiết"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {meetingStatus.text === "Đang diễn ra" && (
            <Box sx={{ mt: 4, p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
              <Typography variant="caption" fontWeight={600} color="success.main" display="block" mb={1}>
                CUỘC HỌP ĐANG DIỄN RA
              </Typography>
              <LinearProgress 
                color="success" 
                variant="determinate" 
                value={calculateProgress(meeting.startTime, meeting.endTime)}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          {/* Cancel Meeting Section */}
          {showCancelReason && (
            <Card sx={{ mt: 3, p: 3, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.light', borderRadius: 2 }}>
              <Typography variant="h6" color="error.main" gutterBottom>
                Xác nhận hủy cuộc họp
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Vui lòng cung cấp lý do hủy cuộc họp. Thao tác này không thể hoàn tác.
              </Typography>
              <TextField
                label="Lý do hủy *"
                fullWidth
                multiline
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                placeholder="Nhập lý do hủy cuộc họp..."
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleCancelMeeting(cancelReason)}
                  disabled={!cancelReason.trim() || isCanceling}
                  startIcon={isCanceling ? <CircularProgress size={16} /> : null}
                >
                  {isCanceling ? 'Đang hủy...' : 'Xác nhận hủy'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowCancelReason(false);
                    setCancelReason("");
                  }}
                  disabled={isCanceling}
                >
                  Hủy bỏ
                </Button>
              </Box>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Sidebar */}
     {(userRole !== "Thành viên") && (
  <Card sx={{ flex: 1, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', mb: 3 }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
        Tác vụ nhanh
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        {/* Chỉnh sửa cuộc họp */}
        {(userRole === "Thư ký" && meeting.status === "DRAFT") && (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={onEdit}
            fullWidth
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Chỉnh sửa cuộc họp
          </Button>
        )}

        {/* Gửi thông báo email */}
        {(userRole === "Thư ký" && meeting.status === "DRAFT") && (
          <Button
            variant="contained"
            startIcon={<Email />}
            onClick={onSendEmail}
            fullWidth
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' }
            }}
          >
            Gửi thông báo email
          </Button>
        )}

        {/* Tạo lại cuộc họp */}
        {(userRole === "Thư ký" && (meeting.status === "CANCELLED" || meeting.status === "COMPLETED")) && (
          <Button
            variant="contained"
            startIcon={<ResetTv />}
            onClick={onReset}
            fullWidth
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              bgcolor: 'warning.main',
              '&:hover': { bgcolor: 'warning.dark' }
            }}
          >
            Tạo lại cuộc họp
          </Button>
        )}

        {/* Hủy cuộc họp */}
        {(["DRAFT", "PENDING", "APPROVED"].includes(meeting.status)) && (
          <Button
            variant="contained"
            startIcon={<Close />}
            onClick={() => setShowCancelReason(true)}
            fullWidth
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              bgcolor: 'error.main',
              '&:hover': { bgcolor: 'error.dark' }
            }}
          >
            Hủy cuộc họp
          </Button>
        )}
      </Box>
    </CardContent>
  </Card>
)}

    </Box>
  );
};

interface ParticipantsTabProps {
  participantsInfo: any[];
  userRole: string;
  meeting: Meeting;
  reloadMeeting: () => Promise<void>;
}

const ParticipantsTab: React.FC<ParticipantsTabProps> = ({ 
  participantsInfo, 
  userRole, 
  meeting, 
  reloadMeeting 
}) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const approvedCount = useMemo(
    () => participantsInfo.filter(p => p.status === "Approve" && p.role === "TV").length,
    [participantsInfo]
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getAllUsers(); 
        setAvailableUsers(response.data);
      } catch (error) {
        console.error("Lấy danh sách user thất bại:", error);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = availableUsers.filter(
    user => !participantsInfo.find(p => p.user.userId === user.userId) &&
      (user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleSelect = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (!selectedUsers.length) return;
    
    setIsLoading(true);
    const participantsPayload = selectedUsers.map(id => ({
      userId: id,
      role: "TV"
    }));

    try {
      await meetingService.addParticipant(meeting.id, participantsPayload);
      alert(`✅ Đã thêm ${selectedUsers.length} thành viên thành công!`);
      setSelectedUsers([]);
      setSearchQuery("");
      setOpenAddDialog(false);
      await reloadMeeting();
    } catch (error) {
      console.error("Lỗi khi thêm thành viên:", error);
      alert(`❌ Thêm thành viên thất bại!`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedUsers([]);
    setSearchQuery("");
    setOpenAddDialog(false);
  };

  const groupedParticipants = useMemo(() => {
    const groups = {
      "Chủ trì": [] as any[],
      "Thư ký": [] as any[],
      "Thành viên": [] as any[]
    };

    participantsInfo.forEach(participant => {
      const role = getRoleLabel(participant.role);
      if (role === "Chủ trì") {
        groups["Chủ trì"].push(participant);
      } else if (role === "Thư ký") {
        groups["Thư ký"].push(participant);
      } else {
        groups["Thành viên"].push(participant);
      }
    });

    return groups;
  }, [participantsInfo]);

  const visibleGroups = useMemo(() => {
    if (userRole === "Thành viên") {
      return {
        "Chủ trì": groupedParticipants["Chủ trì"],
        "Thư ký": groupedParticipants["Thư ký"],
        "Thành viên": groupedParticipants["Thành viên"].filter(p => p.status === "Approve")
      };
    } else {
      return groupedParticipants;
    }
  }, [groupedParticipants, userRole]);

  const STATUS_CONFIG: { [key: string]: { label: string; color: "success" | "warning" | "error" | "default" } } = {
    "Approve": { label: "Đã tham gia", color: "success" },
    "Pending": { label: "Chờ phản hồi", color: "warning" },
    "Reject": { label: "Từ chối", color: "error" }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
                Danh sách tham dự
              </Typography>
            </Box>
            
            {userRole === "Thư ký" && (
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setOpenAddDialog(true)}
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 600,
                  px: 3,
                  py: 1
                }}
              >
                Thêm thành viên
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 3 }}>
          {Object.entries(visibleGroups).map(([roleName, participants]) => (
            participants.length > 0 && (
              <Box key={roleName} sx={{ mb: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3, 
                  p: 2, 
                  bgcolor: roleName === "Chủ trì" ? 'primary.50' : 
                           roleName === "Thư ký" ? 'success.50' : 'grey.50', 
                  borderRadius: 2,
                  borderLeft: `4px solid ${
                    roleName === "Chủ trì" ? '#1976d2' : 
                    roleName === "Thư ký" ? '#2e7d32' : '#666'
                  }`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    {roleName === "Chủ trì" && <Leaderboard sx={{ color: 'primary.main' }} />}
                    {roleName === "Thư ký" && <RecordVoiceOver sx={{ color: 'success.main' }} />}
                    {roleName === "Thành viên" && <Groups sx={{ color: 'text.secondary' }} />}
                    
                    <Typography variant="h6" fontWeight={700} 
                      color={roleName === "Chủ trì" ? 'primary.main' : 
                             roleName === "Thư ký" ? 'success.main' : 'text.primary'}>
                      {roleName}
                    </Typography>
                    
                    {roleName === "Thành viên" && (
                      <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                        {userRole === "Thành viên"
                          ? `(${participants.length})`
                          : `(${approvedCount}/${participants.length})`
                        }
                      </Typography>
                    )}
                  </Box>
                  {roleName === "Thành viên" && (
                  <Chip 
                    label={`${participants.length} người`}
                    size="small"
                    variant="outlined"
                  />)}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {participants.map((p) => (
                    <Card 
                      key={p.user.userId}
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          borderColor: 'primary.light'
                        }
                      }}
                    >
                      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: roleName === "Chủ trì" ? "primary.main" :
                                     roleName === "Thư ký" ? "success.main" : "grey.500",
                            width: 48,
                            height: 48
                          }}
                        >
                          {p.user.firstName?.[0] || p.user.lastName?.[0]}
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {p.user.lastName} {p.user.firstName}
                            </Typography>
                            {p.status === "Approve" && (userRole === "Chủ trì" || userRole === "Thư ký") && 
                              <CheckCircle fontSize="small" color="success" />}
                          </Box>
                          
                          {(userRole === "Chủ trì" || userRole === "Thư ký") && (
                            <Typography variant="body2" color="text.secondary">
                              {p.user.email}
                            </Typography>
                          )}

                          {(userRole === "Chủ trì" || userRole === "Thư ký") && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Chip
                                label={STATUS_CONFIG[p.status]?.label || p.status}
                                size="small"
                                color={STATUS_CONFIG[p.status]?.color || "default"}
                                variant="filled"
                              />
                            </Box>
                          )}
                        </Box>

                        {userRole === "Thành viên" && p.status !== "Approve" && (
                          <Chip
                            label={STATUS_CONFIG[p.status]?.label || p.status}
                            size="small"
                            color={STATUS_CONFIG[p.status]?.color || "default"}
                            variant="filled"
                          />
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )
          ))}

          {Object.values(visibleGroups).every(group => group.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Groups sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có thành viên nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hãy thêm thành viên để bắt đầu cuộc họp
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ p: 3, pb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight={700}>
              Thêm thành viên
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleCloseDialog}
              sx={{ color: 'text.secondary' }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />

          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredUsers.map(user => (
              <Card
                key={user.userId}
                variant="outlined"
                sx={{
                  mb: 1,
                  cursor: 'pointer',
                  border: selectedUsers.includes(user.userId) ? '2px solid' : '1px solid',
                  borderColor: selectedUsers.includes(user.userId) ? 'primary.main' : 'divider',
                  bgcolor: selectedUsers.includes(user.userId) ? 'primary.50' : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => handleToggleSelect(user.userId)}
              >
                <CardContent sx={{ py: 2, px: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Checkbox 
                      checked={selectedUsers.includes(user.userId)}
                      color="primary"
                      sx={{ p: 0 }}
                    />
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                      {user.firstName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600}>
                        {user.lastName} {user.firstName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            {filteredUsers.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SearchOff sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                <Typography color="text.secondary">
                  {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Không còn thành viên nào có thể thêm'}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ borderRadius: 2, px: 3 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleAddMembers}
            disabled={!selectedUsers.length || isLoading}
            sx={{ borderRadius: 2, px: 3 }}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
          >
            {isLoading ? 'Đang thêm...' : `Thêm ${selectedUsers.length} thành viên`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Main component
const MeetingDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const { meeting, loading, error, refetch } = useMeetingData(id); 
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };
   const handleReset = () => {
    setResetDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!meeting?.id) {
      alert("Meeting ID không hợp lệ");
      return;
    }

    try {
      await meetingService.send(meeting.id);
      alert("Đã gửi email thông báo thành công!");
    } catch (error: any) {
      console.error("Gửi email thất bại:", error);
      alert(`Gửi email thất bại: ${error.response?.data?.message || error.message}`);
    }
  };

  const { participantsInfo } = useParticipantsInfo(meeting?.participants);
  const userRole = useUserRole(meeting, user);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleInfoClick = useCallback(() => {
    setActiveTab(1);
  }, []);

  const reloadMeeting = useCallback(async () => {
    if (refetch) {
      await refetch();
    }
  }, [refetch]);

  if (loading) return <LoadingState />;
  
  if (error || !meeting) return <ErrorState message={error || "Không thể tải thông tin cuộc họp"} />;

  return (
    <MainLayout
      title={[
        { label: "Cuộc họp của tôi", path: "/meetings" },
        { label: meeting.name }
      ]}
    >
      <MeetingHeader 
        meeting={meeting} 
        userRole={userRole}
        onInfoClick={handleInfoClick}
      />

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            pt: 1
          }}
        >
         
          <Tab 
            label="Thông tin cuộc họp" 
            icon={<InfoOutlined />}
            iconPosition="start"
          />
           <Tab 
            label="Biên bản" 
            icon={<Assignment />}
            iconPosition="start"
          />
          <Tab 
            label="Thành viên" 
            icon={<Person />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {activeTab === 1 && (
        <MinutesTab 
          role={userRole} 
          currentUserId={user?.userId!}
          meetingId={id!}
        />
      )}
      
      {activeTab === 0 && (
        <MeetingInfoTab 
          meeting={meeting} 
          userRole={userRole}
          participantsInfo={participantsInfo} 
          onEdit={handleEdit}
          onReset={handleReset}
          onSendEmail={handleSendEmail}
          reloadMeeting={reloadMeeting}
        />
      )}
      
      {activeTab === 2 && (
        <ParticipantsTab 
          participantsInfo={participantsInfo} 
          userRole={userRole}
          meeting={meeting}
          reloadMeeting={reloadMeeting}
        />
      )}
      
      <EditMeetingDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onUpdated={() => {
          reloadMeeting();
          setEditDialogOpen(false);
        }}
        meeting={meeting}
      />
      <ResetMeetingDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onUpdated={() => {
          reloadMeeting();
          setResetDialogOpen(false);
        }}
        meeting={meeting}
      />
    </MainLayout>
  );
};

export default MeetingDetail;