import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Menu,
  MenuItem
} from "@mui/material";
import {
  MoreVert,
  CalendarMonth,
  Group,
  AccessTime,
  Edit,
  Delete
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export interface Meeting {
  id: string;
  title: string;
  classCode: string;
  teacher: string;
  time: string;
  date: string;
  participants: number;
  status: "Đang diễn ra" | "Sắp diễn ra" | "Đã kết thúc";
  room: string;
}

interface MeetingCardProps {
  meeting: Meeting;
  onEdit?: (meeting: Meeting) => void;
  onDelete?: (meeting: Meeting) => void;
  onJoin?: (meeting: Meeting) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ 
  meeting, 
  onEdit, 
  onDelete, 
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang diễn ra":
        return { bgcolor: "#4caf50", color: "#fff" };
      case "Sắp diễn ra":
        return { bgcolor: "#ff9800", color: "#fff" };
      case "Đã kết thúc":
        return { bgcolor: "#9e9e9e", color: "#fff" };
      default:
        return { bgcolor: "default", color: "#000" };
    }
  };

  const getStatusVariant = (status: string) => {
    return status === "Đang diễn ra" ? "filled" : "outlined";
  };

  const handleMeetingClick = () => {
      navigate(`/meetings/${meeting.id}`);
  };


  const handleMenuOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget as HTMLElement);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit?.(meeting);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete?.(meeting);
  };


  const isActionDisabled = meeting.status === "Đã kết thúc";

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
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          p: 2,
          color: "white",
          background: "linear-gradient(90deg, #1565C0, #42A5F5)",
          minHeight: 80
        }}
      >
        <Box sx={{ flex: 1, pr: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "1.1rem",
              lineHeight: 1.2,
              mb: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {meeting.title}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", opacity: 0.9 }}>
            {meeting.classCode}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={meeting.status}
            size="small"
            variant={getStatusVariant(meeting.status)}
            sx={{
              ...getStatusColor(meeting.status),
              fontWeight: 600,
              fontSize: "0.75rem"
            }}
          />
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ pb: 1 }}>
        <Typography sx={{ mb: 2, fontSize: "0.9rem", color: "text.secondary" }}>
          Người chủ trì: <strong style={{ color: "text.primary" }}>{meeting.teacher}</strong>
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CalendarMonth fontSize="small" color="action" />
            <Typography variant="body2">{meeting.date}</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2">{meeting.time}</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Group fontSize="small" color="action" />
            <Typography variant="body2">
              {meeting.participants} thành viên
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 20, display: "flex", justifyContent: "center" }}>
              📍
            </Box>
            <Typography variant="body2">{meeting.room}</Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Actions Menu - Đặt ở dưới cùng */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          p: 1,
          borderTop: "1px solid",
          borderColor: "divider"
        }}
      >
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{ 
            color: "text.secondary",
            "&:hover": {
              bgcolor: "action.hover",
              color: "text.primary"
            }
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Box>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit} disabled={isActionDisabled}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleDelete} disabled={isActionDisabled}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default MeetingCard;