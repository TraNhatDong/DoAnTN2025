import React, { useState } from "react";
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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import SignatureIcon from "@mui/icons-material/Edit";
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

const VerifyMinutePage: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "original" | "signature"
  ) => {
    const file = event.target.files?.[0] || null;
    
    if (!file) return;

    if (type === "original") {
      // Validate PDF file
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
        setError("Vui lòng chọn file PDF cho biên bản gốc");
        return;
      }
      setOriginalFile(file);
    } else {
      // Validate signature file
      if (!file.name.toLowerCase().endsWith('.sig') && !file.name.toLowerCase().endsWith('.pdf.sig')) {
        setError("Vui lòng chọn file chữ ký (.sig hoặc .pdf.sig)");
        return;
      }
      setSignatureFile(file);
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File không được vượt quá 10MB");
      return;
    }
    
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setOriginalFile(null);
    setSignatureFile(null);
    setResult(null);
    setError(null);
    
    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => (input as HTMLInputElement).value = '');
  };

  const handleVerify = async () => {
    if (!originalFile || !signatureFile) {
      setError("Vui lòng chọn đủ cả hai file để xác thực.");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const response = await signatureService.verifyUpload(originalFile, signatureFile);
      setResult(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message 
        || err.message 
        || "Không thể xác thực. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = originalFile && signatureFile;

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
            🔍 Xác thực biên bản đã ký số
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={3}>
            Tải lên file PDF gốc và file chữ ký (.sig) để kiểm tra tính hợp lệ của chữ ký số.
          </Typography>

          {/* File Upload Section */}
          <Stack spacing={3} mb={3}>
            {/* Original PDF File */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                Biên bản gốc (PDF)
              </Typography>
              <Button
                component="label"
                fullWidth
                variant="outlined"
                startIcon={<DescriptionIcon />}
                sx={{
                  height: 'auto',
                  minHeight: 56,
                  borderStyle: originalFile ? "solid" : "dashed",
                  borderWidth: originalFile ? 1 : 2,
                  justifyContent: "flex-start",
                  py: 1,
                }}
              >
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                  <Typography noWrap variant="body2" fontWeight="medium">
                    {originalFile ? originalFile.name : "Chọn file PDF gốc"}
                  </Typography>
                  {originalFile && (
                    <Typography variant="caption" color="text.secondary">
                      Kích thước: {formatFileSize(originalFile.size)}
                    </Typography>
                  )}
                </Box>
                <input
                  type="file"
                  hidden
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileChange(e, "original")}
                />
              </Button>
            </Box>

            {/* Signature File */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                File chữ ký (.sig)
              </Typography>
              <Button
                component="label"
                fullWidth
                variant="outlined"
                startIcon={<SignatureIcon />}
                sx={{
                  height: 'auto',
                  minHeight: 56,
                  borderStyle: signatureFile ? "solid" : "dashed",
                  borderWidth: signatureFile ? 1 : 2,
                  justifyContent: "flex-start",
                  py: 1,
                }}
              >
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                  <Typography noWrap variant="body2" fontWeight="medium">
                    {signatureFile ? signatureFile.name : "Chọn file chữ ký (.sig)"}
                  </Typography>
                  {signatureFile && (
                    <Typography variant="caption" color="text.secondary">
                      Kích thước: {formatFileSize(signatureFile.size)}
                    </Typography>
                  )}
                </Box>
                <input
                  type="file"
                  hidden
                  accept=".sig,.pdf.sig"
                  onChange={(e) => handleFileChange(e, "signature")}
                />
              </Button>
            </Box>
          </Stack>

          {/* File Requirements */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Yêu cầu:</strong>
            </Typography>
            <Typography variant="body2">
              • File PDF gốc: Định dạng .pdf
            </Typography>
            <Typography variant="body2">
              • File chữ ký: Định dạng .sig hoặc .pdf.sig
            </Typography>
          </Alert>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
              disabled={loading}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleVerify}
              disabled={!isFormValid || loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : "Xác thực"}
            </Button>
          </Stack>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
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
                      Thời gian:
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
            </Card>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyMinutePage;