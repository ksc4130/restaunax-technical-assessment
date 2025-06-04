import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, Restaurant, ShoppingCart, ExitToApp } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/restaunax_logo3.png';

export const SideNav = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: <Dashboard />, label: 'Dashboard', path: '/dashboard' },
    { icon: <ShoppingCart />, label: 'Orders', path: '/orders' },
    { icon: <Restaurant />, label: 'Menu', path: '/menu' },
  ];
  
  return (
  <Box sx={{ 
    width: { xs: 70, md: 240 }, 
    height: '100vh', 
    bgcolor: '#1c1c1e', 
    color: 'white', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between',
    transition: 'width 0.3s ease'
  }}>
      <Box>
      <Box sx={{ textAlign: 'center' }}>
        <Box 
          component={Link} 
          to="/"
          sx={{ display: 'block', textDecoration: 'none' }}
        >
          <Box 
            component="img" 
            src={logo} 
            alt="Restaunax Logo" 
            sx={{ 
              width: { xs: 50, md: 150 }, 
              pt: 2,
              mx: 'auto'
            }} 
          />
        </Box>
      </Box>
      <List>
        {navItems.map(({ icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <ListItem 
              key={label} 
              component={Link} 
              to={path}
              sx={{ 
                color: 'white', 
                textDecoration: 'none',
                bgcolor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderLeft: isActive ? '4px solid' : '4px solid transparent',
                borderColor: isActive ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)'
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive ? 'primary.main' : 'white',
                minWidth: { xs: 0, md: 56 },
                mr: { xs: 0, md: 3 },
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}>
                {icon}
              </ListItemIcon>
              <ListItemText 
                primary={label} 
                sx={{ display: { xs: 'none', md: 'block' } }}
                primaryTypographyProps={{ 
                  fontWeight: isActive ? 'bold' : 'normal' 
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
    <Box>
      <List>
        <ListItem>
          <ListItemIcon sx={{ 
            color: 'white',
            minWidth: { xs: 0, md: 56 },
            mr: { xs: 0, md: 3 },
            justifyContent: { xs: 'center', md: 'flex-start' }
          }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            sx={{ display: { xs: 'none', md: 'block' } }}
          />
        </ListItem>
      </List>
    </Box>
  </Box>
  );
};
