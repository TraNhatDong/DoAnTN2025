import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  TextField,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { signatureService } from "../../services/signatureService";

interface VerificationResult {
  valid: boolean;
  message: string;
  signer?: string;
  signedAt?: string;
  signatureDetails?: {
    issuer: string;
    timestamp: string;
    algorithm: string;
  };
}

interface MinuteInfo {
 pdfPath: string;      // Đường dẫn tới file PDF
  minuteId: string;     // ID của biên bản
  meetingId: string; 
  sigPath: string;
  createdAt?: string; 
}

const VerifyMinutePage1: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Đổi thành id để khớp với router verify/:id
  const navigate = useNavigate();
  const [inputMinuteId, setInputMinuteId] = useState<string>(id || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [minuteInfo, setMinuteInfo] = useState<MinuteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tự động xác thực khi có id từ URL
  useEffect(() => {
    if (id) {
      setInputMinuteId(id);
      handleVerify(id);
    }
  }, [id]);

  const handleVerify = async (verifyId?: string) => {
    const targetId = verifyId || inputMinuteId.trim();
    
    if (!targetId) {
      setError("Vui lòng nhập ID biên bản");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);
    setMinuteInfo(null);

    try {
      // Lấy thông tin biên bản
      const minuteData = await signatureService.getMinute(targetId);
      console.log("Minute data:", minuteData);
      setMinuteInfo(minuteData);

      // Xác thực chữ ký
      const verificationResponse = await signatureService.verifyPaths(
        minuteData.pdfPath, 
        minuteData.sigPath
      );
      setResult(verificationResponse);
      
      // Update URL nếu đang ở route không có param
      if (!id && targetId) {
        navigate(`/verify/${targetId}`, { replace: true });
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      const errorMessage = err.response?.data?.message 
        || err.message 
        || "Không thể xác thực. Vui lòng kiểm tra lại ID.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputMinuteId("");
    setResult(null);
    setMinuteInfo(null);
    setError(null);
    navigate('/verify');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputMinuteId.trim()) {
      handleVerify();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        py: 6,
        px: 2,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 600,
          p: 3,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent>
          {/* Header với nút back */}
          <Box display="flex" alignItems="center" mb={2}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              Quay lại
            </Button>
            <Typography variant="h4" fontWeight="bold" color="primary">
              🔍 Xác thực biên bản
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" mb={3}>
            {id 
              ? `Đang xác thực biên bản: ${id}`
              : "Nhập ID biên bản để kiểm tra tính hợp lệ của chữ ký số"
            }
          </Typography>

          {/* Minute ID Input - Ẩn khi có ID từ URL */}
          {!id && (
            <Stack spacing={2} mb={3}>
              <TextField
                label="ID Biên bản"
                value={inputMinuteId}
                onChange={(e) => setInputMinuteId(e.target.value)}
                placeholder="Nhập mã ID biên bản..."
                fullWidth
                disabled={loading}
                onKeyPress={handleInputKeyPress}
              />
              
              <Alert severity="info">
                <Typography variant="body2">
                  ID biên bản thường được cung cấp sau khi ký số hoặc trong email xác nhận.
                  Bạn cũng có thể truy cập trực tiếp qua URL: /verify/ID_BIEN_BAN
                </Typography>
              </Alert>
            </Stack>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={loading}
            >
              {id ? "Kiểm tra ID khác" : "Làm mới"}
            </Button>
            {!id && (
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                onClick={() => handleVerify()}
                disabled={!inputMinuteId.trim() || loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? "Đang xác thực..." : "Xác thực"}
              </Button>
            )}
          </Stack>

          {/* Loading state khi có ID từ URL */}
          {id && loading && (
            <Box textAlign="center" py={4}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" mt={2}>
                Đang xác thực biên bản...
              </Typography>
            </Box>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {/* Minute Information */}
          {minuteInfo && (
            <Card sx={{ mt: 3, p: 2, backgroundColor: "background.default" }}>
              <Typography variant="h6" gutterBottom>
                📄 Thông tin biên bản
              </Typography>
              <Stack spacing={1}>
                <Box display="flex">
                  <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 100 }}>
                    ID:
                  </Typography>
                  <Typography variant="body2">{minuteInfo.meetingId}</Typography>
                </Box>
                <Box display="flex">
                  <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 100 }}>
                    Tiêu đề:
                  </Typography>
                  <Typography variant="body2">{minuteInfo.minuteId}</Typography>
                </Box>
                <Box display="flex">
                  <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 100 }}>
                    Ngày tạo:
                  </Typography>
                  <Typography variant="body2">
                    {/* {new Date(minuteInfo.createdAt).toLocaleString("vi-VN")} */}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          )}

          {/* Verification Result */}
          {result && (
            <Card
              sx={{
                mt: 3,
                p: 3,
                backgroundColor: result.valid ? "#f0f9f0" : "#fef0f0",
                border: `1px solid ${result.valid ? "#4caf50" : "#f44336"}`,
                borderRadius: 2,
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                {result.valid ? (
                  <CheckCircleIcon sx={{ color: "success.main", mr: 1, fontSize: 32 }} />
                ) : (
                  <ErrorIcon sx={{ color: "error.main", mr: 1, fontSize: 32 }} />
                )}
                <Typography variant="h6" color={result.valid ? "success.main" : "error"}>
                  {result.valid ? "Chữ ký hợp lệ" : "Chữ ký không hợp lệ"}
                </Typography>
                <Chip 
                  label={result.valid ? "HỢP LỆ" : "KHÔNG HỢP LỆ"} 
                  color={result.valid ? "success" : "error"}
                  sx={{ ml: 2 }}
                  size="small"
                />
              </Box>

              <Typography variant="body2" mb={2}>
                {result.message}
              </Typography>

              <Stack spacing={1}>
                {result.signer && (
                  <Box display="flex">
                    <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 100 }}>
                      Người ký:
                    </Typography>
                    <Typography variant="body2">{result.signer}</Typography>
                  </Box>
                )}
                {result.signedAt && (
                  <Box display="flex">
                    <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 100 }}>
                      Thời gian ký:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(result.signedAt).toLocaleString("vi-VN")}
                    </Typography>
                  </Box>
                )}
                {result.signatureDetails && (
                  <>
                    {result.signatureDetails.issuer && (
                      <Box display="flex">
                        <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 100 }}>
                          Nhà cung cấp:
                        </Typography>
                        <Typography variant="body2">{result.signatureDetails.issuer}</Typography>
                      </Box>
                    )}
                    {result.signatureDetails.algorithm && (
                      <Box display="flex">
                        <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 100 }}>
                          Thuật toán:
                        </Typography>
                        <Typography variant="body2">{result.signatureDetails.algorithm}</Typography>
                      </Box>
                    )}
                  </>
                )}
              </Stack>

              {/* Shareable link */}
              <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
                <Typography variant="body2" fontWeight="bold" mb={1}>
                  🔗 Link xác thực công khai:
                </Typography>
                <Typography variant="body2" fontFamily="monospace" color="primary">
                  {window.location.origin}/verify/{id || inputMinuteId}
                </Typography>
              </Box>
            </Card>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyMinutePage1;