import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Button, 
  TextField, 
  IconButton, 
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
import { Add, Remove, Delete, LocationOn, AccessTime, DeliveryDining, Store, Restaurant } from '@mui/icons-material';
import { useOrders } from '../../stores/orderStore';
import { useNavigate } from 'react-router-dom';

export const OrderSummary = () => {
  const { 
    cartItems, 
    customerInfo, 
    deliveryFee, 
    loading, 
    error,
    updateCartItemQuantity, 
    removeFromCart, 
    updateCustomerInfo,
    getCartSubtotal,
    getCartTotal,
    submitOrder
  } = useOrders();
  
  const navigate = useNavigate();
  const [promotionCode, setPromotionCode] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const handleApplyPromotion = () => {
    if (promotionCode) {
      updateCustomerInfo({ promotionCode });
    }
  };

  const handleQuantityChange = (menuItemId: number, change: number, currentQuantity: number) => {
    const newQuantity = Math.max(0, currentQuantity + change);
    updateCartItemQuantity(menuItemId, newQuantity);
  };

  const handleSubmitOrder = async () => {
    const result = await submitOrder();
    if (result) {
      setSuccessMessage('Order placed successfully!');
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <Box sx={{ 
      width: { xs: '100%', sm: 320 }, 
      bgcolor: '#2c2c2e', 
      color: 'white', 
      p: { xs: 2, sm: 3 }, 
      borderRadius: 3, 
      height: '100%', 
      maxHeight: '100vh', 
      overflowY: 'auto',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0
    }}>
      <Typography variant="h6" gutterBottom>Order Summary</Typography>
      
      {/* Customer Info */}
      <Typography variant="subtitle2" gutterBottom>CUSTOMER INFORMATION</Typography>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Your Name"
        value={customerInfo.name}
        onChange={(e) => updateCustomerInfo({ name: e.target.value })}
        sx={{ 
          mb: 2, 
          bgcolor: 'rgba(255,255,255,0.1)',
          input: { color: 'white' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
            '&.Mui-focused fieldset': { borderColor: 'primary.main' }
          }
        }}
      />
      
      {/* Order Type Selection */}
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend" sx={{ color: 'white' }}>Order Type</FormLabel>
        <RadioGroup
          row
          value={customerInfo.type}
          onChange={(e) => updateCustomerInfo({ type: e.target.value })}
        >
          <FormControlLabel 
            value="Delivery" 
            control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: 'primary.main' } }} />} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DeliveryDining sx={{ mr: 0.5 }} />
                <Typography variant="body2">Delivery</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="Pickup" 
            control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: 'primary.main' } }} />} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Store sx={{ mr: 0.5 }} />
                <Typography variant="body2">Pickup</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="Dine-in" 
            control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: 'primary.main' } }} />} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Restaurant sx={{ mr: 0.5 }} />
                <Typography variant="body2">Dine-in</Typography>
              </Box>
            }
          />
        </RadioGroup>
      </FormControl>
      
      {customerInfo.type === 'Delivery' && (
        <>
          <Typography variant="subtitle2" gutterBottom>DELIVERY ADDRESS</Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Your Address"
            value={customerInfo.address}
            onChange={(e) => updateCustomerInfo({ address: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 1, 
              bgcolor: 'rgba(255,255,255,0.1)',
              input: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' }
              }
            }}
          />
          <Typography variant="caption" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime fontSize="small" sx={{ mr: 0.5 }} /> Estimated delivery: 20-30 min
          </Typography>
        </>
      )}
      
      {customerInfo.type === 'Pickup' && (
        <>
          <Typography variant="subtitle2" gutterBottom>PICKUP INFORMATION</Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Contact Phone Number"
            value={customerInfo.address}
            onChange={(e) => updateCustomerInfo({ address: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Store sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 1, 
              bgcolor: 'rgba(255,255,255,0.1)',
              input: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' }
              }
            }}
          />
          <Typography variant="caption" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime fontSize="small" sx={{ mr: 0.5 }} /> Ready for pickup in: 15-20 min
          </Typography>
        </>
      )}
      
      {customerInfo.type === 'Dine-in' && (
        <>
          <Typography variant="subtitle2" gutterBottom>TABLE INFORMATION</Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Table Number"
            value={customerInfo.address}
            onChange={(e) => updateCustomerInfo({ address: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Restaurant sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 1, 
              bgcolor: 'rgba(255,255,255,0.1)',
              input: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' }
              }
            }}
          />
          <Typography variant="caption" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime fontSize="small" sx={{ mr: 0.5 }} /> Preparation time: 10-15 min
          </Typography>
        </>
      )}
  
      <Divider sx={{ my: 2 }} />
  
      {/* Cart Items */}
      <Typography variant="subtitle1">Cart Items</Typography>
      {cartItems.length === 0 ? (
        <Typography variant="body2" sx={{ my: 2, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
          Your cart is empty. Add some items to place an order.
        </Typography>
      ) : (
        cartItems.map((item) => (
          <Box key={item.menuItem.id} sx={{ my: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ flex: 1 }}>{item.menuItem.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleQuantityChange(item.menuItem.id, -1, item.quantity)}
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <Remove fontSize="small" />
                </IconButton>
                <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleQuantityChange(item.menuItem.id, 1, item.quantity)}
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <Add fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => removeFromCart(item.menuItem.id)}
                  sx={{ color: 'rgba(255,255,255,0.7)', ml: 1 }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                ${item.menuItem.price} each
              </Typography>
              <Typography variant="body2">
                ${(item.menuItem.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        ))
      )}
  
      <Divider sx={{ my: 2 }} />
  
      {/* Promotion Code */}
      <Typography variant="subtitle2">Promotion Code</Typography>
      <Box sx={{ display: 'flex', mt: 1, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Enter code"
          value={promotionCode}
          onChange={(e) => setPromotionCode(e.target.value)}
          sx={{ 
            flex: 1, 
            mr: 1,
            bgcolor: 'rgba(255,255,255,0.1)',
            input: { color: 'white' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
            }
          }}
        />
        <Button 
          variant="contained" 
          onClick={handleApplyPromotion}
          sx={{ bgcolor: 'white', color: 'black', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } }}
        >
          Apply
        </Button>
      </Box>
  
      {/* Order Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Subtotal</Typography>
        <Typography variant="body2">${getCartSubtotal().toFixed(2)}</Typography>
      </Box>
      {customerInfo.type === 'Delivery' && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Delivery Fee</Typography>
          <Typography variant="body2">${deliveryFee.toFixed(2)}</Typography>
        </Box>
      )}
      {customerInfo.promotionCode && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Promotion ({customerInfo.promotionCode})</Typography>
          <Typography variant="body2" sx={{ color: '#4caf50' }}>-$0.00</Typography>
        </Box>
      )}
  
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Typography variant="h6">TOTAL</Typography>
        <Typography variant="h6" color="primary.main">${getCartTotal().toFixed(2)}</Typography>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
          {error}
        </Alert>
      )}
      
      {/* Submit Button */}
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth 
        sx={{ mt: 2, bgcolor: '#ff5252', '&:hover': { bgcolor: '#ff1744' } }}
        onClick={handleSubmitOrder}
        disabled={loading || cartItems.length === 0 || !customerInfo.name || !customerInfo.address}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Place Order'}
      </Button>
      
      {/* Success message */}
      <Snackbar open={showSuccess} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
