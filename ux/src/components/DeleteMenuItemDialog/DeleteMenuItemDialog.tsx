import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import type { MenuItem } from '../../services/menuItemService';
import { useMenuItems } from '../../stores/menuItemStore';

interface DeleteMenuItemDialogProps {
  open: boolean;
  menuItem: MenuItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteMenuItemDialog: React.FC<DeleteMenuItemDialogProps> = ({
  open,
  menuItem,
  onClose,
  onSuccess
}) => {
  const { deleteMenuItem, error: storeError } = useMenuItems();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!menuItem) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const success = await deleteMenuItem(menuItem.id);
      
      if (success) {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setError('Failed to delete menu item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the menu item');
    } finally {
      setLoading(false);
    }
  };

  if (!menuItem) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Menu Item</DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete this menu item?
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Item Details:
          </Typography>
          <Typography variant="body2">
            Name: {menuItem.name}
          </Typography>
          <Typography variant="body2">
            Price: ${Number(menuItem.price).toFixed(2)}
          </Typography>
          {menuItem.category && (
            <Typography variant="body2">
              Category: {menuItem.category}
            </Typography>
          )}
        </Box>
        
        {menuItem.imagePath && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <img 
              src={menuItem.imagePath} 
              alt={menuItem.name} 
              style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
            />
          </Box>
        )}
        
        <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
          This action cannot be undone. This will permanently delete the menu item.
        </Typography>
        
        {(error || storeError) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || storeError}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Deleting...' : 'Delete Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteMenuItemDialog;
