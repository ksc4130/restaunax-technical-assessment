import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Chip, Avatar } from '@mui/material';
import { AccessTime, History } from '@mui/icons-material';
import { DashboardCard } from '../DashboardCard';
import { useOrders } from '../../stores/orderStore';
import type { Order } from '../../services/orderService';

export const RecentOrders = () => {
  const { orders, loading, error } = useOrders();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (orders.length > 0) {
      // Sort orders by creation date in descending order and take the 5 most recent
      const sorted = [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentOrders(sorted);
    }
  }, [orders]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Preparing':
        return 'info';
      case 'Delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <DashboardCard 
      title="Recent Orders" 
      icon={<History color="primary" />}
      loading={loading}
      error={error}
    >
      <List sx={{ width: '100%', p: 0 }}>
        {recentOrders.map((order, index) => (
          <Box key={order.id}>
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main',
                  mr: 2
                }}
              >
                {getInitials(order.customer)}
              </Avatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">{order.customer}</Typography>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status)} 
                      size="small" 
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={
                  <Box component="div" sx={{ mt: 1 }}>
                    <Box component="div" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <AccessTime sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" component="span">
                        {formatDate(order.createdAt)}
                      </Typography>
                    </Box>
                    <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" component="span">
                        {order.orderItems.length} items
                      </Typography>
                      <Typography variant="body2" color="primary.main" fontWeight="bold" component="span">
                        ${Number(order.total).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                }
                secondaryTypographyProps={{ component: 'div' }}
              />
            </ListItem>
            {index < recentOrders.length - 1 && <Divider component="li" />}
          </Box>
        ))}
        
        {recentOrders.length === 0 && !loading && !error && (
          <Typography variant="body2" component="div" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
            No recent orders available
          </Typography>
        )}
      </List>
    </DashboardCard>
  );
};
