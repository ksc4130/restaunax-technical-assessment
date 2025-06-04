import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';
import type { Order, UpdateOrderDto } from '../../services/orderService';

interface EditOrderFormProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onSave: (id: number, data: UpdateOrderDto) => Promise<void>;
}

export const EditOrderForm = ({ open, order, onClose, onSave }: EditOrderFormProps) => {
  const [formData, setFormData] = useState<UpdateOrderDto>({
    customer: '',
    address: '',
    type: 'Delivery',
    status: 'Pending',
    promotionCode: '',
    deliveryFee: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setFormData({
        customer: order.customer,
        address: order.address,
        type: order.type,
        status: order.status,
        promotionCode: order.promotionCode || '',
        deliveryFee: order.deliveryFee || 0
      });
    }
  }, [order]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | 
    React.ChangeEvent<HTMLTextAreaElement> | 
    { target: { name?: string; value: unknown } }
  ) => {
    const target = 'target' in e ? e.target : e;
    const name = target.name;
    const value = target.value;
    
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await onSave(order.id, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the order');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Edit Order #{order.id}</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <TextField
                name="customer"
                label="Customer Name"
                value={formData.customer}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
            </Box>
            
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel id="type-label">Order Type</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Order Type"
                >
                  <MenuItem value="Delivery">Delivery</MenuItem>
                  <MenuItem value="Pickup">Pickup</MenuItem>
                  <MenuItem value="Dine-in">Dine-in</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
            </Box>
            
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Preparing">Preparing</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box>
              <TextField
                name="deliveryFee"
                label="Delivery Fee"
                type="number"
                value={formData.deliveryFee}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Box>
            
            <Box sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}>
              <TextField
                name="promotionCode"
                label="Promotion Code"
                value={formData.promotionCode}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>Order Items</Typography>
          <Box sx={{ mb: 2 }}>
            {order.orderItems.map((item) => (
              <Box 
                key={item.id} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 1
                }}
              >
                <Typography variant="body2">
                  {item.quantity}x {item.menuItem.name}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${Number(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="subtitle1">Total:</Typography>
            <Typography variant="h6" color="primary.main">
              ${Number(order.total).toFixed(2)}
            </Typography>
          </Box>
          
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
