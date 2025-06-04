import { useEffect, useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { Category } from '@mui/icons-material';
import { DashboardCard } from '../DashboardCard';
import { useOrders } from '../../stores/orderStore';
import type { Order } from '../../services/orderService';

interface OrderTypeData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

export const OrderTypeDistribution = () => {
  const { orders, loading, error } = useOrders();
  const [orderTypes, setOrderTypes] = useState<OrderTypeData[]>([]);

  useEffect(() => {
    if (orders.length > 0) {
      processOrderTypes(orders);
    } else {
      setOrderTypes([]);
    }
  }, [orders]);

  const processOrderTypes = (orderData: Order[]) => {
    const typeCounts: Record<string, number> = {};
    
    orderData.forEach(order => {
      const type = order.type || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    const total = orderData.length;
    const typeColors: Record<string, string> = {
      'Delivery': '#4caf50',
      'Pickup': '#2196f3',
      'Dine-in': '#ff9800',
      'Unknown': '#9e9e9e'
    };
    
    const typeData = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: (count / total) * 100,
      color: typeColors[type] || '#9e9e9e'
    }));
    
    typeData.sort((a, b) => b.count - a.count);
    setOrderTypes(typeData);
  };

  const createDonutChart = () => {
    if (orderTypes.length === 0) return null;
    
    const size = 200;
    const radius = size / 2;
    const innerRadius = radius * 0.6;
    const center = size / 2;
    
    let cumulativePercentage = 0;
    const segments = orderTypes.map((type) => {
      const startAngle = (cumulativePercentage / 100) * 2 * Math.PI;
      cumulativePercentage += type.percentage;
      const endAngle = (cumulativePercentage / 100) * 2 * Math.PI;
      
      const startX = center + radius * Math.sin(startAngle);
      const startY = center - radius * Math.cos(startAngle);
      const endX = center + radius * Math.sin(endAngle);
      const endY = center - radius * Math.cos(endAngle);
      
      const innerStartX = center + innerRadius * Math.sin(startAngle);
      const innerStartY = center - innerRadius * Math.cos(startAngle);
      const innerEndX = center + innerRadius * Math.sin(endAngle);
      const innerEndY = center - innerRadius * Math.cos(endAngle);
      
      const largeArcFlag = type.percentage > 50 ? 1 : 0;
      
      return {
        path: `
          M ${startX} ${startY}
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
          L ${innerEndX} ${innerEndY}
          A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
          Z
        `,
        color: type.color
      };
    });
    
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
          />
        ))}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="#2c2c2e"
        />
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="24px"
          fontWeight="bold"
        >
          {orders.length}
        </text>
        <text
          x={center}
          y={center + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#999"
          fontSize="12px"
        >
          Total Orders
        </text>
      </svg>
    );
  };

  return (
    <DashboardCard 
      title="Order Type Distribution" 
      icon={<Category color="primary" />}
      loading={loading}
      error={error}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Chart visualization */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, flex: 1, minHeight: 120 }}>
          {createDonutChart()}
        </Box>
        
        {/* Legend */}
        <Box sx={{ mt: 2 }}>
          {orderTypes.map((type, index) => (
            <Box key={type.type}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: 1, 
                      bgcolor: type.color,
                      mr: 1 
                    }} 
                  />
                  <Typography variant="body2">{type.type}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>{type.count}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({type.percentage.toFixed(1)}%)
                  </Typography>
                </Box>
              </Box>
              {index < orderTypes.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
        
        {orderTypes.length === 0 && !loading && !error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
              No order type data available
            </Typography>
          </Box>
        )}
      </Box>
    </DashboardCard>
  );
};
