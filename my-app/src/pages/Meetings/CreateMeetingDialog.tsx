import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
  Box,
  CircularProgress,
  Typography,
  Alert,
  FormHelperText,
  IconButton,
  Divider,
  Paper,
  Avatar,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  MeetingRoom as RoomIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { meetingService } from "../../services/meetingService";
import { userService } from "../../services/userService";
import { roomService } from "../../services/roomService";
import { useAuth } from "../../context/AuthContext";
import type { PaginationParams , Room ,MeetingRequest,ParticipantRequest} from "../../types";

interface CreateMeetingDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

 interface FormErrors {
  name?: string;
  startTime?: string;
  endTime?: string;
  roomId?: string;
  chuTri?: string;
  thanhVien?: string;
}

 interface FormData {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  roomId: number | "";
  chuTri: number | null;
  thanhVien: number[];
}

export const CreateMeetingDialog: React.FC<CreateMeetingDialogProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    roomId: "",
    chuTri: null,
    thanhVien: [],
  });
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<PaginationParams[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  // Reset form khi đóng/mở dialog
  useEffect(() => {
    if (open) {
      resetForm();
      fetchUsers();
    }
  }, [open]);

  // Lấy danh sách người dùng
  const fetchUsers = useCallback(async () => {
    try {
      const res = await userService.getAllUsers();
      const filtered = res.data.filter((u: PaginationParams) => u.userId !== user?.userId);
      setUsers(filtered);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách người dùng:", err);
      setSubmitError("Không thể tải danh sách người dùng");
    }
  }, [user]);

  // Lấy danh sách phòng trống
  const fetchRooms = useCallback(async (start: string, end: string) => {
    if (!start || !end) return;
    
    try {
      setLoadingRooms(true);
      setErrors(prev => ({ ...prev, roomId: undefined }));
      const res = await roomService.getAvailableRooms(start, end);
      setRooms(res.data);
      
      if (formData.roomId && !res.data.some((room: Room) => room.roomId === formData.roomId)) {
        setFormData(prev => ({ ...prev, roomId: "" }));
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách phòng:", err);
      setRooms([]);
      setErrors(prev => ({ ...prev, roomId: "Không thể tải danh sách phòng" }));
    } finally {
      setLoadingRooms(false);
    }
  }, [formData.roomId]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên cuộc họp là bắt buộc";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Thời gian bắt đầu là bắt buộc";
    }

    if (!formData.endTime) {
      newErrors.endTime = "Thời gian kết thúc là bắt buộc";
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (start >= end) {
        newErrors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
    }

    if (!formData.roomId) {
      newErrors.roomId = "Vui lòng chọn phòng họp";
    }

    if (!formData.chuTri) {
      newErrors.chuTri = "Vui lòng chọn chủ trì";
    }

    if (formData.thanhVien.length === 0) {
      newErrors.thanhVien = "Vui lòng chọn ít nhất một thành viên";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      startTime: "",
      endTime: "",
      roomId: "",
      chuTri: null,
      thanhVien: [],
    });
    setErrors({});
    setSubmitError("");
    setRooms([]);
  };

  // Effect để fetch rooms khi thời gian thay đổi
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (start < end) {
        fetchRooms(formData.startTime, formData.endTime);
      }
    }
  }, [formData.startTime, formData.endTime, fetchRooms]);

  // Cập nhật form data
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      if (field === 'chuTri') {
        return { ...prev, [field]: value === "" ? null : Number(value) };
      }
      
      if (field === 'thanhVien') {
        return { ...prev, [field]: (value as (string | number)[]).map((v) => Number(v)) };
      }
      
      if (field === 'roomId') {
        return { ...prev, [field]: value === "" ? "" : Number(value) };
      }
      
      return { ...prev, [field]: value };
    });
    
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Chuẩn bị data để gửi API
const prepareMeetingData = (): MeetingRequest => {
  const participants: ParticipantRequest[] = [];

  if (formData.chuTri) {
    participants.push({
      userId: Number(formData.chuTri),
      role: "CT"
    });
  }

  if (user?.userId) {
    participants.push({
      userId: Number(user.userId),
      role: "TK"
    });
  }

  participants.push(
    ...formData.thanhVien.map((id) => ({
      userId: Number(id),
      role: "TV" as const
    }))
  );

  // Hàm helper thêm giây nếu chưa có
  const addSeconds = (datetime: string) =>
    datetime.length === 16 ? datetime + ":00" : datetime;

  return {
    name: formData.name.trim(),
    description: formData.description.trim(),
    startTime: addSeconds(formData.startTime),
    endTime: addSeconds(formData.endTime),
    roomId: Number(formData.roomId),
    participants
  };
};

  // Tạo cuộc họp
  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError("");

    try {
      const meetingData = prepareMeetingData();
      console.log("fjsfjd",meetingData)
      await meetingService.createMeeting(meetingData);

      onCreated();
      onClose();
      resetForm();
    } catch (err: any) {
      console.error("Lỗi tạo cuộc họp:", err);
      
      if (err.response?.data?.message) {
        setSubmitError(err.response.data.message);
      } else if (err.message?.includes("End time must be after start time")) {
        setSubmitError("Thời gian kết thúc phải sau thời gian bắt đầu");
      } else {
        setSubmitError("Có lỗi xảy ra khi tạo cuộc họp");
      }
    } finally {
      setLoading(false);
    }
  };

  // Danh sách thành viên khả dụng (loại bỏ chủ trì)
  const availableThanhVien = users.filter((u) => u.userId !== formData.chuTri);

  // Format date for display
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10],
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon />
          <Typography variant="h6" component="span">
            Tạo cuộc họp mới
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ color: 'white' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {submitError && (
          <Alert 
            severity="error" 
            sx={{ 
              mx: 3, 
              mt: 2,
              borderRadius: 1
            }}
            onClose={() => setSubmitError('')}
          >
            {submitError}
          </Alert>
        )}

        <Box sx={{ p: 3 }}>
          {/* Layout chính không dùng Grid */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Thông tin cuộc họp */}
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" />
                Thông tin cuộc họp
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Tên cuộc họp"
                  fullWidth
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  variant="outlined"
                  size="small"
                />

                <TextField
                  label="Mô tả"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  variant="outlined"
                  size="small"
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Thời gian bắt đầu"
                      type="datetime-local"
                      fullWidth
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.startTime}
                      helperText={errors.startTime}
                      required
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Thời gian kết thúc"
                      type="datetime-local"
                      fullWidth
                      value={formData.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.endTime}
                      helperText={errors.endTime}
                      required
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>

                {formData.startTime && formData.endTime && (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      backgroundColor: theme.palette.success.light,
                      borderColor: theme.palette.success.main
                    }}
                  >
                    <Typography variant="body2" color="success.dark">
                      <strong>Thời gian đã chọn:</strong><br />
                      {formatDateTime(formData.startTime)} - {formatDateTime(formData.endTime)}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Paper>

            {/* Phòng họp và Thành phần tham gia */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              {/* Phòng họp */}
              <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RoomIcon color="primary" />
                  Phòng họp
                </Typography>

                <FormControl fullWidth error={!!errors.roomId} size="small">
                  <InputLabel>Chọn phòng họp</InputLabel>
                  <Select
                    value={formData.roomId}
                    onChange={(e) => handleChange('roomId', e.target.value)}
                    disabled={loadingRooms}
                    input={<OutlinedInput label="Chọn phòng họp" />}
                  >
                    {loadingRooms ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} /> &nbsp; Đang tải phòng...
                      </MenuItem>
                    ) : rooms.length > 0 ? (
                      rooms.map((room) => (
                        <MenuItem key={room.roomId} value={room.roomId}>
                          <ListItemText
                            primary={room.roomName}
                            secondary={`${room.capacity} chỗ • ${room.floor}`}
                          />
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        {formData.startTime && formData.endTime 
                          ? "Không có phòng trống trong khoảng thời gian này" 
                          : "Vui lòng chọn thời gian trước"}
                      </MenuItem>
                    )}
                  </Select>
                  {errors.roomId && <FormHelperText>{errors.roomId}</FormHelperText>}
                </FormControl>
              </Paper>

              {/* Thành phần tham gia */}
              <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon color="primary" />
                  Thành phần tham gia
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth error={!!errors.chuTri} size="small">
                    <InputLabel>Chủ trì</InputLabel>
                    <Select
                      value={formData.chuTri !== null ? formData.chuTri : ""}
                      onChange={(e) => handleChange('chuTri', e.target.value)}
                      input={<OutlinedInput label="Chủ trì" />}
                    >
                      <MenuItem value="">Chọn chủ trì</MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.userId} value={user.userId}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                              {user.firstName[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.chuTri && <FormHelperText>{errors.chuTri}</FormHelperText>}
                  </FormControl>

                  <FormControl fullWidth error={!!errors.thanhVien} size="small">
                    <InputLabel>Thành viên</InputLabel>
                    <Select
                      multiple
                      value={formData.thanhVien}
                      onChange={(e) => handleChange('thanhVien', e.target.value)}
                      input={<OutlinedInput label="Thành viên" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as number[]).map((value) => {
                            const user = users.find((u) => u.userId === value);
                            return user ? (
                              <Chip 
                                key={value} 
                                label={`${user.firstName} ${user.lastName}`}
                                onDelete={() => {
                                  handleChange('thanhVien', formData.thanhVien.filter(id => id !== value));
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                size="small"
                              />
                            ) : null;
                          })}
                        </Box>
                      )}
                    >
                      {availableThanhVien.map((user) => (
                        <MenuItem key={user.userId} value={user.userId}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                              {user.firstName[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.thanhVien && <FormHelperText>{errors.thanhVien}</FormHelperText>}
                  </FormControl>

                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      backgroundColor: theme.palette.grey[50],
                      borderColor: theme.palette.grey[300]
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon color="primary" />
                      Thư ký (Bạn)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.success.main }}>
                        {user?.firstName?.[0]}
                      </Avatar>
                      <Typography variant="body2">
                        {user?.firstName} {user?.lastName}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          startIcon={<CloseIcon />}
        >
          Đóng
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button 
          onClick={resetForm}
          variant="text"
          disabled={loading}
        >
          Đặt lại
        </Button>
        <Button 
          variant="contained" 
          onClick={handleCreate} 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <ScheduleIcon />}
          sx={{ minWidth: 120 }}
        >
          {loading ? "Đang tạo..." : "Tạo cuộc họp"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};