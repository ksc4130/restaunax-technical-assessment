import { useState } from 'react';
import { 
  Box, 
  Button, 
  ButtonGroup, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useOrders } from '../../stores/orderStore';
import type { Order } from '../../services/orderService';

interface OrderStatusControlProps {
  order: Order;
  onStatusUpdate?: (updatedOrder: Order) => void;
}

export const OrderStatusControl = ({ order, onStatusUpdate }: OrderStatusControlProps) => {
  const { updateOrder, loading, error } = useOrders();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const statusPipeline = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
  
  const getNextStatuses = (currentStatus: string): string[] => {
    const currentIndex = statusPipeline.indexOf(currentStatus);
    if (currentIndex === -1) return ['Pending'];
    
    if (currentStatus !== 'Cancelled' && currentStatus !== 'Delivered') {
      return [statusPipeline[currentIndex + 1], 'Cancelled'].filter(Boolean);
    }
    
    return [];
  };

  const handleStatusChange = (newStatus: string) => {
    setTargetStatus(newStatus);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    
    try {
      const updatedOrder = await updateOrder(order.id, { status: targetStatus });
      if (updatedOrder) {
        setSuccessMessage(`Status changed to ${targetStatus}`);
        setShowSuccess(true);
        onStatusUpdate?.(updatedOrder);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };
  
  const handleCancel = () => {
    setConfirmOpen(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const nextStatuses = getNextStatuses(order.status);
  if (nextStatuses.length === 0) return null;

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Update Status:</Typography>
        <ButtonGroup variant="outlined" size="small" fullWidth>
          {nextStatuses.map((status) => (
            <Button 
              key={status}
              onClick={() => handleStatusChange(status)}
              color={status === 'Cancelled' ? 'error' : 'primary'}
              disabled={loading}
            >
              {status}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleCancel}>
        <DialogTitle>Confirm Status Update</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update the order status from <strong>{order.status}</strong> to <strong>{targetStatus}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            color={targetStatus === 'Cancelled' ? 'error' : 'primary'}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar open={showSuccess} autoHideDuration={3000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </>
  );
};
