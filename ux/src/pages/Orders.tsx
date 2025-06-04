import { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { 
  Box, 
  CssBaseline, 
  Typography, 
  Tabs, 
  Tab, 
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import SideNav from '../components/SideNav';
import OrderSummary from '../components/OrderSummary';
import { OrderCard } from '../components/OrderCard/OrderCard';
import { EditOrderForm } from '../components/EditOrderForm';
import { DeleteOrderDialog } from '../components/DeleteOrderDialog';
import OrderPipeline from '../components/OrderPipeline';
import { useOrders } from '../stores/orderStore';
import type { Order, UpdateOrderDto } from '../services/orderService';
import { useMenuItems } from "../stores/menuItemStore";
import { MenuItems } from '../components/MenuItems/MenuItems';

const Orders = () => {
  const { orders, loading, error, fetchOrders, updateOrder, deleteOrder } = useOrders();
  const { enqueueSnackbar } = useSnackbar();
  const [showOrderBuilder, setShowOrderBuilder] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editOrderDialogOpen, setEditOrderDialogOpen] = useState(false);
  const [deleteOrderDialogOpen, setDeleteOrderDialogOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchMenuItems, menuItems, menuItemsLoading } = useMenuItems();

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // Now safe with useCallback in the store

  // Add a separate effect to listen for real-time order updates
  useEffect(() => {
    // This effect will run whenever the orders array changes
    // No need to do anything here, as the component will re-render with the new orders
  }, [orders]);

  // Set selected order when orders are loaded
  useEffect(() => {
    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [orders, selectedOrder]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(event);
    setTabValue(newValue);
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleEditOrder = (order: Order) => {
    setOrderToEdit(order);
    setEditOrderDialogOpen(true);
  };

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setDeleteOrderDialogOpen(true);
  };

  const handleSaveOrder = async (id: number, data: UpdateOrderDto) => {
    try {
      await updateOrder(id, data);
      enqueueSnackbar('Order updated successfully', { variant: 'success' });
      fetchOrders(); // Refresh orders
    } catch (err) {
      enqueueSnackbar('Failed to update order', { variant: 'error' });
      throw err;
    }
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      await deleteOrder(id);
      enqueueSnackbar('Order deleted successfully', { variant: 'success' });
      fetchOrders(); // Refresh orders
      
      // If the deleted order was selected, clear the selection
      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }
    } catch (err) {
      enqueueSnackbar('Failed to delete order', { variant: 'error' });
      throw err;
    }
  };

  const handleOrderStatusUpdate = (updatedOrder: Order) => {
    // If the selected order was updated, update it too
    if (selectedOrder && selectedOrder.id === updatedOrder.id) {
      setSelectedOrder(updatedOrder);
    }
    
    // Refresh orders to get the updated data
    fetchOrders();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredOrders = useMemo(() => { 
      let filtered = orders;
      switch (tabValue) {
        case 0:
          break;
        case 1: // Pending
          filtered = orders.filter(order => order.status === 'Pending');
          break
        case 2: // Preparing
          filtered = orders.filter(order => order.status === 'Preparing');
          break;
        case 3: // Delivered
          filtered = orders.filter(order => order.status === 'Delivered');
          break;
        default:
          break;
      }

      // Then filter by search term if present
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(order => 
          String(order.id).toLowerCase().includes(term) || 
          order.customer.toLowerCase().includes(term) ||
          order.address.toLowerCase().includes(term)
        );
      }
      return filtered;
    }
    , [orders, tabValue, searchTerm]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <CssBaseline />
      <SideNav />
      <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Orders</Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setShowOrderBuilder(!showOrderBuilder)}
            sx={{ borderRadius: 2 }}
          >
            {showOrderBuilder ? 'Hide Menu' : 'Create New Order'}
          </Button>
        </Box>
        
        {/* Order Builder */}
        {showOrderBuilder && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Menu Items</Typography>
            <MenuItems items={menuItems} loading={menuItemsLoading} error={error}  />
          </Box>
        )}
        
        {/* Search and Filter */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <TextField
            placeholder="Search orders..."
            variant="outlined"
            size="small"
            sx={{ width: 300 }}
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="outlined" 
            startIcon={<FilterList />}
            sx={{ borderRadius: 2 }}
          >
            Filter
          </Button>
        </Box>
        
        {/* Tabs */}
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ 
            mb: 3,
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
          }}
        >
          <Tab label="All Orders" />
          <Tab label="Pending" />
          <Tab label="Preparing" />
          <Tab label="Delivered" />
        </Tabs>
        
        {/* Order List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, color: 'error.main' }}>
            <Typography>Error loading orders: {error}</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
            {filteredOrders.map((order) => (
              <Box 
                key={order.id} 
                sx={{ 
                  gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 6', lg: 'span 4' } 
                }}
              >
                <OrderCard 
                  order={order} 
                  isSelected={selectedOrder?.id === order.id}
                  onSelect={() => handleOrderSelect(order)}
                  onStatusUpdate={handleOrderStatusUpdate}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
      
      {/* Order Details and Cart */}
      <Box sx={{ 
        width: { xs: '100%', sm: 350 }, 
        borderLeft: { xs: 'none', sm: '1px solid' }, 
        borderColor: 'divider', 
        p: 2, 
        overflowY: 'auto',
        display: { xs: 'none', sm: 'block' } // Hide on mobile to prevent layout issues
      }}>
        {/* Selected Order Details */}
        {selectedOrder && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Order Details</Typography>
            <Typography variant="body1" fontWeight="bold">{selectedOrder.customer}</Typography>
            <Typography variant="body2" gutterBottom>{selectedOrder.address}</Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Order Pipeline */}
            <OrderPipeline order={selectedOrder} />
          </Paper>
        )}
        
        {/* Cart */}
        <OrderSummary />
      </Box>
      {/* Edit Order Dialog */}
      <EditOrderForm
        open={editOrderDialogOpen}
        order={orderToEdit}
        onClose={() => setEditOrderDialogOpen(false)}
        onSave={handleSaveOrder}
      />
      
      {/* Delete Order Dialog */}
      <DeleteOrderDialog
        open={deleteOrderDialogOpen}
        order={orderToDelete}
        onClose={() => setDeleteOrderDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default Orders;
