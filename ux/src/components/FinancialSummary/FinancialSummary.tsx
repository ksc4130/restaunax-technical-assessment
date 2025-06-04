import { useEffect, useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { MonetizationOn, TrendingUp, TrendingDown } from '@mui/icons-material';
import { DashboardCard } from '../DashboardCard';
import { useOrders } from '../../stores/orderStore';
import type { Order } from '../../services/orderService';

interface FinancialMetric {
  label: string;
  value: number;
  previousValue: number;
  percentChange: number;
  format: (value: number) => string;
}

export const FinancialSummary = () => {
  const { orders, loading, error } = useOrders();
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);

  useEffect(() => {
    if (orders.length > 0) {
      // Calculate financial metrics
      calculateMetrics(orders);
    }
  }, [orders]);

  const calculateMetrics = (orderData: Order[]) => {
    // Get current date and previous period for comparison
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filter orders for current month and previous month
    const currentMonthOrders = orderData.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    const previousMonthOrders = orderData.filter(order => {
      const orderDate = new Date(order.createdAt);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return orderDate.getMonth() === prevMonth && orderDate.getFullYear() === prevYear;
    });
    
    // Calculate total revenue
    const currentRevenue = currentMonthOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const previousRevenue = previousMonthOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const revenueChange = previousRevenue === 0 
      ? 100 
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    
    // Calculate average order value
    const currentAOV = currentMonthOrders.length > 0 
      ? currentRevenue / currentMonthOrders.length 
      : 0;
    const previousAOV = previousMonthOrders.length > 0 
      ? previousRevenue / previousMonthOrders.length 
      : 0;
    const aovChange = previousAOV === 0 
      ? 100 
      : ((currentAOV - previousAOV) / previousAOV) * 100;
    
    // Calculate order count
    const currentOrderCount = currentMonthOrders.length;
    const previousOrderCount = previousMonthOrders.length;
    const orderCountChange = previousOrderCount === 0 
      ? 100 
      : ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100;
    
    // Set metrics
    setMetrics([
      {
        label: 'Total Revenue',
        value: currentRevenue,
        previousValue: previousRevenue,
        percentChange: revenueChange,
        format: (value) => `$${typeof value === 'number' ? value.toFixed(2) : '0.00'}`
      },
      {
        label: 'Average Order',
        value: currentAOV,
        previousValue: previousAOV,
        percentChange: aovChange,
        format: (value) => `$${typeof value === 'number' ? value.toFixed(2) : '0.00'}`
      },
      {
        label: 'Order Count',
        value: currentOrderCount,
        previousValue: previousOrderCount,
        percentChange: orderCountChange,
        format: (value) => value.toString()
      }
    ]);
  };

  return (
    <DashboardCard 
      title="Financial Summary" 
      icon={<MonetizationOn color="primary" />}
      loading={loading}
      error={error}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {metrics.map((metric, index) => (
          <Box key={metric.label} sx={{ p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {metric.label}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
                {metric.format(metric.value)}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: metric.percentChange >= 0 ? 'success.main' : 'error.main'
              }}>
                {metric.percentChange >= 0 ? (
                  <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography variant="body2">
                  {typeof metric.percentChange === 'number' ? Math.abs(metric.percentChange).toFixed(1) : '0.0'}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              vs. previous month: {metric.format(metric.previousValue)}
            </Typography>
            {index < metrics.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
        
        {metrics.length === 0 && !loading && !error && (
          <Box>
            <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
              No financial data available
            </Typography>
          </Box>
        )}
      </Box>
    </DashboardCard>
  );
};
