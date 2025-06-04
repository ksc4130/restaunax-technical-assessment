import { Box, CssBaseline, Typography, CircularProgress } from '@mui/material';
import SideNav from '../components/SideNav';
import OrderSummary from '../components/OrderSummary';
import { TopOrders } from '../components/TopOrders';
import { FinancialSummary } from '../components/FinancialSummary';
import { OrderTypeDistribution } from '../components/OrderTypeDistribution';
import { RecentOrders } from '../components/RecentOrders';
import { useEffect, useState } from 'react';
import { useOrders } from '../stores/orderStore';
import { useMenuItems } from '../stores/menuItemStore';
import { MenuItems } from '../components/MenuItems/MenuItems';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { orders, fetchOrders } = useOrders();
  const { fetchPopularItems, popularItems, popularItemsLoading } = useMenuItems();

  // Centralized data fetching for all dashboard components
  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all required data in parallel
        await Promise.all([
          fetchOrders(),
          fetchPopularItems(8)
        ]);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        // Only update state if component is still mounted
        if (isMounted) {
          setError('Failed to load dashboard data. Please try refreshing the page.');
          setIsLoading(false);
        }
      }
    };

    loadDashboardData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [fetchOrders, fetchPopularItems]);

  // Listen for real-time order updates
  useEffect(() => {
    // This effect will run whenever the orders array changes
    // The dashboard will automatically re-render with the updated orders
    console.log("Orders updated in real-time:", orders.length);
  }, [orders]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        height: '100vh', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error state if data fetching failed
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        height: '100vh', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: 'background.default',
        color: 'error.main',
        flexDirection: 'column',
        p: 3,
        textAlign: 'center'
      }}>
        <Typography variant="h5" gutterBottom>Error Loading Dashboard</Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <CssBaseline />
      <SideNav />
      <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Dashboard</Typography>
        
        {/* Dashboard Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(12, 1fr)', 
          gap: 3,
          mb: 4
        }}>
          {/* Financial Summary */}
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
            <FinancialSummary />
          </Box>
          
          {/* Order Type Distribution */}
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
            <OrderTypeDistribution />
          </Box>
          
          {/* Top Orders */}
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 12', md: 'span 4' } }}>
            <TopOrders />
          </Box>
          
          {/* Recent Orders */}
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 12', md: 'span 6' } }}>
            <RecentOrders />
          </Box>
          
          {/* Popular Dishes */}
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 12', md: 'span 6' } }}>
            <Box sx={{ height: '100%', bgcolor: '#2c2c2e', borderRadius: 1, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>Popular Menu Items</Typography>
              <MenuItems items={popularItems} loading={popularItemsLoading} error={error}  />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ 
        width: { xs: '100%', sm: 320 }, 
        height: { xs: 'auto', sm: '100vh' }, 
        position: { xs: 'static', sm: 'relative' },
        display: { xs: 'none', sm: 'block' } // Hide on mobile to prevent layout issues
      }}>
        <OrderSummary />
      </Box>
    </Box>
  );
};

export default Dashboard;
