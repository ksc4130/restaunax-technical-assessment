import type { ReactNode } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  loading?: boolean;
  error?: string | null;
  children: ReactNode;
}

export const DashboardCard = ({ title, icon, loading, error, children }: DashboardCardProps) => {
  return (
    <Card sx={{ 
      height: '100%',
      bgcolor: '#2c2c2e', 
      color: 'white',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      }
    }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
          <Typography variant="h6">{title}</Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ color: 'error.main', flex: 1 }}>
            <Typography>{error}</Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
