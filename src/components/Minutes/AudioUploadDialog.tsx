import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress
} from "@mui/material";
import { CloudUpload, Upload } from "@mui/icons-material";

interface AudioUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

const AudioUploadDialog: React.FC<AudioUploadDialogProps> = ({ open, onClose }) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = (file: File) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onClose();
          setUploadProgress(0);
        }, 500);
      }
    }, 200);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload />
          Upload File Audio
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Chọn file audio ghi âm cuộc họp để chuyển đổi thành biên bản tự động.
        </Typography>
        
        {uploadProgress > 0 ? (
          <UploadProgress progress={uploadProgress} />
        ) : (
          <UploadButton onFileSelect={handleUpload} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
      </DialogActions>
    </Dialog>
  );
};

const UploadProgress: React.FC<{ progress: number }> = ({ progress }) => (
  <Box sx={{ width: '100%' }}>
    <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
      Đang upload... {progress}%
    </Typography>
  </Box>
);

const UploadButton: React.FC<{ onFileSelect: (file: File) => void }> = ({ onFileSelect }) => (
  <Button
    variant="outlined"
    component="label"
    fullWidth
    sx={{ py: 2, borderStyle: 'dashed' }}
  >
    <Upload sx={{ mr: 1 }} />
    Chọn file audio
    <input
      type="file"
      hidden
      accept="audio/*"
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          onFileSelect(e.target.files[0]);
        }
      }}
    />
  </Button>
);

export default AudioUploadDialog;