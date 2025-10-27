import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "./context/AuthContext"; // 👈 thêm dòng này

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a75d0ff" },
    secondary: { main: "#f50057" },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider> {/* 👈 Bọc toàn bộ app ở đây */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
