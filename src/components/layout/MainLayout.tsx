import React, { type ReactNode, useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Chip,
  Drawer,
  useMediaQuery,
  useTheme,
  Badge,
  Tooltip,
  Divider,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Logout,
  Notifications,
  Menu as MenuIcon,
  Person,
  ChevronLeft,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

// ========================== TYPES ==========================
interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface Props {
  title: string | BreadcrumbItem[];
  children: ReactNode;
  showSidebar?: boolean;
}

// ========================== MAIN LAYOUT ==========================
const MainLayout: React.FC<Props> = ({
  title,
  children,
  showSidebar = true,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(showSidebar);

  // Đóng sidebar trên mobile khi chuyển route
  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile, mobileOpen]);

  // ========================== HANDLERS ==========================
  const handleMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleClose();
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  const sidebarWidth = 280;
  const collapsedSidebarWidth = 73;

  const mainContentWidth = sidebarOpen
    ? `calc(100% - ${sidebarWidth}px)`
    : `calc(100% - ${collapsedSidebarWidth}px)`;

  const mainContentMargin = sidebarOpen
    ? `${sidebarWidth}px`
    : `${collapsedSidebarWidth}px`;

  // ========================== BREADCRUMB RENDER ==========================
  const renderTitle = () => {
    if (typeof title === "string") {
      return (
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            color: "text.primary",
            fontSize: { xs: "1.1rem", md: "1.25rem" },
          }}
        >
          {title}
        </Typography>
      );
    }

    return (
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          flexGrow: 1,
          "& .MuiBreadcrumbs-separator": { mx: 1 },
        }}
      >
        {title.map((item, index) =>
          item.path ? (
            <Link
              key={index}
              underline="hover"
              color="primary"
              sx={{ cursor: "pointer", fontWeight: 500 }}
              onClick={() => navigate(item.path!)}
            >
              {item.label}
            </Link>
          ) : (
            <Typography
              key={index}
              color="text.primary"
              sx={{ fontWeight: 600 }}
            >
              {item.label}
            </Typography>
          )
        )}
      </Breadcrumbs>
    );
  };

  // ========================== RETURN ==========================
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* --- APP BAR --- */}
      <AppBar
        position="fixed"
        sx={{
          width: { xs: "100%", md: mainContentWidth },
          ml: { xs: 0, md: mainContentMargin },
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          {/* Sidebar Toggle Button */}
          {showSidebar && (
            <Tooltip title={sidebarOpen ? "Ẩn sidebar" : "Hiện sidebar"}>
              <IconButton
                color="inherit"
                aria-label="toggle sidebar"
                edge="start"
                onClick={handleSidebarToggle}
                sx={{
                  mr: 2,
                  display: { xs: "none", md: "flex" },
                }}
              >
                {sidebarOpen ? <ChevronLeft /> : <MenuIcon />}
              </IconButton>
            </Tooltip>
          )}

          {/* Mobile Menu Button */}
          {showSidebar && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Title / Breadcrumb */}
          {renderTitle()}

          {/* User Role Chip */}
         {user?.role === "ADMIN" && (
  <Chip
    label="Quản trị viên"
    size="small"
    color="secondary"
    variant="filled"
    sx={{
      mr: 2,
      display: { xs: "none", sm: "flex" },
      fontWeight: 500,
    }}
  />
)}


          {/* User Avatar */}
          <Tooltip title="Tài khoản">
            <IconButton color="inherit" onClick={handleMenu} sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 36,
                  height: 36,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  border: "2px solid",
                  borderColor: "primary.light",
                }}
              >
                {user?.lastName?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 220,
                borderRadius: 2,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1.2,
                },
              },
            }}
          >
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 40,
                    height: 40,
                    fontSize: "1rem",
                  }}
                >
                  {user?.firstName?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" noWrap>
                    {user?.firstName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            <MenuItem
  onClick={() => {
    handleClose();
    navigate("/profile");
  }}
>
  <Person fontSize="small" sx={{ mr: 1.5, opacity: 0.7 }} />
  Thông tin tài khoản
</MenuItem>


            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1.5, opacity: 0.7 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* --- SIDEBAR --- */}
      {showSidebar && (
        <Box
          component="nav"
          sx={{
            width: {
              md: sidebarOpen ? sidebarWidth : collapsedSidebarWidth,
            },
            flexShrink: { md: 0 },
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: sidebarWidth,
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            <Sidebar
              onMenuToggle={(path) => navigate(path)}
              isMobile={true}
              sidebarOpen={true}
            />
          </Drawer>

          {/* Desktop Drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: sidebarOpen ? sidebarWidth : collapsedSidebarWidth,
                bgcolor: "background.paper",
                borderRight: "1px solid",
                borderColor: "divider",
                position: "fixed",
                height: "100vh",
                overflowX: "hidden",
                transition: theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              },
            }}
            open
          >
            <Sidebar
              onMenuToggle={(path) => navigate(path)}
              isMobile={false}
              sidebarOpen={sidebarOpen}
            />
          </Drawer>
        </Box>
      )}

      {/* --- MAIN CONTENT --- */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: "100%", md: mainContentWidth },
          ml: { xs: 0, md: sidebarOpen ? 0 : "0px" },
          mt: "64px",
          minHeight: "calc(100vh - 64px)",
          bgcolor: "background.default",
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
