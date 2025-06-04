import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1c1c1e',
      paper: '#2b2b2e',
    },
    primary: {
      main: '#ff4d4f', // red button
    },
    secondary: {
      main: '#ffa940', // orange highlight
    },
    success: {
      main: '#52c41a', // green
    },
    warning: {
      main: '#faad14', // yellow
    },
    text: {
      primary: '#ffffff',
      secondary: '#d9d9d9',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.95rem',
    },
    body2: {
      fontSize: '0.85rem',
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2b2b2e',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
        },
        containedPrimary: {
          backgroundColor: '#ff4d4f',
          '&:hover': {
            backgroundColor: '#d9363e',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
