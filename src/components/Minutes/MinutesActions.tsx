import React from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import {
  CloudUpload,
  Description,
  Edit,
  TaskAlt,
  ThumbUp,
  ThumbDown,
  Comment
} from "@mui/icons-material";

interface MinutesActionsProps {
  role: string;
  onUploadAudio: () => void;
  onReject: () => void;
}

const MinutesActions: React.FC<MinutesActionsProps> = ({ 
  role, 
  onUploadAudio, 
  onReject 
}) => {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Hành động
        </Typography>

        {role === "SECRETARY" && <SecretaryActions onUploadAudio={onUploadAudio} />}
        {role === "MEMBER" && <MemberActions onReject={onReject} />}
        {role === "HOST" && <HostActions onReject={onReject} />}
      </CardContent>
    </Card>
  );
};

const SecretaryActions: React.FC<{ onUploadAudio: () => void }> = ({ onUploadAudio }) => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    <Button
      variant="contained"
      startIcon={<CloudUpload />}
      onClick={onUploadAudio}
    >
      Upload Audio
    </Button>
    <Button variant="outlined" startIcon={<Edit />}>
      Chỉnh sửa biên bản
    </Button>
    <Button variant="contained" color="success" startIcon={<TaskAlt />}>
      Ký biên bản
    </Button>
  </Box>
);

const MemberActions: React.FC<{ onReject: () => void }> = ({ onReject }) => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    <Button variant="outlined" color="success" startIcon={<ThumbUp />}>
      Đồng ý
    </Button>
    <Button variant="outlined" color="error" startIcon={<ThumbDown />} onClick={onReject}>
      Ý kiến chỉnh sửa
    </Button>
    <Button variant="outlined" startIcon={<Comment />}>
      Xem lịch sử chỉnh sửa
    </Button>
  </Box>
);

const HostActions: React.FC<{ onReject: () => void }> = ({ onReject }) => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    <Button variant="outlined" color="success" startIcon={<ThumbUp />}>
      Đồng ý
    </Button>
    <Button variant="outlined" color="error" startIcon={<ThumbDown />} onClick={onReject}>
      Ý kiến chỉnh sửa
    </Button>
    <Button variant="outlined" startIcon={<Comment />}>
      Xem lịch sử chỉnh sửa
    </Button>
    <Button variant="contained" color="success" startIcon={<TaskAlt />}>
      Phát hành biên bản
    </Button>
  </Box>
);

export default MinutesActions;