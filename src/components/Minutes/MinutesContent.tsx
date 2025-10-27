import React from "react";
import { Card, CardContent, Typography, Box, Button, Paper, Chip } from "@mui/material";
import { Download } from "@mui/icons-material";

const MinutesContent: React.FC = () => {
  const minutesData = {
    content: `BIÊN BẢN HỌP NHÓM 02 - MÔN CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT

Thời gian: 09:00 - 11:00, Thứ 3, 15/04/2024
Địa điểm: Phòng họp A1 - Tòa nhà B
Chủ trì: Minh Ho Như
Thư ký: Trần Văn Long

NỘI DUNG CUỘC HỌP:

1. Triển khai kế hoạch thực hành tuần 3
2. Phân chia nhiệm vụ bài tập lớn
3. Thảo luận về tiến độ dự án

KẾT LUẬN:
- Hoàn thành bài tập thực hành số 3 trước 20/04/2024
- Phân công nhiệm vụ bài tập lớn:
  + Nguyễn Thị Hoa: Thiết kế database
  + Lê Quốc Dũng: Viết API
  + Phạm Văn Nam: Frontend
  + Hoàng Thị Lan: Testing
- Họp tiếp theo: 22/04/2024`,
    status: "draft",
    createdBy: "Trần Văn Long",
    createdAt: "15/04/2024 11:30"
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "default";
      case "review": return "warning";
      case "signed": return "info";
      case "approved": return "success";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "Bản nháp";
      case "review": return "Đang xét duyệt";
      case "signed": return "Đã ký";
      case "approved": return "Hoàn thành";
      default: return status;
    }
  };

  return (
    <Card sx={{ borderRadius: 2, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Nội dung biên bản
          </Typography>
          <Chip 
            label={getStatusLabel(minutesData.status)} 
            color={getStatusColor(minutesData.status) as any}
          />
        </Box>
        
        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'grey.50', whiteSpace: 'pre-line' }}>
          {minutesData.content}
        </Paper>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Tạo bởi: {minutesData.createdBy} - {minutesData.createdAt}
          </Typography>
          <Button startIcon={<Download />} size="small">
            Tải xuống
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MinutesContent;