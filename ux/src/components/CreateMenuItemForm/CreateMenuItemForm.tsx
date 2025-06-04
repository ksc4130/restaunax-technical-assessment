import React, { useState, useRef } from 'react';
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
  Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { SelectChangeEvent } from '@mui/material';

import { useMenuItems } from '../../stores/menuItemStore';
import type { CreateMenuItemDto } from '../../services/menuItemService';

interface CreateMenuItemFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateMenuItemForm: React.FC<CreateMenuItemFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { createMenuItem, creatingMenuItem, error } = useMenuItems();
  const [formData, setFormData] = useState<CreateMenuItemDto>({
    name: '',
    price: 0,
    imagePath: '',
    description: '',
    category: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (formData.price <= 0) {
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
      setSelectedImage(e.target.files[0]);
      // Clear any previous imagePath
      setFormData(prev => ({
        ...prev,
        imagePath: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    
    if (!validateForm()) {
      return;
    }
    
    // Create FormData object for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', formData.price.toString());
    if (formData.category) formDataToSend.append('category', formData.category);
    if (formData.description) formDataToSend.append('description', formData.description);
    
    // If we have a selected image, add it to the FormData
    if (selectedImage) {
      formDataToSend.append('image', selectedImage);
    } else if (formData.imagePath) {
      // If no image is selected but there's an imagePath, use that
      formDataToSend.append('imagePath', formData.imagePath);
    }
    
    const result = await createMenuItem(formDataToSend);
    
    if (result) {
      setSuccessMessage('Menu item created successfully!');
      setFormData({
        name: '',
        price: 0,
        imagePath: '',
        description: '',
        category: ''
      });
      setSelectedImage(null);
      
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Create New Menu Item</Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
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
        disabled={creatingMenuItem}
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
        disabled={creatingMenuItem}
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
          value={formData.category}
          onChange={handleSelectChange}
          label="Category"
          disabled={creatingMenuItem}
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
            disabled={creatingMenuItem}
          >
            Upload Image
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
              disabled={creatingMenuItem}
            />
          </Button>
          {selectedImage && (
            <Typography variant="body2">
              {selectedImage.name}
            </Typography>
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Or specify an image path:
        </Typography>
        <TextField
          fullWidth
          label="Image Path"
          name="imagePath"
          value={formData.imagePath}
          onChange={handleTextChange}
          margin="normal"
          disabled={creatingMenuItem || !!selectedImage}
          helperText="Path to the image file (e.g., /assets/menuIcons/pizza.png)"
          size="small"
        />
        {selectedImage && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <img 
              src={URL.createObjectURL(selectedImage)} 
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
        value={formData.description}
        onChange={handleTextChange}
        margin="normal"
        multiline
        rows={3}
        disabled={creatingMenuItem}
      />
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {onCancel && (
          <Button 
            variant="outlined" 
            onClick={onCancel}
            disabled={creatingMenuItem}
          >
            Cancel
          </Button>
        )}
        
        <Button 
          type="submit" 
          variant="contained" 
          disabled={creatingMenuItem}
          startIcon={creatingMenuItem ? <CircularProgress size={20} /> : null}
        >
          {creatingMenuItem ? 'Creating...' : 'Create Menu Item'}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateMenuItemForm;
