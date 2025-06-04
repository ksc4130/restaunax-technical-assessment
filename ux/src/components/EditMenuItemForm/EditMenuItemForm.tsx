import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import type { SelectChangeEvent } from '@mui/material';

import { useMenuItems } from '../../stores/menuItemStore';
import type { MenuItem as MenuItemType, UpdateMenuItemDto } from '../../services/menuItemService';

interface EditMenuItemFormProps {
  open: boolean;
  menuItem: MenuItemType | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditMenuItemForm: React.FC<EditMenuItemFormProps> = ({
  open,
  menuItem,
  onClose,
  onSuccess
}) => {
  const { updateMenuItem, error: storeError } = useMenuItems();
  const [formData, setFormData] = useState<UpdateMenuItemDto>({
    name: '',
    price: 0,
    description: '',
    category: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize form data when menuItem changes
  useEffect(() => {
    if (menuItem) {
      setFormData({
        name: menuItem.name,
        price: menuItem.price,
        description: menuItem.description || '',
        category: menuItem.category || ''
      });
      
      // Set preview URL if there's an image
      if (menuItem.imagePath) {
        setPreviewUrl(menuItem.imagePath);
      } else {
        setPreviewUrl(null);
      }
      
      // Reset other state
      setSelectedImage(null);
      setFormErrors({});
      setError(null);
      setSuccessMessage(null);
    }
  }, [menuItem]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (formData.price !== undefined && formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (name && formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!menuItem) return;
    
    setSuccessMessage(null);
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      let result;
      
      if (selectedImage) {
        // If there's a new image, use FormData to upload it
        const formDataWithImage = new FormData();
        formDataWithImage.append('name', formData.name || '');
        formDataWithImage.append('price', (formData.price || 0).toString());
        if (formData.description) formDataWithImage.append('description', formData.description);
        if (formData.category) formDataWithImage.append('category', formData.category);
        formDataWithImage.append('image', selectedImage);
        
        // Use the upload endpoint
        result = await updateMenuItem(menuItem.id, formDataWithImage);
      } else {
        // If no new image, just update the text fields
        result = await updateMenuItem(menuItem.id, formData);
      }
      
      if (result) {
        setSuccessMessage('Menu item updated successfully!');
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update menu item');
    } finally {
      setLoading(false);
    }
  };

  if (!menuItem) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Edit Menu Item</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}
          
          {(error || storeError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || storeError}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleTextChange}
            margin="normal"
            error={!!formErrors.name}
            helperText={formErrors.name}
            disabled={loading}
            required
          />
          
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleTextChange}
            margin="normal"
            error={!!formErrors.price}
            helperText={formErrors.price}
            disabled={loading}
            required
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={formData.category || ''}
              onChange={handleSelectChange}
              label="Category"
              disabled={loading}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="Appetizer">Appetizer</MenuItem>
              <MenuItem value="Main Course">Main Course</MenuItem>
              <MenuItem value="Dessert">Dessert</MenuItem>
              <MenuItem value="Beverage">Beverage</MenuItem>
              <MenuItem value="Side">Side</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Menu Item Image
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={loading}
              >
                Upload New Image
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                  disabled={loading}
                />
              </Button>
              {selectedImage && (
                <Typography variant="body2">
                  {selectedImage.name}
                </Typography>
              )}
            </Stack>
            
            {previewUrl && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
              </Box>
            )}
          </Box>
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description || ''}
            onChange={handleTextChange}
            margin="normal"
            multiline
            rows={3}
            disabled={loading}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onClose}
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditMenuItemForm;
