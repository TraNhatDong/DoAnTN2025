import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Tooltip
} from "@mui/material";
import {
  MoreVert,
  CalendarMonth,
  AccessTime,
  Edit,
  Delete,
  Person,
  MeetingRoom
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { MeetingWithCTName } from './MeetingList';

// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Tính thời gian còn lại đến cuộc họp
const getTimeUntilMeeting = (startTime: string) => {
  const now = new Date();
  const start = new Date(startTime);
  const diff = start.getTime() - now.getTime();
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days} ngày`;
  if (hours > 0) return `${hours} giờ`;
  return `${minutes} phút`;
};

// Kiểm tra xem cuộc họp có đang diễn ra không
const isMeetingOngoing = (startTime: string, endTime: string) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  return now >= start && now <= end;
};

interface MeetingCardProps {
  meeting: MeetingWithCTName;
  onEdit?: (meeting: MeetingWithCTName) => void;
  onDelete?: (meeting: MeetingWithCTName) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ 
  meeting, 
  onEdit, 
  onDelete, 
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "DRAFT":
        return { 
          label: "BẢN NHÁP", 
          bgcolor: "#9e9e9e", 
          color: "#fff",
          tooltip: "Cuộc họp đang được soạn thảo"
        };
      case "PENDING":
        return { 
          label: "CHỜ DUYỆT", 
          bgcolor: "#ff9800", 
          color: "#fff",
          tooltip: "Đang chờ phê duyệt"
        };
      case "APPROVED":
        return { 
          label: "ĐÃ DUYỆT", 
          bgcolor: "#4caf50", 
          color: "#fff",
          tooltip: "Đã được phê duyệt"
        };
      case "ONGOING":
        return { 
          label: "ĐANG DIỄN RA", 
          bgcolor: "#2196f3", 
          color: "#fff",
          tooltip: "Cuộc họp đang diễn ra"
        };
      case "COMPLETED":
        return { 
          label: "ĐÃ KẾT THÚC", 
          bgcolor: "#757575", 
          color: "#fff",
          tooltip: "Cuộc họp đã kết thúc"
        };
      case "CANCELLED":
        return { 
          label: "ĐÃ HỦY", 
          bgcolor: "#f44336", 
          color: "#fff",
          tooltip: "Cuộc họp đã bị hủy"
        };
      default:
        return { 
          label: "KHÔNG XÁC ĐỊNH", 
          bgcolor: "#e0e0e0", 
          color: "#000",
          tooltip: "Trạng thái không xác định"
        };
    }
  };

  const handleMeetingClick = () => {
    navigate(`/meetings/${meeting.id}`);
  };
  const statusInfo = getStatusDisplay(meeting.status);
  const timeUntilMeeting = getTimeUntilMeeting(meeting.startTime);
  const isOngoing = isMeetingOngoing(meeting.startTime, meeting.endTime);

  return (
    <Card
      onClick={handleMeetingClick}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 2,
        position: "relative",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4
        },
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header với gradient */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          p: 2,
          color: "white",
          background: `
            linear-gradient(135deg, rgba(20, 136, 204, 0.9) 0%, rgba(58, 123, 213, 0.9) 100%),
            url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: 100,
          position: "relative"
        }}
      >
        {/* Badge thời gian nếu sắp diễn ra */}
        {timeUntilMeeting && meeting.status === "APPROVED" && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: "rgba(255,255,255,0.9)",
              color: "primary.main",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.7rem",
              fontWeight: "bold",
              backdropFilter: "blur(10px)"
            }}
          >
            ⏰ {timeUntilMeeting}
          </Box>
        )}

        {/* Badge đang diễn ra */}
        {isOngoing && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: "rgba(255,255,255,0.9)",
              color: "success.main",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.7rem",
              fontWeight: "bold",
              backdropFilter: "blur(10px)",
              animation: "pulse 2s infinite"
            }}
          >
            🔴 ĐANG DIỄN RA
          </Box>
        )}

        <Box sx={{ flex: 1, pr: 1, minWidth: 0, mt: timeUntilMeeting || isOngoing ? 3 : 0 }}>
          <Box sx={{ display: "flex", alignItems: "baseline" }}>
  <Typography
    sx={{
      fontFamily: "'Montserrat', 'Roboto', sans-serif",
      fontWeight: 700,
      fontSize: "1.6rem",
      lineHeight: 1.4,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      textShadow: "0 1px 1px rgba(0,0,0,0.15)"
    }}
  >
    {meeting.name}
  </Typography>
</Box>

          <Typography
            sx={{
              fontSize: "1 rem",
              opacity: 0.9,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textShadow: "0 1px 1px rgba(0,0,0,0.3)"
            }}
          >
            {meeting.description || "Không có mô tả"}
          </Typography>
        </Box>

        <Tooltip title={statusInfo.tooltip} arrow>
          <Chip
            label={statusInfo.label}
            size="small"
            sx={{
              bgcolor: statusInfo.bgcolor,
              color: statusInfo.color,
              fontWeight: 700,
              fontSize: "0.7rem",
              minWidth: 80,
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.3)"
            }}
          />
        </Tooltip>
      </Box>

      {/* Content */}
      <CardContent sx={{ flex: 1, pb: 1 }}>
        {/* Chủ trì */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Person fontSize="small" color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Chủ trì
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {meeting.ctName || "Chưa có chủ trì"}
            </Typography>
          </Box>
        </Box>

        {/* Thông tin chi tiết */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Ngày */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <CalendarMonth fontSize="small" color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Ngày họp
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate(meeting.startTime)}
              </Typography>
            </Box>
          </Box>

          {/* Thời gian */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <AccessTime fontSize="small" color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Thời gian
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
              </Typography>
            </Box>
          </Box>

          {/* Địa điểm */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <MeetingRoom fontSize="small" color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Địa điểm
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {meeting.roomName} {meeting.floor && `- Tầng ${meeting.floor}`}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
          <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default"
        }}
      ></Box>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Card>
  );
};

export default MeetingCard;