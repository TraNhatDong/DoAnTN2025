import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Button,
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
  IconButton
} from "@mui/material";
import {
  InfoOutlined,
  Assignment,
  Person,
  Schedule,
  Room,
  CheckCircle,
  RadioButtonUnchecked
} from "@mui/icons-material";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { useMeetingRole } from "../../context/MeetingRoleContext";
import MinutesTab from "../../components/Minutes/MinutesTab"; // Import mới

const mockMeeting = {
  title: "INT1306 - Cấu trúc dữ liệu và giải thuật, Nhóm: 02",
  code: "D21CQDT01-N",
  teacher: "Minh Ho Như",
  bannerImg: "https://ssl.gstatic.com/classroom/themes/img_code.jpg",
  time: "09:00 - 11:00, Thứ 3, 15/04/2024",
  location: "Phòng họp A1 - Tòa nhà B",
  description: "Buổi họp trao đổi kế hoạch thực hành và phân chia nhiệm vụ nhóm.",
  website: "https://www.ctxtm.com",
  status: "Đang diễn ra"
};

const participants = [
  { name: "Minh Ho Như", role: "Giảng viên", present: true },
  { name: "Trần Văn Long", role: "Thư ký", present: true },
  { name: "Nguyễn Thị Hoa", role: "Thành viên", present: true },
  { name: "Lê Quốc Dũng", role: "Thành viên", present: false },
  { name: "Phạm Văn Nam", role: "Thành viên", present: true },
  { name: "Hoàng Thị Lan", role: "Thành viên", present: false },
];

const MeetingDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { role, loadRoleForMeeting } = useMeetingRole();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (id && user) {
        setTimeout(() => {
          loadRoleForMeeting(id, user.id);
          setLoading(false);
        }, 1000);
      }
    };
    initialize();
  }, [id, user, loadRoleForMeeting]);

  if (loading) {
    return (
      <MainLayout title="Đang tải...">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Đang tải thông tin cuộc họp...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  if (!role) {
    return (
      <MainLayout title="Lỗi">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h6" color="error">
            Không thể tải thông tin cuộc họp
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout
  title={[
    { label: "Cuộc họp của tôi", path: "/meetings" },
    { label: mockMeeting.title }
  ]}
>
      {/* Banner Header */}
      <Card sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${mockMeeting.bannerImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "white",
            p: 4,
            position: "relative",
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {mockMeeting.title}
          </Typography>
          <Typography variant="h6" fontWeight={500} sx={{ opacity: 0.9 }}>
            {mockMeeting.code}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Chip 
              label={mockMeeting.status} 
              color="success" 
              sx={{ color: 'white', fontWeight: 600 }}
            />
            <Chip 
              label={`Vai trò: ${role}`} 
              variant="outlined" 
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                fontWeight: 600 
              }}
            />
          </Box>

          <IconButton
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
        </Box>
      </Card>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
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

      {/* --- TAB 1: Biên bản --- */}
     {tab === 0 && (
  <MinutesTab 
    role="Thành viên" 
    meetingId={id!}
  />
)}
      {/* --- TAB 2: Thông tin cuộc họp --- */}
      {tab === 1 && (
        <Box display="flex" gap={3} flexDirection={{ xs: "column", lg: "row" }}>
          {/* Meeting Information */}
          <Card sx={{ flex: 1, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Thông tin cuộc họp
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Schedule sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Thời gian
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockMeeting.time}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Room sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Địa điểm
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mockMeeting.location}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Person sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Trang thiết
                    </Typography>
                    <Typography 
                      variant="body2" 
                      component="a"
                      href={mockMeeting.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {mockMeeting.website}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Mô tả
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mockMeeting.description}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* --- TAB 3: Thành viên --- */}
      {tab === 2 && (
        <Box>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Thành viên ({participants.filter(p => p.present).length}/{participants.length})
              </Typography>
              <List>
                {participants.map((person, index) => (
                  <React.Fragment key={person.name}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: person.present ? 'primary.main' : 'grey.400' }}>
                          {person.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight={600}>
                              {person.name}
                            </Typography>
                            {person.present ? (
                              <CheckCircle fontSize="small" color="success" />
                            ) : (
                              <RadioButtonUnchecked fontSize="small" color="disabled" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={person.role}
                              size="small"
                              color={
                                person.role === "Giảng viên"
                                  ? "primary"
                                  : person.role === "Thư ký"
                                  ? "success"
                                  : "default"
                              }
                              variant="outlined"
                            />
                            <Typography 
                              variant="caption" 
                              color={person.present ? 'success.main' : 'text.secondary'}
                              sx={{ fontStyle: 'italic' }}
                            >
                              {person.present ? 'Đã tham gia' : 'Chưa tham gia'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < participants.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}
    </MainLayout>
  );
};

export default MeetingDetail;