
import React, { useEffect, useState } from "react";
import { meetingService } from "../../services/meetingService";
import { userService } from "../../services/userService";
import { summaryService } from "../../services/summaryService";
import { audioService } from "../../services/audioService";
import { signatureService } from "../../services/signatureService";
import { useNavigate } from "react-router-dom";
import type { Meeting,TranscriptData,SummaryData,ReviewData,MinuteData } from "../../types";

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
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  IconButton,
  CardHeader,
  Collapse,
  AlertTitle,
  Tooltip,
} from "@mui/material";
import {
  CloudUpload,
  Description,
  CheckCircle,
  AssignmentTurnedIn,
  PictureAsPdf,
  EditNote,
  Approval,
  Send,
  VerifiedUser,
  Group,
  Chair,
  ExpandMore,
  ExpandLess,
  Download,
  Email,
  Comment,
  TaskAlt,
  Cancel,
  PlayArrow,
  Mic,
  Assignment,
  Lock,
  Public,
  Refresh,
} from "@mui/icons-material";

// ---------------- INTERFACES ----------------
interface MinutesTabProps {
  meetingId: string;
  role: string;
  currentUserId: number;
}

interface User {
  id: string;
  name: string;
  role: "Thư ký" | "Thành viên" | "Chủ trì";
  avatar?: string;
}

interface WorkflowStep {
  label: string;
  icon: React.ReactNode;
  description: string;
  status: "pending" | "current" | "completed" | "error";
}

// ---------------- CONSTANTS ----------------
const WORKFLOW_STEPS = [
  { label: 'Upload Audio', icon: <CloudUpload />, description: 'Tải lên file ghi âm' },
  { label: 'Xử lý AI', icon: <Mic />, description: 'Chuyển đổi thành văn bản' },
  { label: 'Thành viên xác nhận', icon: <Group />, description: 'Các thành viên duyệt biên bản' },
  { label: 'Chủ trì phê duyệt', icon: <Chair />, description: 'Chủ trì phê duyệt cuối cùng' },
  { label: 'Tạo & Phát hành', icon: <PictureAsPdf />, description: 'Ký số và phát hành' },
];

// ---------------- MAIN COMPONENT ----------------
const MinutesTab: React.FC<MinutesTabProps> = ({ meetingId, role, currentUserId }) => {
  // State declarations
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
   const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [minute, setMinute] = useState<MinuteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | false>(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [participants, setParticipants] = useState<User[]>([]);
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();


  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (!meetingId) return;
    fetchAllData();
  }, [meetingId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // ---------------- DATA FETCHING ----------------
  const fetchAllData = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [participantsRes, transcriptRes, summaryRes, minuteRes,meetingres] = await Promise.all([
        fetchParticipants(),
        summaryService.getTranscript(meetingId).catch(() => null),
        summaryService.getSummary(meetingId).catch(() => null),
        signatureService.getMinuteMeeting(meetingId).catch(() => null),
        meetingService.getMeeting(Number(meetingId))
      ]);

      setParticipants(participantsRes);
      setMeeting(meetingres.data);

      if (transcriptRes?.data) {
        setTranscript(transcriptRes.data);
        
        // Start polling if still processing
        if (transcriptRes.data.status === "PROCESSING" && !pollingInterval) {
          startPolling();
        }
      }

      if (summaryRes?.data) {
        setSummary(summaryRes.data);
        
        // Fetch reviews if summary exists
        try {
          const reviewRes = await summaryService.getReviewsBySummary(summaryRes.data.summary_id);
          setReviews(reviewRes.data || []);
        } catch (error) {
          console.error("Error fetching reviews:", error);
          setReviews([]);
        }
      }

      if (minuteRes) {
        setMinute(minuteRes);
      } else {
        setMinute(null);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar("Lỗi khi tải dữ liệu. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchParticipants = async (): Promise<User[]> => {
    try {
      const res = await meetingService.getParticipant(Number(meetingId));
      const list = res.data;

      const users = await Promise.all(
        list.map(async (p: any) => {
          try {
            const userRes = await userService.getUser(p.userId);
            const user = userRes.data;

            return {
              id: String(user.userId),
              name: `${user.firstName} ${user.lastName}`.trim(),
              role: p.role === "CT" ? "Chủ trì" : p.role === "TV" ? "Thành viên" : "Thư ký",
            };
          } catch (err) {
            console.error("Error fetching user info:", p.userId, err);
            return null;
          }
        })
      );

      return users.filter(Boolean) as User[];
    } catch (err) {
      console.error("Error fetching participants:", err);
      return [];
    }
  };

  const startPolling = () => {
    const interval = setInterval(async () => {
      try {
        const transcriptRes = await summaryService.getTranscript(meetingId);
        const transcriptData = transcriptRes.data;

        setTranscript(transcriptData);
        if (transcriptData.status === "COMPLETED" ) {
          clearInterval(interval);
          setPollingInterval(null);
          
          if (transcriptData.status === "COMPLETED") {
            showSnackbar("Xử lý transcript hoàn tất!", "success");
            const res=await summaryService.getSummary(meetingId);
            const reviewerIds = participants
            .filter((p) => p.role === "Thành viên" || p.role === "Chủ trì")
            .map((p) => p.id);
            await summaryService.addReviews(res.data.summary_id, reviewerIds, "PENDING");
            fetchAllData(); // Refresh all data
         
          } else {
            showSnackbar("Xử lý transcript thất bại. Vui lòng thử lại.", "error");
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);

    setPollingInterval(interval);
  };

  // ---------------- SNACKBAR UTILITY ----------------
  const showSnackbar = (msg: string, sev: "success" | "error" | "warning" | "info") => {
    setSnackbar({ open: true, message: msg, severity: sev });
  };

  // ---------------- AUDIO UPLOAD & PROCESSING ----------------
  const handleAudioUpload = async () => {
    if (!audioFile) {
      showSnackbar("Vui lòng chọn file audio trước.", "warning");
      return;
    }

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/aac'];
    if (!validTypes.includes(audioFile.type)) {
      showSnackbar("File không hợp lệ. Chọn file audio (MP3, WAV, M4A, AAC).", "error");
      return;
    }

    // Validate file size (50MB)
    if (audioFile.size > 50 * 1024 * 1024) {
      showSnackbar("File quá lớn. Kích thước tối đa là 50MB.", "error");
      return;
    }

    setUploading(true);
    setProcessingProgress(0);

    try {
      const res = await audioService.uploadAudio(
        meetingId,
        String(currentUserId),
        audioFile,
        (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 50) / (progressEvent.total || 1));
          setProcessingProgress(percent);
        }
      );

      console.log("Audio uploaded:", res.data);
      showSnackbar("Đã tải lên file audio. Đang xử lý...", "info");

      // Start polling for transcript status
      startPolling();

    } catch (err: any) {
      console.error("Upload error:", err);
      const errorMsg = err.response?.data?.message || "Tải lên thất bại. Vui lòng thử lại.";
      showSnackbar(errorMsg, "error");
    } finally {
      setUploading(false);
    }
  };

  // ---------------- REVIEW HANDLERS ----------------
  const handleMemberApprove = async () => {
    if (!summary) return;

    try {
      const payload = {
        status: "CONFIRMED" as const,
        comment: "Thành viên đã đồng ý với nội dung biên bản",
      };

      await summaryService.updateReview(summary.summary_id, String(currentUserId), payload);

      // Update local state
      const updatedReviews = reviews.map((r) =>
        r.user_id === String(currentUserId)
          ? { 
              ...r, 
              status: "CONFIRMED" as const, 
              comment: payload.comment,
              reviewed_at: new Date().toISOString() 
            }
          : r
      );
      setReviews(updatedReviews);

      // Check if all members have approved
      const memberReviews = getMemberReviews();
      const allMembersApproved = memberReviews.every(review => review.status === "CONFIRMED");
      if (allMembersApproved) {
        const res = await summaryService.updateStatus(summary.summary_id, "PENDING_CHAIR_APPROVAL");
        setSummary(res.data);
        showSnackbar("🎉 Tất cả thành viên đã đồng ý! Đang chờ Chủ trì phê duyệt.", "success");
      } else {
        showSnackbar("✅ Đã ghi nhận sự đồng ý của bạn.", "success");
      }
    } catch (error) {
      console.error("Approve error:", error);
      showSnackbar("Cập nhật thất bại, vui lòng thử lại.", "error");
    }
  };

  const handleMemberReject = async (comment: string) => {
    if (!summary) return;

    try {
      const payload = {
        status: "REJECTED" as const,
        comment: comment,
      };

      await summaryService.updateReview(summary.summary_id, String(currentUserId), payload);
      
      const updatedReviews = reviews.map((r) =>
        r.user_id === String(currentUserId)
          ? { 
              ...r, 
              status: "REJECTED" as const, 
              comment, 
              reviewed_at: new Date().toISOString() 
            }
          : r
      );

      const res = await summaryService.updateStatus(summary.summary_id, "REVISED");
      setSummary(res.data);
      setReviews(updatedReviews);
      setShowFeedbackDialog(false);
      setFeedback("");
      showSnackbar("Đã gửi góp ý chỉnh sửa.", "success");
    } catch (error) {
      console.error("Reject error:", error);
      showSnackbar("Gửi góp ý thất bại, vui lòng thử lại.", "error");
    }
  };

  const handleChairApprove = async () => {
    if (!summary) return;

    try {
      const res = await summaryService.updateStatus(summary.summary_id, "APPROVED");
      setSummary(res.data);
      showSnackbar("Đã phê duyệt biên bản. Thư ký có thể tiến hành tạo biên bản chính thức.", "success");
    } catch (error) {
      console.error("Chair approve error:", error);
      showSnackbar("Phê duyệt thất bại, vui lòng thử lại.", "error");
    }
  };

  const handleChairReject = async () => {
    if (!summary) return;

    try {
      const res = await summaryService.updateStatus(summary.summary_id, "REVISED");
      setSummary(res.data);
      showSnackbar("Đã yêu cầu chỉnh sửa biên bản.", "success");
    } catch (error) {
      console.error("Chair reject error:", error);
      showSnackbar("Yêu cầu chỉnh sửa thất bại, vui lòng thử lại.", "error");
    }
  };

  const handleSaveSummary = async () => {
    if (!summary) return;

    try {
      await summaryService.updateSummary(Number(summary.meeting_id),String(currentUserId), summary.content );
      fetchAllData(); // Refresh all data

      showSnackbar("Đã lưu bản tóm tắt.", "success");
    } catch (error) {
      console.error("Save summary error:", error);
      showSnackbar("Lưu thất bại, vui lòng thử lại.", "error");
    }
  };
  const handleMarkAsFixed = async (reviewId: string) => {
  try {
    
    await summaryService.updateHandled(reviewId);
    setReviews((prev) =>
      prev.map((r) =>
        r.review_id === reviewId ? { ...r, handled: true } : r
      )
    );
  } catch (err) {
    console.error("❌ Lỗi khi đánh dấu đã sửa:", err);
  }
};


  const handleResubmitForReview = async () => {
    if (!summary) return;
   try {
     const reviewerIds = participants
            .filter((p) => p.role === "Thành viên" || p.role === "Chủ trì")
            .map((p) => p.id);
      const resetReviews = await summaryService.addReviews(summary.summary_id, reviewerIds, "PENDING");
      const res = await summaryService.updateStatus(summary.summary_id, "PENDING_REVIEW");
      setSummary(res.data);
      setReviews(resetReviews.data.reviews);
      showSnackbar("Đã gửi lại phiên bản mới cho thành viên xác nhận.", "success");
       fetchAllData(); // Refresh all data
    } catch (error) {
      console.error("Resubmit error:", error);
      showSnackbar("Gửi lại thất bại, vui lòng thử lại.", "error");
    }
  };

  // ---------------- MINUTE WORKFLOW HANDLERS ----------------
  const handleCreateMinute = async () => {
    if (!summary) return;
    try {
      const newMinute = await signatureService.generateMinute(meetingId);
      setMinute(newMinute);
      // showSnackbar("Đã tạo biên bản PDF. Tiến hành ký số.", "success");
    } catch (error) {
      console.error("Create minute error:", error);
      showSnackbar("Lỗi khi tạo biên bản.", "error");
    }
  };

  const handleSignMinute = async () => {
    if (!minute) return;

    try {
      const signedMinute = await signatureService.signMinute(minute.minuteId);
      setMinute(signedMinute);
      // showSnackbar("Đã ký số biên bản thành công. Có thể phát hành.", "success");
    } catch (error) {
      console.error("Sign minute error:", error);
      showSnackbar("Lỗi khi ký số biên bản.", "error");
    }
  };

  const handlePublishMinute = async () => {
    if (!minute || !summary) return;

    try {
      const publishedMinute = await signatureService.releaseMinute(minute.minuteId);
      setMinute(publishedMinute);
      
      const summaryRes = await summaryService.updateStatus(summary.summary_id, "PUBLISHED");
      setSummary(summaryRes.data);
      
      // showSnackbar("Đã phát hành biên bản và gửi email cho tất cả thành viên!", "success");
    } catch (error) {
      console.error("Publish minute error:", error);
      showSnackbar("Lỗi khi phát hành biên bản.", "error");
    }
  };

  const handleUpdateSummary = (newContent: string) => {
    if (!summary) return;
    setSummary({ 
      ...summary, 
      content: newContent,
    });
  };

  const handleDownloadMinute = async () => {
    if (!minute) return;
    
    try {
      // Implement actual download logic here
      const pdfBlob = await signatureService.downloadFile(minute.minuteId);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biên-bản-${meetingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSnackbar("Đã tải xuống biên bản PDF.", "success");
    } catch (error) {
      console.error("Download error:", error);
      showSnackbar("Lỗi khi tải xuống biên bản.", "error");
    }
  };

  const handleSendEmail = async () => {
    if (!minute) return;

    try {
      // await signatureService.sendMinuteEmail(minute.minuteId);
      showSnackbar("Đã gửi email biên bản cho tất cả thành viên.", "success");
    } catch (error) {
      console.error("Send email error:", error);
      showSnackbar("Lỗi khi gửi email.", "error");
    }
  };

  // ---------------- HELPER FUNCTIONS ----------------
  const getCurrentUser = () => participants.find(user => user.id === String(currentUserId));

  const getUserReview = (userId: string) =>
    reviews.find(review => String(review.user_id) === String(userId));

  const getMemberReviews = () =>
    reviews.filter(review => {
      const user = participants.find(u => u.id === String(review.user_id));
      return user?.role === "Thành viên";
    });

  const getChairReview = () =>
    reviews.find(review => {
      const user = participants.find(u => u.id === String(review.user_id));
      return user?.role === "Chủ trì";
    });

  const memberReviews = getMemberReviews();
  const chairReview = getChairReview();
  const allMembersApproved = memberReviews.every(review => review.status === "CONFIRMED");
  const hasRejectedReviews = reviews.some(review => review.status === "REJECTED")&&(summary?.status==="REVISED");
  const approvedCount = memberReviews.filter(review => review.status === "CONFIRMED").length;
  const totalMembers = memberReviews.length;

  const STATUS_COLOR_MAP: Record<string, string> = {
  pending: 'grey',
  current: 'info',
  completed: 'success',
  error: 'error',
};

const STEP_BASE_COLOR: Record<string, string> = {
  'Upload Audio': 'primary',
  'Xử lý AI': 'secondary',
  'Thành viên xác nhận': 'info',
  'Chủ trì phê duyệt': 'warning',
  'Tạo & Phát hành': 'success',
};

const getWorkflowSteps = (): WorkflowStep[] => {
  const steps: WorkflowStep[] = WORKFLOW_STEPS.map(step => ({
    ...step,
    status: 'pending',
  }));

  if (!summary) return steps;

  // Step 1: Upload Audio
  if (steps[0])
    steps[0].status = transcript ? 'completed' : 'pending';

  // Step 2: AI Processing
  if (steps[1]) {
    if (!transcript) steps[1].status = 'pending';
    else {
      steps[1].status =
        transcript.status === 'COMPLETED'
          ? 'completed'
          : transcript.status === 'FAILED'
          ? 'error'
          : 'current';
    }
  }

  // Step 3: Member Review
  if (steps[2]) {
    if (['PENDING_REVIEW', 'REVISED'].includes(summary.status)) {
      steps[2].status = 'current';
    } else if (['PENDING_CHAIR_APPROVAL', 'APPROVED', 'PUBLISHED'].includes(summary.status)) {
      steps[2].status = 'completed';
    }
  }

  // Step 4: Chair Approval
  if (steps[3]) {
    if (summary.status === 'PENDING_CHAIR_APPROVAL') {
      steps[3].status = 'current';
    } else if (['APPROVED', 'PUBLISHED'].includes(summary.status)) {
      steps[3].status = 'completed';
    }
  }

  // Step 5: Create & Publish
  if (steps[4]) {
    if (summary.status === 'APPROVED') {
      steps[4].status = minute
        ? minute.status === 'PUBLISHED'
          ? 'completed'
          : 'current'
        : 'pending';
    } else if (summary.status === 'PUBLISHED') {
      steps[4].status = 'completed';
    }
  }

  // ✅ Thêm màu cho từng step
  return steps.map(step => ({
    ...step,
    color: STATUS_COLOR_MAP[step.status] || STEP_BASE_COLOR[step.label] || 'default',
  }));
};


  // ---------------- RENDER COMPONENTS ----------------
  const renderUploadSection = () => (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        avatar={<CloudUpload color="primary" />}
        title="Tải lên file audio"
        subheader="Hệ thống sẽ tự động tạo transcript và bản tóm tắt"
        action={
          <Tooltip title="Làm mới trạng thái">
            <IconButton onClick={() => fetchAllData(true)} disabled={refreshing}>
              <Refresh />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<Mic />}
            disabled={uploading}
            sx={{ minWidth: 200 }}
          >
            {audioFile ? audioFile .name : "Chọn file audio..."}
            <input
              type="file"
              hidden
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)}
            />
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!audioFile || uploading}
            onClick={handleAudioUpload}
            startIcon={uploading ? <CircularProgress size={20} /> : <PlayArrow />}
          >
            {uploading ? "Đang xử lý..." : "Bắt đầu xử lý"}
          </Button>
        </Box>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Tiến độ xử lý: {Math.round(processingProgress)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={processingProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              {processingProgress < 50 ? "Đang tải lên..." : "Đang xử lý audio..."}
            </Typography>
          </Box>
        )}

        {transcript?.status === "PROCESSING" && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Đang xử lý transcript... Vui lòng đợi trong giây lát.
            </Typography>
          </Alert>
        )}

        {transcript?.status === "FAILED" && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <AlertTitle>Xử lý thất bại</AlertTitle>
            {transcript.error_message || "Có lỗi xảy ra khi xử lý audio. Vui lòng thử lại."}
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderApprovalProgress = () => (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        avatar={<Group color="primary" />}
        title="Tiến độ xác nhận"
        subheader={`${approvedCount}/${totalMembers} thành viên đã đồng ý`}
        action={
          <IconButton onClick={() => setExpandedSection(expandedSection === 'approval' ? false : 'approval')}>
            {expandedSection === 'approval' ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
      />
      <Collapse in={expandedSection === 'approval'} timeout="auto">
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={(approvedCount / Math.max(totalMembers, 1)) * 100} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
              {approvedCount}/{totalMembers} thành viên đã xác nhận
            </Typography>
          </Box>
          
          <List dense>
            {participants
              .filter(user => user.role === "Thành viên" || user.role === "Chủ trì")
              .map(user => {
                const review = getUserReview(user.id);
                return (
                  <ListItem key={user.id}>
                    <ListItemAvatar>
                      <Badge
                        color={
                          review?.status === "CONFIRMED" ? "success" :
                          review?.status === "REJECTED" ? "error" : "default"
                        }
                        variant="dot"
                      >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {user.name}
                          {user.role === "Chủ trì" && <Chip label="Chủ trì" size="small" color="primary" />}
                        </Box>
                      }
                      secondary={
                        review?.status === "CONFIRMED" ? 
                          `✅ Đã đồng ý • ${review.reviewed_at ? new Date(review.reviewed_at).toLocaleString('vi-VN') : ''}` :
                        review?.status === "REJECTED" ? 
                          `❌ Đã từ chối • ${review.reviewed_at ? new Date(review.reviewed_at).toLocaleString('vi-VN') : ''}` : 
                          "⏳ Đang chờ xác nhận"
                      }
                    />
                    <Chip
                      label={
                        review?.status === "CONFIRMED" ? "Đồng ý" :
                        review?.status === "REJECTED" ? "Từ chối" : "Chờ"
                      }
                      color={
                        review?.status === "CONFIRMED" ? "success" :
                        review?.status === "REJECTED" ? "error" : "default"
                      }
                      size="small"
                      variant={review?.status === "PENDING" ? "outlined" : "filled"}
                    />
                  </ListItem>
                );
              })}
          </List>
        </CardContent>
      </Collapse>
    </Card>
  );

  const renderContentTabs = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Tabs 
          value={activeTab} 
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab 
            icon={<Description />} 
            label="Transcript chi tiết" 
            iconPosition="start"
          />
          <Tab 
            icon={<CheckCircle />} 
            label="Bản tóm tắt" 
            iconPosition="start"
          />
        </Tabs>

        {activeTab === 0 && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom color="primary">
              📝 Nội dung chi tiết cuộc họp
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={12}
              value={transcript?.content || ""}
              InputProps={{
                readOnly: true,
              }}
              placeholder="Nội dung transcript sẽ xuất hiện ở đây sau khi xử lý xong..."
              variant="outlined"
            />
            {!transcript?.content && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Transcript chưa có sẵn. Vui lòng tải lên file audio để hệ thống xử lý.
              </Alert>
            )}
          </Paper>
        )}

        {activeTab === 1 && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">
                📋 Bản tóm tắt cần xác nhận
              </Typography>
              {summary && (
                <Chip 
                  label={summary.status}
                  size="small" 
                  color={
                    summary.status === "PUBLISHED" ? "success" :
                    summary.status === "APPROVED" ? "primary" :
                    summary.status === "REVISED" ? "warning" : "default"
                  }
                  variant="outlined" 
                />
              )}
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={8}
              value={summary?.content || ""}
              onChange={(e) => role === "Thư ký" && summary?.status === "REVISED" && handleUpdateSummary(e.target.value)}
              InputProps={{
                readOnly: role !== "Thư ký" || summary?.status !== "REVISED",
              }}
              placeholder="Bản tóm tắt sẽ xuất hiện ở đây..."
              variant="outlined"
            />
            {summary?.status === "REVISED" && role === "Thư ký" && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Bạn đang ở chế độ chỉnh sửa. Sau khi hoàn tất, nhấn "Gửi lại xác nhận" để gửi cho thành viên.
              </Alert>
            )}
            {!summary?.content && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Bản tóm tắt chưa có sẵn. Vui lòng đợi hệ thống xử lý xong transcript.
              </Alert>
            )}
          </Paper>
        )}
      </CardContent>
    </Card>
  );

 const renderFeedbackSection = () => {
  const rejectedReviews = reviews.filter(
    review => review.status === "REJECTED" && review.comment
  );

  if (rejectedReviews.length === 0) return null;

  return (
    <Card sx={{ mb: 3 }}>
       <CardHeader
  avatar={<Comment color="warning" />}
  title="Góp ý chỉnh sửa từ thành viên"
  subheader={`Có ${rejectedReviews.length} góp ý cần xử lý`}
  action={
    role === "Thư ký"  && (
      <Button
        variant="contained"
        color="warning"
        size="small"
        onClick={() => setActiveTab(1)}
        sx={{ textTransform: 'none', borderRadius: 2 }}
      >
        Chỉnh sửa
      </Button>
    )
  }
/>
      <CardContent>
        {rejectedReviews.map(review => {
          const user = participants.find(u => u.id === review.user_id);

          // 🟩 Nếu review đã được đánh dấu là đã sửa
          const isFixed = review.handled === true;

          return (
            <Alert
              key={review.review_id}
              severity={isFixed ? "success" : "warning"}
              sx={{
                mb: 1,
                borderLeft: isFixed ? "5px solid #2e7d32" : "5px solid #ed6c02",
                bgcolor: isFixed ? "#e8f5e9" : "#fff3e0",
              }}
              action={
                role === "Thư ký" && (
                  <Button
                    variant={isFixed ? "contained" : "outlined"}
                    color={isFixed ? "success" : "inherit"}
                    size="small"
                    onClick={() => handleMarkAsFixed(review.review_id)}
                  >
                    {isFixed ? "Đã sửa" : "Đánh dấu đã sửa"}
                  </Button>
                )
              }
            >
              <AlertTitle>
                <strong>{user?.name}</strong> -{" "}
                {review.reviewed_at
                  ? new Date(review.reviewed_at).toLocaleString("vi-VN")
                  : ""}
              </AlertTitle>
              {review.comment}
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
};


  const renderMinuteWorkflow = () => {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={minute?.status === 'GENERATED' ? 0 : minute?.status === 'SIGNED' ? 1 : 2} sx={{ mb: 3 }}>
            <Step>
              <StepLabel icon={<PictureAsPdf />}>Tạo biên bản</StepLabel>
            </Step>
            <Step>
              <StepLabel icon={<Lock />}>Ký số</StepLabel>
            </Step>
            <Step>
              <StepLabel icon={<Public />}>Phát hành</StepLabel>
            </Step>
          </Stepper>

          <Box 
  sx={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    mt: 2
  }}
>
  {/* Nút TẠO BIÊN BẢN - bên trái */}
  {!minute && summary?.status==="APPROVED" && (
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
      <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PictureAsPdf />}
                  onClick={handleCreateMinute}
                  size="large"
                >
                  Tạo biên bản PDF
                </Button>
    </Box>
  )}

  {/* Nút KÝ SỐ - ở giữa */}
  {minute?.status === "GENERATED" && (
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Lock />}
        onClick={handleSignMinute}
        size="large"
      >
        Ký số biên bản
      </Button>
    </Box>
  )}

  {/* Nút PHÁT HÀNH - bên phải */}
  {minute?.status === "SIGNED" && (
    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<Public />}
        onClick={handlePublishMinute}
        size="large"
      >
        Phát hành & Gửi email
      </Button>
    </Box>
  )}
</Box>


          {minute?.status === "SIGNED" && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Biên bản đã được ký số. Bạn có thể phát hành và gửi email cho thành viên.
            </Alert>
          )}
           {minute?.status === "GENERATED" && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Đã tạo biên bản PDF. Tiến hành ký số.
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderActionButtons = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    if (minute) return null;
    if(!summary) return null;
    if(currentUser.role === "Thư ký"&&(summary.status==="PENDING_REVIEW" ||summary.status==="PENDING_CHAIR_APPROVAL"||summary.status==="APPROVED")) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thao tác
          </Typography>
          
          {/* Member Actions */}
          {currentUser.role === "Thành viên" && summary?.status === "PENDING_REVIEW" && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<TaskAlt />}
                onClick={handleMemberApprove}
                size="large"
              >
                Đồng ý biên bản
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<Cancel />}
                onClick={() => setShowFeedbackDialog(true)}
                size="large"
              >
                Góp ý chỉnh sửa
              </Button>
            </Box>
          )}

          {/* Chair Actions */}
          {currentUser.role === "Chủ trì" && summary?.status === "PENDING_CHAIR_APPROVAL" && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Approval />}
                onClick={handleChairApprove}
                size="large"
              >
                Phê duyệt biên bản
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<EditNote />}
                onClick={handleChairReject}
                size="large"
              >
                Yêu cầu chỉnh sửa
              </Button>
            </Box>
          )}

          {/* Secretary Actions */}
          {currentUser.role === "Thư ký" && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {summary?.status === "REVISED" && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditNote />}
                    onClick={handleSaveSummary}
                    size="large"
                  >
                    Lưu bản nháp
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    onClick={handleResubmitForReview}
                    size="large"
                  >
                    Gửi lại xác nhận
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* No actions available */}
          {(
            (currentUser.role === "Thành viên" && summary?.status !== "PENDING_REVIEW") ||
            (currentUser.role === "Chủ trì" && summary?.status !== "PENDING_CHAIR_APPROVAL") ||
            (currentUser.role === "Thư ký" && 
              summary?.status !== "REVISED" && 
              summary?.status !== "APPROVED" &&
              !(summary?.status === "APPROVED" && !minute))
          ) && (
            <Alert severity="info">
              Không có thao tác nào khả dụng trong trạng thái hiện tại.
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

const renderWorkflowStepper = () => {
  const steps = getWorkflowSteps();

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success.main";
      case "current":
        return "primary.main";
      case "error":
        return "error.main";
      default:
        return "text.disabled";
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stepper
          activeStep={steps.findIndex(step => step.status === "current")}
          alternativeLabel
        >
          {steps.map((step) => (
            <Step key={step.label} completed={step.status === "completed"}>
              <StepLabel
                icon={
                  <Box
                    sx={{
                      color: getStepColor(step.status),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Badge
                      color={
                        step.status === "error"
                          ? "error"
                          : step.status === "completed"
                          ? "success"
                          : step.status === "current"
                          ? "primary"
                          : "default"
                      }
                      variant={step.status === "error" ? "dot" : "standard"}
                      overlap="circular"
                    >
                      {step.icon}
                    </Badge>
                  </Box>
                }
                error={step.status === "error"}
                sx={{
                  "& .MuiStepLabel-label": {
                    color: getStepColor(step.status),
                    fontWeight: step.status === "current" ? 600 : 400,
                  },
                }}
              >
                {step.label}
                <Typography
                  variant="caption"
                  display="block"
                  color={
                    step.status === "pending"
                      ? "text.disabled"
                      : getStepColor(step.status)
                  }
                >
                  {step.description}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

  const renderPublishedMinute = () => {
    if (!minute || minute.status !== 'PUBLISHED') return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PictureAsPdf sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom color="primary">
              Biên bản đã được phát hành
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Cuộc họp dự án • {minute?.createdAt ? new Date(minute.createdAt).toLocaleDateString('vi-VN') : ''}
            </Typography>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Download />}
                onClick={handleDownloadMinute}
                size="large"
              >
                Tải biên bản PDF
              </Button>
             <Button
  variant="outlined"
  color="primary"
  startIcon={<VerifiedUser />}
  size="large"
  onClick={() => navigate("/verify")}  // chuyển tới router /verify
>
  Xác thực chữ ký
</Button>

              {(role === "Thư ký" || role === "Chủ trì") && (
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={handleSendEmail}
                  size="large"
                >
                  Gửi email lại
                </Button>
              )}
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Chip 
                icon={<TaskAlt />} 
                label="Đã ký số" 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                icon={<Public />} 
                label="Đã phát hành" 
                color="primary" 
                variant="outlined" 
              />
              
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderStatusAlert = () => {
    if (!summary) return null;

    const statusConfig = {
      DRAFT: { severity: 'info', message: 'Biên bản đang được soạn thảo' },
      PENDING_REVIEW: { severity: 'warning', message: 'Đang chờ thành viên xác nhận' },
      REVISED: { severity: 'warning', message: 'Cần chỉnh sửa theo góp ý' },
      PENDING_CHAIR_APPROVAL: { severity: 'info', message: 'Đang chờ chủ trì phê duyệt' },
      APPROVED: { severity: 'success', message: 'Đã được phê duyệt, sẵn sàng tạo biên bản' },
      PUBLISHED: { severity: 'success', message: 'Đã phát hành biên bản chính thức' },
      REVIEWED: { severity: 'info', message: 'Đã xem xét' },
    };

    const config = statusConfig[summary.status] || { severity: 'info', message: summary.status };

    return (
      <Alert severity={config.severity as any} sx={{ mb: 2 }}>
        <AlertTitle>Trạng thái hiện tại</AlertTitle>
        {config.message}
        {summary.updated_at && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Cập nhật lần cuối: {new Date(summary.updated_at).toLocaleString('vi-VN')}
          </Typography>
        )}
      </Alert>
    );
  };
  // Nếu cuộc họp chưa kết thúc
if (meeting?.status !== "COMPLETED") {

  // Nếu là thư ký
  if (role ==="Thư ký") {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
        flexDirection: 'column',
        textAlign: 'center',
        p: 3
      }}>
        <AssignmentTurnedIn
          sx={{ fontSize: 64, color: 'primary.main', mb: 2 }}
        />

        <Typography variant="h5" gutterBottom color="primary">
          Chờ cuộc họp kết thúc để upload file audio
        </Typography>

        <Typography variant="body1" color="textSecondary">
          Khi cuộc họp chuyển sang trạng thái <strong>Kết thúc</strong>, 
          bạn sẽ thấy nút <strong>Upload file audio</strong>.
        </Typography>
      </Box>
    );
  }
  // Nếu là thành viên
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 400,
      flexDirection: 'column',
      textAlign: 'center',
      p: 3
    }}>
      <Assignment sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom color="primary">
        Biên bản cuộc họp sẽ được cập nhật khi cuộc họp kết thúc
      </Typography>
      <Typography variant="body1" color="textSecondary"> 
        Vui lòng quay lại sau khi cuộc họp kết thúc để xem biên bản chi tiết.
      </Typography>
    </Box>
  );
}



  // ---------------- MAIN RENDER ----------------
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Đang tải thông tin biên bản...
          </Typography>
        </Box>
      </Box>
    );
  }

  const isPublished = minute?.status === 'PUBLISHED';
  return (
    <Box>
      {/* Header with Refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {role === "Thư ký" ? "Quản lý Biên bản cuộc họp" : "Biên bản cuộc họp"}
        </Typography>
      </Box>

      {/* Status Alert */}
      {renderStatusAlert()}

      {/* Workflow Stepper */}
     {!["DRAFT", "PENDING","APPROVED"].includes(meeting?.status ?? "") && renderWorkflowStepper()}


      {/* Published Minute View - Show for all roles when published */}
      {isPublished && renderPublishedMinute()}

      {/* Main Content - Hide when published */}
      {!isPublished && (
        <>
          {/* Upload Section - Only for secretary when no transcript */}
          {role === "Thư ký"&& !["DRAFT", "PENDING","APPROVED"].includes(meeting?.status ?? "") && (!transcript || transcript.status === "PROCESSING" || transcript.status === "FAILED") && 
            renderUploadSection()
          }

          {/* Approval Progress */}
          {transcript?.status === "COMPLETED" && summary && ["PENDING_REVIEW", "PENDING_CHAIR_APPROVAL"].includes(summary.status) &&
            renderApprovalProgress()
          }

          {/* Content Tabs */}
          {transcript?.status === "COMPLETED" && summary && 
            renderContentTabs()
          }

          {/* Feedback Section */}
          {role === "Thư ký"&&hasRejectedReviews && 
            renderFeedbackSection()
          }

          {/* Minute Workflow Section */}
          {role === "Thư ký"&&summary?.status==="APPROVED" && renderMinuteWorkflow()}

          {/* Action Buttons */}
          {renderActionButtons()}
        </>
      )}

      {/* Feedback Dialog */}
      <Dialog 
        open={showFeedbackDialog} 
        onClose={() => setShowFeedbackDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Comment color="warning" />
            Góp ý chỉnh sửa biên bản
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Vui lòng mô tả chi tiết những nội dung cần chỉnh sửa trong biên bản. Góp ý của bạn sẽ được gửi đến thư ký để cập nhật.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            label="Nội dung góp ý"
            placeholder="Ví dụ: Cần bổ sung thông tin về timeline dự án ở phần kết luận..."
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeedbackDialog(false)}>Hủy bỏ</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => handleMemberReject(feedback)}
            startIcon={<Send />}
            disabled={!feedback.trim()}
          >
            Gửi góp ý
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        message={snackbar.message}
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => setSnackbar((p) => ({ ...p, open: false }))}
          >
            Đóng
          </Button>
        }
      />
    </Box>
  );
};

export default MinutesTab;