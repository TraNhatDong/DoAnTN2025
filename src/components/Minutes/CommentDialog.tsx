import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from "@mui/material";
import { Send } from "@mui/icons-material";

interface CommentDialogProps {
  open: boolean;
  onClose: () => void;
}

const CommentDialog: React.FC<CommentDialogProps> = ({ open, onClose }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    // Handle comment submission
    console.log("Comment submitted:", comment);
    onClose();
    setComment("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Gửi ý kiến chỉnh sửa</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          placeholder="Nhập ý kiến chỉnh sửa của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" startIcon={<Send />}>
          Gửi ý kiến
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;