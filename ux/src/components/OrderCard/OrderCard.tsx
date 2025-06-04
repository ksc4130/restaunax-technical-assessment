import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Divider,
  Collapse,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  AccessTime, 
  LocationOn, 
  ExpandMore, 
  ExpandLess, 
  DeliveryDining, 
  Store, 
  Restaurant,
  MoreVert,
  Edit,
  Delete
} from '@mui/icons-material';
import { useState } from 'react';
import type { Order } from '../../services/orderService';
import { OrderStatusControl } from '../OrderStatusControl';

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  onSelect: () => void;
  onStatusUpdate?: (updatedOrder: Order) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
}

export const OrderCard = ({ order, isSelected, onSelect, onStatusUpdate, onEdit, onDelete }: OrderCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    setExpanded(!expanded);
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    setAnchorEl(null);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    if (onEdit) {
      onEdit(order);
    }
    setAnchorEl(null);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    if (onDelete) {
      onDelete(order);
    }
    setAnchorEl(null);
  };

  const handleStatusUpdate = (updatedOrder: Order) => {
    if (onStatusUpdate) {
      onStatusUpdate(updatedOrder);
    }
  };
  // Determine status color
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        border: isSelected ? '2px solid' : 'none',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
        }
      }}
      onClick={onSelect}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">#{order.id}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              label={order.status} 
              color={getStatusColor(order.status)} 
              size="small" 
              sx={{ fontWeight: 'medium', mr: 1 }}
            />
            <IconButton 
              size="small" 
              onClick={handleMenuClick}
              sx={{ padding: 0.5 }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem onClick={handleEdit}>
                <Edit fontSize="small" sx={{ mr: 1 }} />
                Edit
              </MenuItem>
              <MenuItem onClick={handleDelete}>
                <Delete fontSize="small" sx={{ mr: 1 }} />
                Delete
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip
            icon={
              order.type === 'Delivery' ? <DeliveryDining fontSize="small" /> :
              order.type === 'Pickup' ? <Store fontSize="small" /> :
              <Restaurant fontSize="small" />
            }
            label={order.type}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'medium' }}
          />
        </Box>
        
        <Typography variant="h6" sx={{ mb: 1 }}>{order.customer}</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
          <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">{formatDate(order.time)}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, color: 'text.secondary' }}>
          <LocationOn fontSize="small" sx={{ mr: 0.5, mt: 0.3 }} />
          <Typography variant="body2">{order.address}</Typography>
        </Box>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Items:</Typography>
        {order.orderItems.map((item) => (
          <Typography key={item.id} variant="body2" sx={{ mb: 0.5 }}>
            • {item.quantity}x {item.menuItem.name} (${item.price})
          </Typography>
        ))}
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">Total:</Typography>
          <Typography variant="h6" color="primary.main">${Number(order.total).toFixed(2)}</Typography>
        </Box>

        {/* Expand/Collapse Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <IconButton 
            onClick={handleExpandClick}
            size="small"
            sx={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s'
            }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        {/* Order Status Control */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <OrderStatusControl 
            order={order} 
            onStatusUpdate={handleStatusUpdate}
          />
        </Collapse>
      </CardContent>
    </Card>
  );
};
