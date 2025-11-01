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
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Paper,
  IconButton,
  Alert,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from "@mui/material";
import {
  InfoOutlined,
  Assignment,
  Person,
  Description,
  Room,
  CheckCircle,
  CalendarMonth,
  AccessTime,
  RadioButtonUnchecked,
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

// Constants
const ROLE_LABELS: { [key: string]: string } = {
  "CT": "Chủ trì",
  "TK": "Thư ký", 
  "TV": "Thành viên"
};

const STATUS_CONFIG: { [key: string]: { label: string; color: "default" | "primary" | "success" | "error" } } = {
  Pending: { label: "Chưa tham gia", color: "default" },
  Approve: { label: "Đã tham gia", color: "success" },
  Reject: { label: "Từ chối", color: "error" },
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

// Custom hooks
const useMeetingData = (id: string | undefined) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeeting = async () => {
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
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi khi tải thông tin cuộc họp";
        setError(errorMessage);
        console.error("Lỗi khi lấy chi tiết cuộc họp:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  return { meeting, loading, error };
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
}> = ({ meeting, userRole, onInfoClick }) => (
  <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
    <Box
      sx={{
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        color: "white",
        p: 4,
        position: "relative",
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

const MeetingInfoTab: React.FC<{ 
  meeting: Meeting; 
  participantsInfo: any[];
}> = ({ meeting, participantsInfo }) => {
  const chairman = useMemo(() => 
    participantsInfo.find(p => p.role === "CT"),
    [participantsInfo]
  );

  return (
    <Box display="flex" gap={3} flexDirection={{ xs: "column", lg: "row" }}>
      <Card sx={{ flex: 1, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Thông tin cuộc họp
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CalendarMonth fontSize="small" color="action" />
              <Typography variant="body2">
                {formatDate(meeting.startTime)}
              </Typography>
            </Box>
              
            <Divider />
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2">
                {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Room fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {`Phòng ${meeting.roomId || "Chưa rõ"}`}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Person fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {chairman 
                  ? `${chairman.user.firstName} ${chairman.user.lastName}`
                  : "Chưa có chủ trì"
                }
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Description fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {meeting.description || "Không có mô tả"}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const ParticipantsTab: React.FC<{ participantsInfo: any[], userRole: string }> = ({ participantsInfo, userRole }) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const approvedCount = useMemo(
    () => participantsInfo.filter(p => p.status === "Approve").length,
    [participantsInfo]
  );

  // Mock data for available users
  const availableUsers = [
    { id: "1", firstName: "Minh", lastName: "Nguyễn", email: "minh.nguyen@example.com" },
    { id: "2", firstName: "Anh", lastName: "Trần", email: "anh.tran@example.com" },
    { id: "3", firstName: "Hùng", lastName: "Lê", email: "hung.le@example.com" },
    { id: "4", firstName: "Linh", lastName: "Phạm", email: "linh.pham@example.com" },
  ];

  // Lọc user chưa tham gia
  const filteredUsers = availableUsers.filter(
    user => !participantsInfo.find(p => p.user.userId === user.id) &&
      (user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleSelect = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMembers = () => {
    if (!selectedUsers.length) return;

    // TODO: gọi API để thêm nhiều participant
    console.log("Thêm thành viên:", selectedUsers.map(id => ({ userId: id, role: "TV", status: "Pending" })));

    // reset
    setSelectedUsers([]);
    setSearchQuery("");
    setOpenAddDialog(false);
  };

  const handleCloseDialog = () => {
    setSelectedUsers([]);
    setSearchQuery("");
    setOpenAddDialog(false);
  };

 



  return (
    <Box>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Thành viên ({approvedCount}/{participantsInfo.length})
            </Typography>

            {(userRole === "Chủ trì" || userRole === "Thư ký") && (
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setOpenAddDialog(true)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Thêm thành viên
              </Button>
            )}
          </Box>

          <List>
            {participantsInfo.map((p, index) => (
              <React.Fragment key={p.user.userId}>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.main" }}>{p.user.firstName?.[0]}</Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {p.user.lastName} {p.user.firstName}
                        </Typography>
                        {p.status === "Approve" ? (
                          <CheckCircle fontSize="small" color="success" />
                        ) : (
                          <RadioButtonUnchecked fontSize="small" color="disabled" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <Chip label={getRoleLabel(p.role)} size="small"
                          color={p.role === "CT" ? "primary" : p.role === "TK" ? "success" : "default"}
                          variant="outlined"
                        />
                       <Chip
  label={STATUS_CONFIG[p.status]?.label || p.status}
  size="small"
  color={STATUS_CONFIG[p.status]?.color || "default"}
  variant="filled"
/>

                      </Box>
                    }
                  />
                </ListItem>
                {index < participantsInfo.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Dialog Thêm nhiều thành viên */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>Thêm thành viên</Typography>
            <IconButton size="small" onClick={handleCloseDialog}><Close /></IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {filteredUsers.map(user => (
              <Card
                key={user.id}
                variant="outlined"
                sx={{
                  mb: 1,
                  cursor: 'pointer',
                  border: selectedUsers.includes(user.id) ? '2px solid' : '1px solid',
                  borderColor: selectedUsers.includes(user.id) ? 'primary.main' : 'divider',
                  bgcolor: selectedUsers.includes(user.id) ? 'action.hover' : 'background.paper'
                }}
                onClick={() => handleToggleSelect(user.id)}
              >
                <CardContent sx={{ py: 1 }}>
                  <Typography fontWeight={600}>{user.lastName} {user.firstName}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                </CardContent>
              </Card>
            ))}
            {filteredUsers.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={2}>
                Không còn thành viên nào có thể thêm
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>Hủy</Button>
          <Button variant="contained" onClick={handleAddMembers} disabled={!selectedUsers.length} sx={{ borderRadius: 2 }}>
            Thêm {selectedUsers.length} thành viên
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
  
  const { meeting, loading, error } = useMeetingData(id);
  const { participantsInfo } = useParticipantsInfo(meeting?.participants);
  const userRole = useUserRole(meeting, user);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleInfoClick = useCallback(() => {
    setActiveTab(1); // Switch to info tab
  }, []);

  // Render loading state
  if (loading) return <LoadingState />;
  
  // Render error state
  if (error || !meeting) return <ErrorState message={error || "Không thể tải thông tin cuộc họp"} />;

  return (
    <MainLayout
      title={[
        { label: "Cuộc họp của tôi", path: "/meetings" },
        { label: meeting.name }
      ]}
    >
      {/* Header Banner */}
      <MeetingHeader 
        meeting={meeting} 
        userRole={userRole}
        onInfoClick={handleInfoClick}
      />

      {/* Alert for demo */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Đây là phiên bản nâng cao với tính năng thêm thành viên
      </Alert>

      {/* Tabs Navigation */}
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
            label="Biên bản" 
            icon={<Assignment />}
            iconPosition="start"
          />
          <Tab 
            label="Thông tin cuộc họp" 
            icon={<InfoOutlined />}
            iconPosition="start"
          />
          <Tab 
            label="Thành viên" 
            icon={<Person />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <MinutesTab 
          role={userRole} 
          currentUserId ={user?.userId!}
          meetingId={id!}
        />
      )}
      
      {activeTab === 1 && (
        <MeetingInfoTab 
          meeting={meeting} 
          participantsInfo={participantsInfo} 
        />
      )}
      
      {activeTab === 2 && (
        <ParticipantsTab participantsInfo={participantsInfo} 
        userRole={userRole}
        />
      )}
    </MainLayout>
  );
};

export default MeetingDetail;