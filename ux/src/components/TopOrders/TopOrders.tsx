import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Avatar, Chip } from '@mui/material';
import { TrendingUp, AttachMoney } from '@mui/icons-material';
import { DashboardCard } from '../DashboardCard';
import { useOrders } from '../../stores/orderStore';
import type { Order } from '../../services/orderService';

export const TopOrders = () => {
  const { orders, loading, error } = useOrders();
  const [topOrders, setTopOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (orders.length > 0) {
      // Sort orders by total value in descending order and take top 5
      const sorted = [...orders].sort((a, b) => Number(b.total) - Number(a.total)).slice(0, 5);
      setTopOrders(sorted);
    }
  }, [orders]);

  return (
    <DashboardCard 
      title="Top Orders" 
      icon={<AttachMoney color="primary" />}
      loading={loading}
      error={error}
    >
      <List sx={{ width: '100%', p: 0 }}>
        {topOrders.map((order, index) => (
          <Box key={order.id}>
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
              <Avatar 
                sx={{ 
                  bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'primary.main',
                  color: index < 3 ? 'black' : 'white',
                  mr: 2
                }}
              >
                {index + 1}
              </Avatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">{order.customer}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                      <Typography variant="h6" color="primary.main">${Number(order.total).toFixed(2)}</Typography>
                    </Box>
                  </Box>
                }
                secondary={
                  <Box component="div" sx={{ mt: 1 }}>
                    <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" component="span">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                      <Chip 
                        label={order.type} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" component="span" noWrap>
                      {order.orderItems.length} items
                    </Typography>
                  </Box>
                }
                secondaryTypographyProps={{ component: 'div' }}
              />
            </ListItem>
            {index < topOrders.length - 1 && <Divider component="li" />}
          </Box>
        ))}
        
        {topOrders.length === 0 && !loading && !error && (
          <Typography variant="body2" component="div" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
            No orders available
          </Typography>
        )}
      </List>
    </DashboardCard>
  );
};
