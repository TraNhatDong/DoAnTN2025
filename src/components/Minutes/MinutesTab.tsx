// MinutesTab.tsx - UPDATED WITH SEPARATE STEPS
import React, { useEffect, useState } from "react";
import { meetingService } from "../../services/meetingService";
import { userService } from "../../services/userService";
import { summaryService } from "../../services/summaryService";
import { audioService } from "../../services/audioService";
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
} from "@mui/material";
import {
  CloudUpload,
  Description,
  CheckCircle,
  PictureAsPdf,
  EditNote,
  Approval,
  Send,
  Person,
  Group,
  Chair,
  ExpandMore,
  ExpandLess,
  Download,
  Email,
  History,
  Comment,
  TaskAlt,
  Cancel,
  PlayArrow,
  Mic,
  Assignment,
  Lock,
  Public,
} from "@mui/icons-material";

// ---------------- INTERFACES ----------------
interface MinutesTabProps {
  meetingId: string;
  role: string;
  currentUserId: Number;
}

export interface TranscriptData {
  transcript_id: string;
  meeting_id: string;
  content: string;
  status: "PROCESSING" | "COMPLETED";
  created_by: string;
  created_at: string;
  updated_at: string;
}


export interface SummaryData {
  summary_id: string;
  meeting_id: string;
  status: "DRAFT" | "PENDING_REVIEW" | "REVISED" | "PENDING_CHAIR_APPROVAL" | "APPROVAL" | "published"|"REVIEWED";
  content: string;
  created_by: string;
  created_at: string;
}

interface ReviewData {
   review_id: string;
  summary_id: string;
  user_id: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  comment: string | null;
  reviewed_at: string | null;
}

interface MinuteData {
  id: string;
  meetingId: string;
  pdfPath: string;
  sigPath: string;
  status: "created" | "signed" | "published";
  createdAt: string;
  downloadCount: number;
}

interface User {
  id: string;
  name: string;
  role: "Thư ký" | "Thành viên" | "chair";
  avatar?: string;
}


const MinutesTab: React.FC<MinutesTabProps> = ({ meetingId, role, currentUserId }) => {
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [minute, setMinute] = useState<MinuteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | false>(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Upload and processing states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
   const [participants, setParticipants] = useState<any[]>([]);

  
  useEffect(() => {
    if (!meetingId) return;

    const fetchParticipants = async () => {
      try {
        setLoading(true);

        // 1️⃣ Lấy danh sách participant
        const res = await meetingService.getParticipant(Number(meetingId));
        const list: any[] = res.data;

        // 2️⃣ Gọi API user song song để lấy tên
        const users = await Promise.all(
          list.map(async (p) => {
            try {
              const userRes = await userService.getUser(p.userId);
              const user = userRes.data;

              return {
                id: user.userId,
                name: `${user.firstName} ${user.lastName}`,
                role: p.role,
              }
            } catch (err) {
              console.error("Lỗi khi lấy thông tin user", p.userId, err);
              return {
                id: p.userId,
                name: "Không xác định",
                role: p.role,
              } 
            }
          })
        );
        console.log("fg",users)
        // 3️⃣ Lưu vào state
        setParticipants(users);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách người tham dự:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [meetingId]);
  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
          const transcriptRes = await summaryService.getTranscript(meetingId);
      const transcriptData = transcriptRes.data;
      setTranscript(transcriptData);

      // 2️⃣ Lấy summary theo meetingId hoặc transcriptId
      const summaryRes = await summaryService.getSummary(meetingId);
      const summaryData = summaryRes.data;
      setSummary(summaryData)

        setReviews([]);
        setMinute(null);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meetingId]);

  const showSnackbar = (msg: string, sev: "success" | "error") =>
    setSnackbar({ open: true, message: msg, severity: sev });

  // ---------------- AUDIO UPLOAD & PROCESSING ----------------
  const handleAudioUpload = async () => {
  if (!audioFile) {
    showSnackbar("Vui lòng chọn file audio trước.", "error");
    return;
  }

  setUploading(true);
  setProcessingProgress(0);

  try {
    // 1️⃣ Gọi API upload audio
    const res = await audioService.uploadAudio(
      meetingId,
      String(currentUserId),
      audioFile,
      (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setProcessingProgress(percent / 2); // 50% là upload, 50% là xử lý transcript
      }
    );

    const data = res.data;
    console.log("Audio uploaded:", data);

    // 2️⃣ Poll transcript
    const pollTranscript = setInterval(async () => {
      try {
        const transcriptRes = await summaryService.getTranscript(meetingId);
        if (transcriptRes.status === 200) {
          const transcriptData = transcriptRes.data;
          setTranscript({
            transcript_id: transcriptData.transcript_id,
            meeting_id: transcriptData.meeting_id,
            content: transcriptData.content,
            status: transcriptData.status,
            created_by: transcriptData.created_by,
            created_at: transcriptData.created_at,
            updated_at: transcriptData.updated_at,
          });

          // Cập nhật progress: upload 50%, processing transcript 50%
          const progress = transcriptData.status === "COMPLETED" ? 100 : 50;
          setProcessingProgress(progress);

          if (transcriptData.status === "COMPLETED") {
            clearInterval(pollTranscript);

            // 3️⃣ Lấy summary
            const summaryRes = await summaryService.getSummary(meetingId);
            if (summaryRes.status === 200) {
              const summaryData = summaryRes.data;
              setSummary({
                summary_id: summaryData.summary_id,
                meeting_id: summaryData.meeting_id,
                content: summaryData.content,
                status: summaryData.status,
                created_by: summaryData.created_by,
                created_at: summaryData.created_at,
              });

              // 4️⃣ Lấy reviews
              const reviewsRes = await summaryService.getReviewsBySummary(summaryData.summary_id);
  
        
               if (reviewsRes.status === 200) {
                 setReviews(reviewsRes.data);
               }

              showSnackbar(
                "Đã xử lý xong! Biên bản đã được gửi cho thành viên xác nhận.",
                "success"
              );
            }
          }
        }
      } catch (err) {
        console.error("Error polling transcript:", err);
      }
    }, 3000);

  } catch (err: any) {
    console.error(err);
    showSnackbar("Tải lên thất bại, vui lòng thử lại.", "error");
  } finally {
    setUploading(false);
  }
};



  // ---------------- HANDLERS ----------------
  const handleMemberApprove = () => {
    if (!summary) return;

    const updatedReviews = reviews.map(review => 
      review.user_id === String(currentUserId) 
        ? { ...review, status: "APPROVAL", reviewedAt: new Date().toISOString() }
        : review
    );

    setReviews(updatedReviews);

    const allMembersApproved = updatedReviews
      .filter(review => participants.find(u => u.id === review.user_id)?.role === "TV")
      .every(review => review.status === "CONFIRMED");

    if (allMembersApproved) {
      setSummary({ ...summary, status: "PENDING_CHAIR_APPROVAL" });
      showSnackbar("Tất cả thành viên đã đồng ý! Đang chờ Chủ trì phê duyệt.", "success");
    } else {
      showSnackbar("Đã ghi nhận sự đồng ý của bạn.", "success");
    }
  };

  const handleMemberReject = (comment: string) => {
    if (!summary) return;

    const updatedReviews = reviews.map(review => 
      review.user_id === String(currentUserId) 
        ? { ...review, status: "REJECTED", comment, reviewedAt: new Date().toISOString() }
        : review
    );

    setReviews(updatedReviews);
    setSummary({ ...summary, status: "REVISED" });
    setShowFeedbackDialog(false);
    setFeedback("");
    showSnackbar("Đã gửi góp ý chỉnh sửa.", "success");
  };

  const handleChairApprove = () => {
    if (!summary) return;
    setSummary({ ...summary, status: "APPROVAL" });
    showSnackbar("Đã phê duyệt biên bản. Thư ký có thể tiến hành tạo biên bản chính thức.", "success");
  };

  const handleChairReject = () => {
    if (!summary) return;
    setSummary({ ...summary, status: "REVISED" });
    showSnackbar("Đã yêu cầu chỉnh sửa biên bản.", "success");
  };

  const handleEditSummary = () => {
    if (!summary) return;
    setSummary({ ...summary, status: "DRAFT" });
    showSnackbar("Đã chuyển sang chế độ chỉnh sửa.", "success");
  };

  const handleSaveAndResubmit = () => {
    if (!summary) return;
    
    const resetReviews = reviews.map(review => ({
      ...review,
      status: "pending" as const,
      comment: null,
      reviewedAt: null,
    }));

    setReviews(resetReviews);
    // setSummary({ ...summary, status: "PENDING_REVIEW", version: summary.version + 1 });
    showSnackbar("Đã gửi lại phiên bản mới cho thành viên xác nhận.", "success");
  };

  // ---------------- MINUTE WORKFLOW HANDLERS ----------------
  const handleCreateMinute = async () => {
    if (!summary) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newMinute: MinuteData = {
        id: "min1",
        meetingId,
        pdfPath: "/minutes/meeting_123.pdf",
        sigPath: "",
        status: "created",
        createdAt: new Date().toISOString(),
        downloadCount: 0,
      };

      setMinute(newMinute);
      showSnackbar("Đã tạo biên bản PDF. Tiến hành ký số.", "success");
    } catch (error) {
      showSnackbar("Lỗi khi tạo biên bản.", "error");
    }
  };

  const handleSignMinute = async () => {
    if (!minute) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const signedMinute: MinuteData = {
        ...minute,
        sigPath: "/signatures/sig_123.asc",
        status: "signed",
      };

      setMinute(signedMinute);
      showSnackbar("Đã ký số biên bản thành công. Có thể phát hành.", "success");
    } catch (error) {
      showSnackbar("Lỗi khi ký số biên bản.", "error");
    }
  };

  const handlePublishMinute = async () => {
    if (!minute || !summary) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const publishedMinute: MinuteData = {
        ...minute,
        status: "published",
      };

      setMinute(publishedMinute);
      setSummary({ ...summary, status: "published" });
      showSnackbar("Đã phát hành biên bản và gửi email cho tất cả thành viên!", "success");
    } catch (error) {
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

  const handleDownloadMinute = () => {
    if (!minute) return;
    setMinute({ ...minute, downloadCount: minute.downloadCount + 1 });
    showSnackbar("Đang tải xuống biên bản...", "success");
  };

  const handleSendEmail = () => {
    showSnackbar("Đã gửi email biên bản cho tất cả thành viên.", "success");
  };

  // ---------------- HELPER FUNCTIONS ----------------
  const getCurrentUser = () => participants.find(user => user.id === currentUserId);
  const getUserReview = (userId: string) => reviews.find(review => review.user_id === userId);
  const getMemberReviews = () => reviews.filter(review => 
    participants.find(u => u.id === review.user_id)?.role === "TV"
  );

  const allMembersApproved = getMemberReviews().every(review => review.status === "CONFIRMED");
  const hasRejectedReviews = reviews.some(review => review.status === "REJECTED");
  const approvedCount = getMemberReviews().filter(review => review.status === "CONFIRMED").length;
  const totalMembers = getMemberReviews().length;

  // ---------------- RENDER COMPONENTS ----------------

  const renderUploadSection = () => (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        avatar={<CloudUpload color="primary" />}
        title="Tải lên file audio"
        subheader="Hệ thống sẽ tự động tạo transcript và bản tóm tắt"
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
            {audioFile ? audioFile.name : "Chọn file audio..."}
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
              Đang chuyển đổi speech-to-text và tạo bản tóm tắt...
            </Typography>
          </Box>
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
          <LinearProgress 
            variant="determinate" 
            value={(approvedCount / totalMembers) * 100} 
            sx={{ mb: 2, height: 8, borderRadius: 4 }}
          />
          <List dense>
            {participants
              .filter(user => user.role === "TV")
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
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        review?.status === "CONFIRMED" ? "✅ Đã đồng ý" :
                        review?.status === "REJECTED" ? "❌ Đã từ chối" : "⏳ Đang chờ"
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
                  // label={`Phiên bản ${summary.version}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              )}
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={8}
              value={summary?.content || ""}
              onChange={(e) => role === "Thư ký" && summary?.status === "DRAFT" && handleUpdateSummary(e.target.value)}
              InputProps={{
                readOnly: role !== "Thư ký" || summary?.status !== "DRAFT",
              }}
              placeholder="Bản tóm tắt sẽ xuất hiện ở đây..."
              variant="outlined"
            />
            {summary?.status === "DRAFT" && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Bạn đang ở chế độ chỉnh sửa. Sau khi hoàn tất, nhấn "Gửi lại xác nhận" để gửi cho thành viên.
              </Alert>
            )}
          </Paper>
        )}
      </CardContent>
    </Card>
  );

  const renderFeedbackSection = () => {
    const rejectedReviews = reviews.filter(review => review.status === "REJECTED" && review.comment);
    
    if (rejectedReviews.length === 0) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<Comment color="warning" />}
          title="Góp ý chỉnh sửa từ thành viên"
          subheader={`Có ${rejectedReviews.length} góp ý cần xử lý`}
        />
        <CardContent>
          {rejectedReviews.map(review => {
            const user = participants.find(u => u.id === review.user_id);
            return (
              <Alert 
                key={review.review_id}
                severity="warning" 
                sx={{ mb: 1 }}
                action={
                  role === "Thư ký" && (
                    <Button 
                      color="inherit" 
                      size="small"
                      onClick={handleEditSummary}
                    >
                      Chỉnh sửa
                    </Button>
                  )
                }
              >
                <AlertTitle>
                  <strong>{user?.name}</strong> - {review.reviewed_at ? new Date(review.reviewed_at).toLocaleString('vi-VN') : ''}
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
    if (!minute) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<Assignment color="primary" />}
          title="Quy trình biên bản chính thức"
          subheader="Tạo biên bản → Ký số → Phát hành"
        />
        <CardContent>
          <Stepper activeStep={minute.status === 'created' ? 0 : minute.status === 'signed' ? 1 : 2} sx={{ mb: 3 }}>
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

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {minute.status === "created" && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Lock />}
                onClick={handleSignMinute}
                size="large"
              >
                Ký số biên bản
              </Button>
            )}

            {minute.status === "signed" && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Public />}
                onClick={handlePublishMinute}
                size="large"
              >
                Phát hành & Gửi email
              </Button>
            )}

            {minute.status === "published" && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                  startIcon={<Email />}
                  onClick={handleSendEmail}
                  size="large"
                >
                  Gửi email lại
                </Button>
              </Box>
            )}
          </Box>

          {minute.status === "signed" && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Biên bản đã được ký số. Bạn có thể phát hành và gửi email cho thành viên.
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderActionButtons = () => {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thao tác
          </Typography>
          
          {/* Member Actions */}
          {role === "Thành viên" && summary?.status === "PENDING_REVIEW" && (
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
          {role === "chair" && summary?.status === "PENDING_CHAIR_APPROVAL" && (
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
          {role === "Thư ký" && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {summary?.status === "REVISED" && (
                <Button
                  variant="outlined"
                  startIcon={<EditNote />}
                  onClick={handleEditSummary}
                  size="large"
                >
                  Chỉnh sửa biên bản
                </Button>
              )}
              
              {summary?.status === "DRAFT" && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Send />}
                  onClick={handleSaveAndResubmit}
                  size="large"
                >
                  Gửi lại xác nhận
                </Button>
              )}

              {summary?.status === "APPROVAL" && !minute && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PictureAsPdf />}
                  onClick={handleCreateMinute}
                  size="large"
                >
                  Tạo biên bản PDF
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderWorkflowStepper = () => {
    const steps = [
      { label: 'Upload Audio', icon: <CloudUpload /> },
      { label: 'Xử lý AI', icon: <Mic /> },
      { label: 'Thành viên xác nhận', icon: <Group /> },
      { label: 'Chủ trì phê duyệt', icon: <Chair /> },
      { label: 'Tạo & Phát hành', icon: <PictureAsPdf /> },
    ];

    let activeStep = 0;
    
    if (summary) {
      switch (summary.status) {
        case 'DRAFT': activeStep = 1; break;
        case 'PENDING_REVIEW': activeStep = 2; break;
        case 'REVISED': activeStep = 2; break;
        case 'PENDING_CHAIR_APPROVAL': activeStep = 3; break;
        case 'APPROVAL': activeStep = minute ? 4 : 3; break;
        case 'published': activeStep = 4; break;
      }
    }

    if (minute && minute.status === 'published') {
      activeStep = 4;
    }

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  icon={step.icon}
                  StepIconProps={{
                    completed: index < activeStep,
                    active: index === activeStep,
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
    );
  };

  const renderPublishedMinute = () => {
    if (!minute || minute.status !== 'published') return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PictureAsPdf sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom color="primary">
              Biên bản đã được phát hành
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Cuộc họp dự án XYZ - {minute?.createdAt ? new Date(minute.createdAt).toLocaleDateString('vi-VN') : ''}
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
                startIcon={<Email />}
                onClick={handleSendEmail}
                size="large"
              >
                Gửi email lại
              </Button>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Chip 
                icon={<TaskAlt />} 
                label="Đã ký số" 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                icon={<Download />} 
                label={`${minute?.downloadCount || 0} lượt tải`} 
                color="default" 
                variant="outlined" 
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

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

  return (
    <Box>
      {/* Workflow Stepper */}
      {renderWorkflowStepper()}

      {/* Published Minute View */}
      {minute?.status === 'published' && renderPublishedMinute()}

      {/* Main Content */}
      {(!minute || minute.status !== 'published') && (
        <>
          {/* Upload Section - Only for secretary when no transcript */}
          {role === "Thư ký" && (!transcript || transcript.status === "PROCESSING") && 
            renderUploadSection()
          }

          {/* Approval Progress */}
          {(transcript?.status === "COMPLETED" && summary && summary.status !== "DRAFT") && 
            renderApprovalProgress()
          }

          {/* Content Tabs */}
          {transcript?.status === "COMPLETED" && summary && 
            renderContentTabs()
          }

          {/* Feedback Section */}
          {hasRejectedReviews && 
            renderFeedbackSection()
          }

          {/* Minute Workflow Section */}
          {minute && renderMinuteWorkflow()}

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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeedbackDialog(false)}>Hủy bỏ</Button>
          <Button
            variant="contained"
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
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
};

export default MinutesTab;