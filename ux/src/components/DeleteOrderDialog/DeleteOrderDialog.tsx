import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import type { Order } from '../../services/orderService';

interface DeleteOrderDialogProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export const DeleteOrderDialog = ({ open, order, onClose, onConfirm }: DeleteOrderDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!order) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await onConfirm(order.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the order');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Order #{order.id}</DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete this order?
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Order Details:
          </Typography>
          <Typography variant="body2">
            Customer: {order.customer}
          </Typography>
          <Typography variant="body2">
            Total: ${Number(order.total).toFixed(2)}
          </Typography>
          <Typography variant="body2">
            Status: {order.status}
          </Typography>
          <Typography variant="body2">
            Items: {order.orderItems.length}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
          This action cannot be undone.
        </Typography>
        
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
          onClick={handleConfirm} 
          variant="contained" 
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Deleting...' : 'Delete Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
