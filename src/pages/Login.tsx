import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Lock as LockIcon } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 450,
  margin: "auto",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
    boxShadow: "none",
  },
}));

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname; // trang muốn đến trước khi login

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.getElementsByName("username")[0]?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "remember" ? checked : value,
    }));
    // ❌ Không reset error tự động
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ❌ KHÔNG clear error ở đây nữa
  // setError("");

  if (!formData.username || !formData.password) {
    setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
    return;
  }

  setIsLoading(true);
  try {
    console.log("🔄 Bắt đầu login...");
    const user = await login(formData.username, formData.password);
    console.log("✅ Login thành công, user:", user);

    // ✅ Clear error chỉ khi thành công
    setError("");

    if (from) {
      navigate(from, { replace: true });
    } else {
      navigate(user.role === "ADMIN" ? "/admin" : "/meetings", { replace: true });
    }
  } catch (err: any) {
    console.error("❌ Lỗi đăng nhập trong catch:", err);
    
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Đăng nhập thất bại. Vui lòng thử lại.";
    
    console.log("🚨 Setting error message:", msg);
    setError(msg);
    
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#e3f2fd",
        p: 2,
      }}
    >
      <StyledPaper elevation={4}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <LockIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h5" component="h1" sx={{ mt: 1, fontWeight: 600 }}>
            Đăng Nhập Hệ Thống Họp
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, animation: "fadeIn 0.5s" }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên đăng nhập"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            required
            autoFocus
          />

          <TextField
            fullWidth
            label="Mật khẩu"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            required
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Ghi nhớ đăng nhập"
            />
            <Typography variant="body2" color="text.secondary">
              Quên mật khẩu? Liên hệ Admin
            </Typography>
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 1, mb: 2 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Đăng Nhập"}
          </Button>
        </form>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Tài khoản do hệ thống cấp. Liên hệ Admin để được tạo.
          </Typography>
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default Login;
