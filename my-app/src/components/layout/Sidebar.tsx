import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard,
  People,
  Inventory,
  ShoppingCart,
  AttachMoney,
  Analytics,
  Settings,
  ExpandLess,
  ExpandMore,
  ChevronRight,
  Business,
  Category,
  LocalShipping,
  Receipt,
  BarChart,
  Report,
  Security,
  MenuBook,
  CalendarMonth
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onMenuToggle: (path: string) => void;
  isMobile?: boolean;
  sidebarOpen?: boolean;
}

interface MenuItem {
  label: string;
  icon: React.ReactElement;
  path?: string;
  children?: MenuItem[];
  role?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onMenuToggle, 
  isMobile = false,
  sidebarOpen = true 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  // Danh sách menu items
  const menuItems: MenuItem[] = [
    {
      label: 'Màn hình chính',
      icon: <Dashboard />,
      path: '/meetings'
    },
    {
      label: 'Lịch họp',
      icon: <CalendarMonth />,
       path: '/calendar'
    },
    {
      label: 'Báo cáo',
      icon: <Analytics />,
      path: '/reports',
      role: ['ADMIN', 'MANAGER']
    },
    {
      label: 'Cài đặt',
      icon: <Settings />,
       role: ['ADMIN'],
      children: [
        {
          label: 'Hệ thống',
          icon: <Settings />,
          path: '/system-settings'
          
        },
        {
          label: 'Người dùng',
          icon: <People />,
          path: '/user-management',
          role: ['ADMIN']
        },
        {
          label: 'Phân quyền',
          icon: <Security />,
          path: '/permissions',
          role: ['ADMIN']
        }
      ]
    }
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.path) {
      onMenuToggle(item.path);
    } else if (item.children) {
      setOpenMenus(prev => ({
        ...prev,
        [item.label]: !prev[item.label]
      }));
    }
  };

  const handleSubMenuClick = (path: string) => {
    onMenuToggle(path);
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.path) {
      return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    }
    
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    
    return false;
  };

  const isSubItemActive = (path?: string): boolean => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const shouldShowItem = (item: MenuItem): boolean => {
    if (!item.role) return true;
    if (!user?.role) return false;
    return item.role.includes(user.role);
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    if (!shouldShowItem(item)) return null;

    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.label] || isActive;

    return (
      <Box key={item.label}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleMenuClick(item)}
            sx={{
              minHeight: 48,
              justifyContent: sidebarOpen ? 'initial' : 'center',
              px: 2.5,
              pl: depth > 0 ? 4 + depth * 2 : 2.5,
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              backgroundColor: isActive ? 'primary.light' : 'transparent',
              color: isActive ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                backgroundColor: isActive ? 'primary.light' : 'action.hover',
              },
              ...(depth > 0 && {
                minHeight: 40,
                pl: 4 + depth * 2,
              }),
              ...(!sidebarOpen && {
                justifyContent: 'center',
                px: 2.5,
              })
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: sidebarOpen ? 3 : 'auto',
                justifyContent: 'center',
                color: isActive ? 'primary.contrastText' : 'text.primary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            
            {sidebarOpen && (
              <>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                  sx={{ 
                    opacity: sidebarOpen ? 1 : 0,
                    whiteSpace: 'nowrap'
                  }}
                />
                {hasChildren && (
                  <Box sx={{ ml: 1 }}>
                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && sidebarOpen && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const renderCollapsedMenuItem = (item: MenuItem) => {
    if (!shouldShowItem(item)) return null;

    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <ListItem key={item.label} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleMenuClick(item)}
            sx={{
              minHeight: 48,
              justifyContent: 'center',
              px: 2.5,
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              backgroundColor: isActive ? 'primary.light' : 'transparent',
              color: isActive ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                backgroundColor: isActive ? 'primary.light' : 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                justifyContent: 'center',
                color: isActive ? 'primary.contrastText' : 'text.primary',
              }}
            >
              {item.icon}
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      );
    }

    return (
      <ListItem key={item.label} disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          onClick={() => item.path && handleSubMenuClick(item.path)}
          sx={{
            minHeight: 48,
            justifyContent: 'center',
            px: 2.5,
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            backgroundColor: isActive ? 'primary.light' : 'transparent',
            color: isActive ? 'primary.contrastText' : 'text.primary',
            '&:hover': {
              backgroundColor: isActive ? 'primary.light' : 'action.hover',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              justifyContent: 'center',
              color: isActive ? 'primary.contrastText' : 'text.primary',
            }}
          >
            {item.icon}
          </ListItemIcon>
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      bgcolor: 'background.paper',
      borderRight: '1px solid',
      borderColor: 'divider'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        textAlign: 'center'
      }}>
        {sidebarOpen ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              <Business />
            </Avatar>
            <Box sx={{ textAlign: 'left' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  color: 'primary.main',
                  fontSize: '1.1rem',
                  lineHeight: 1.2
                }}
              >
                CUỘC HỌP
              </Typography>
              <Chip 
                label="Business" 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
        ) : (
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              mx: 'auto'
            }}
          >
            <Business />
          </Avatar>
        )}
      </Box>
      {/* Navigation Menu */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        py: 1
      }}>
        <List sx={{ width: '100%' }}>
          {sidebarOpen 
            ? menuItems.map(item => renderMenuItem(item))
            : menuItems.map(item => renderCollapsedMenuItem(item))
          }
        </List>
      </Box>

      {/* Footer */}
      {sidebarOpen && (
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid', 
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ textAlign: 'center', display: 'block' }}
          >
            Phiên bản 1.0.0
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ textAlign: 'center', display: 'block' }}
          >
            © 2024 ERP System
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;