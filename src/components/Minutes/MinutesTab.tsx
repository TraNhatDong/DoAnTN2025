// MinutesTab.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Tabs,
  Tab,
  TextField,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  CloudUpload,
  Description,
  CheckCircle,
  PictureAsPdf,
  EditNote,
} from "@mui/icons-material";

interface MinutesTabProps {
  meetingId: string;
  role: "Thư ký" | "Thành viên";
  members?: string[];
}

interface MinutesData {
  id: string;
  meetingId: string;
  transcript: string;
  summary: string;
  status: "draft" | "published";
  approvals: Record<string, "pending" | "approved" | "rejected">;
  createdAt: string;
  updatedAt: string;
}

const MinutesTab: React.FC<MinutesTabProps> = ({ 
  meetingId, 
  role, 
  members = ["Đông", "Lan", "Minh", "Huy"] 
}) => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [tab, setTab] = useState(0);
  const [minutes, setMinutes] = useState<MinutesData | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  // 🔹 Fetch minutes data
  useEffect(() => {
    const fetchMinutes = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/minutes/${meetingId}`);
        if (res.ok) {
          const data = await res.json();
          setMinutes(data);
        }
      } catch (error) {
        console.error("Error loading minutes:", error);
        showSnackbar("Lỗi khi tải biên bản", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMinutes();
  }, [meetingId]);

  // 🔹 Auto-populate sample data for members (demo purpose)
  useEffect(() => {
    if (role === "Thành viên" && !minutes) {
      // In real app, this would come from API
      const sampleMinutes: MinutesData = {
        id: "sample",
        meetingId,
        transcript: "Biên bản chi tiết: Cuộc họp thảo luận phân công nhiệm vụ và tiến độ dự án...",
        summary: "Tóm tắt: Cuộc họp thống nhất thời hạn hoàn thành module và cách phối hợp nhóm.",
        status: "draft",
        approvals: Object.fromEntries(members.map((m) => [m, "pending"])),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMinutes(sampleMinutes);
    }
  }, [role, minutes, meetingId, members]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // 🔹 Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);
    
    // Simulate upload progress
    let p = 0;
    const progressTimer = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(progressTimer);
        processAudioFile(selectedFile);
      }
    }, 300);
  };

  // 🔹 Process audio file and create minutes
  const processAudioFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("meetingId", meetingId);

      const res = await fetch("/api/minutes/process-audio", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newMinutes = await res.json();
        setMinutes(newMinutes);
        showSnackbar("Xử lý audio thành công!", "success");
      } else {
        throw new Error("Failed to process audio");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      showSnackbar("Lỗi khi xử lý audio", "error");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // 🔹 Handle approval actions
  const handleApprove = async (member: string) => {
    if (!minutes) return;

    try {
      const res = await fetch(`/api/minutes/${minutes.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member, status: "approved" }),
      });

      if (res.ok) {
        const updatedMinutes = await res.json();
        setMinutes(updatedMinutes);
        showSnackbar("Đã xác nhận đồng ý!", "success");
      }
    } catch (error) {
      console.error("Error approving minutes:", error);
      showSnackbar("Lỗi khi xác nhận", "error");
    }
  };

  const handleReject = (member: string) => {
    if (!minutes) return;
    // Local state update for immediate UI feedback
    setMinutes(prev => prev ? {
      ...prev,
      approvals: { ...prev.approvals, [member]: "rejected" }
    } : null);
  };

  // 🔹 Handle feedback submission
  const handleSendFeedback = async () => {
    if (!feedback.trim() || !minutes) return;

    try {
      const res = await fetch(`/api/minutes/${minutes.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          member: "currentUser", // In real app, get from auth
          feedback,
          type: "revision" 
        }),
      });

      if (res.ok) {
        setFeedbackSent(true);
        setFeedback("");
        showSnackbar("Góp ý đã được gửi!", "success");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      showSnackbar("Lỗi khi gửi góp ý", "error");
    }
  };

  // 🔹 Handle publishing minutes
  const handlePublish = async () => {
    if (!minutes) return;

    try {
      const res = await fetch(`/api/minutes/${minutes.id}/publish`, {
        method: "POST",
      });

      if (res.ok) {
        const publishedMinutes = await res.json();
        setMinutes(publishedMinutes);
        showSnackbar("Đã phát hành biên bản!", "success");
      }
    } catch (error) {
      console.error("Error publishing minutes:", error);
      showSnackbar("Lỗi khi phát hành", "error");
    }
  };

  // 🔹 Handle content updates (for Secretary)
  const handleTranscriptChange = async (newTranscript: string) => {
    if (!minutes) return;
    
    setMinutes(prev => prev ? { ...prev, transcript: newTranscript } : null);
    
    // Debounced save could be implemented here
  };

  const handleSummaryChange = async (newSummary: string) => {
    if (!minutes) return;
    
    setMinutes(prev => prev ? { ...prev, summary: newSummary } : null);
    
    // Debounced save could be implemented here
  };

  const allApproved = minutes && Object.values(minutes.approvals).every(
    (v) => v === "approved"
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* 🔹 Upload Section for Secretary */}
      {role === "Thư ký" && !minutes && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center", p: 5 }}>
            <CloudUpload sx={{ fontSize: 60, color: "primary.main" }} />
            <Typography variant="h6" mt={2}>
              Tải lên file ghi âm cuộc họp
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Hệ thống sẽ tự động chuyển audio thành văn bản và tạo bản tóm tắt.
            </Typography>

            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
              disabled={uploading}
            >
              Chọn file audio
              <input 
                hidden 
                type="file" 
                accept="audio/*" 
                onChange={handleFileUpload} 
              />
            </Button>

            {uploading && (
              <Box mt={3}>
                <LinearProgress variant="determinate" value={progress} />
                <Typography variant="body2" mt={1}>
                  Đang xử lý... {progress}%
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* 🔹 Minutes Content */}
      {minutes && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            {/* Tabs for Secretary, simple view for Members */}
            {role === "Thư ký" ? (
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Biên bản chi tiết" icon={<Description />} iconPosition="start" />
                <Tab label="Bản tóm tắt" icon={<CheckCircle />} iconPosition="start" />
              </Tabs>
            ) : (
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Biên bản cuộc họp
              </Typography>
            )}

            {/* Transcript Tab (Secretary only) */}
            {tab === 0 && role === "Thư ký" && (
              <TextField
                fullWidth
                multiline
                minRows={10}
                value={minutes.transcript}
                onChange={(e) => handleTranscriptChange(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
                placeholder="Nhập nội dung biên bản chi tiết..."
              />
            )}

            {/* Summary Tab (Secretary) or Summary View (Member) */}
            {(role === "Thành viên" || tab === 1) && (
              <TextField
                fullWidth
                multiline
                minRows={6}
                value={minutes.summary}
                onChange={(e) => role === "Thư ký" && handleSummaryChange(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
                InputProps={{ readOnly: role === "Thành viên" }}
                placeholder="Tóm tắt nội dung cuộc họp..."
              />
            )}

            <Divider sx={{ my: 2 }} />

            {/* 🔹 Actions Section */}
            {role === "Thư ký" ? (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Trạng thái xác nhận của thành viên:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  {members.map((member) => (
                    <Chip
                      key={member}
                      label={`${member}: ${
                        minutes.approvals[member] === "approved"
                          ? "Đồng ý"
                          : minutes.approvals[member] === "rejected"
                          ? "Cần chỉnh sửa"
                          : "Chờ duyệt"
                      }`}
                      color={
                        minutes.approvals[member] === "approved"
                          ? "success"
                          : minutes.approvals[member] === "rejected"
                          ? "warning"
                          : "default"
                      }
                    />
                  ))}
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PictureAsPdf />}
                  onClick={handlePublish}
                  disabled={!allApproved || minutes.status === "published"}
                >
                  {minutes.status === "published" ? "Đã phát hành" : "Phát hành biên bản (PDF)"}
                </Button>
              </>
            ) : (
              <>
                {!feedbackSent ? (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Typography variant="subtitle1">
                      Bạn đồng ý với nội dung biên bản này chứ?
                    </Typography>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => handleApprove("currentUser")}
                      >
                        Tôi đồng ý
                      </Button>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<EditNote />}
                        onClick={() => handleReject("currentUser")}
                      >
                        Gửi ý kiến chỉnh sửa
                      </Button>
                    </Box>

                    {minutes.approvals["currentUser"] === "rejected" && (
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          label="Nội dung góp ý chỉnh sửa"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 1 }}
                          onClick={handleSendFeedback}
                          disabled={!feedback.trim()}
                        >
                          Gửi góp ý
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Alert severity="success">
                    ✅ Góp ý của bạn đã được gửi!
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* 🔹 Waiting Message for Members */}
      {role === "Thành viên" && !minutes && (
        <Alert severity="info">
          Biên bản cuộc họp chưa được thư ký phát hành.
        </Alert>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
};

export default MinutesTab;