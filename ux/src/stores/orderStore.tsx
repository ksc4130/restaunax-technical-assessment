import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Order, CreateOrderDto, UpdateOrderDto, CreateOrderItemDto } from '../services/orderService';
import { orderService } from '../services/orderService';
import type { MenuItem } from '../services/menuItemService';
import { Manager } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  address: string;
  type: string;
  promotionCode?: string;
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  cartItems: CartItem[];
  customerInfo: CustomerInfo;
  deliveryFee: number;
  addToCart: (menuItem: MenuItem, quantity?: number) => void;
  removeFromCart: (menuItemId: number) => void;
  updateCartItemQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  updateDeliveryFee: (fee: number) => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  submitOrder: () => Promise<Order | null>;
  fetchOrders: (status?: string) => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  createOrder: (order: CreateOrderDto) => Promise<Order | null>;
  updateOrder: (id: number, order: UpdateOrderDto) => Promise<Order | null>;
  deleteOrder: (id: number) => Promise<boolean>;
  addItemsToOrder: (orderId: number, items: CreateOrderItemDto[]) => Promise<Order | null>;
  removeItemFromOrder: (orderId: number, itemId: number) => Promise<Order | null>;
  fetchUserOrders: (userId: number) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [orderByIdLoading, setOrderByIdLoading] = useState<boolean>(false);
  const [orderActionLoading, setOrderActionLoading] = useState<boolean>(false);
  const loading = ordersLoading || orderByIdLoading || orderActionLoading;
  const [error, setError] = useState<string | null>(null);
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    address: '',
    type: 'Delivery'
  });
  const [deliveryFee, setDeliveryFee] = useState<number>(10);

  const fetchOrders = useCallback(async (status?: string) => {
    setOrdersLoading(true);
    setError(null);
    try {
      const data = await orderService.getAll(status);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (id: number) => {
    setOrderByIdLoading(true);
    setError(null);
    try {
      const data = await orderService.getById(id);
      setCurrentOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
      console.error('Error fetching order:', err);
    } finally {
      setOrderByIdLoading(false);
    }
  }, []);

  const createOrder = async (order: CreateOrderDto): Promise<Order | null> => {
    setOrderActionLoading(true);
    setError(null);
    try {
      const newOrder = await orderService.create(order);
      setOrders(prevOrders => [...prevOrders, newOrder]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the order');
      console.error('Error creating order:', err);
      return null;
    } finally {
      setOrderActionLoading(false);
    }
  };

  const updateOrder = async (id: number, order: UpdateOrderDto): Promise<Order | null> => {
    setOrderActionLoading(true);
    setError(null);
    try {
      const updatedOrder = await orderService.update(id, order);
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === id ? updatedOrder : o)
      );
      if (currentOrder?.id === id) {
        setCurrentOrder(updatedOrder);
      }
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the order');
      console.error('Error updating order:', err);
      return null;
    } finally {
      setOrderActionLoading(false);
    }
  };

  const deleteOrder = async (id: number): Promise<boolean> => {
    setOrderActionLoading(true);
    setError(null);
    try {
      await orderService.delete(id);
      setOrders(prevOrders => prevOrders.filter(o => o.id !== id));
      if (currentOrder?.id === id) {
        setCurrentOrder(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the order');
      console.error('Error deleting order:', err);
      return false;
    } finally {
      setOrderActionLoading(false);
    }
  };

  const addItemsToOrder = async (orderId: number, items: CreateOrderItemDto[]): Promise<Order | null> => {
    setOrderActionLoading(true);
    setError(null);
    try {
      const updatedOrder = await orderService.addItems(orderId, items);
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? updatedOrder : o)
      );
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding items to the order');
      console.error('Error adding items to order:', err);
      return null;
    } finally {
      setOrderActionLoading(false);
    }
  };

  const removeItemFromOrder = async (orderId: number, itemId: number): Promise<Order | null> => {
    setOrderActionLoading(true);
    setError(null);
    try {
      const updatedOrder = await orderService.removeItem(orderId, itemId);
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? updatedOrder : o)
      );
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while removing the item from the order');
      console.error('Error removing item from order:', err);
      return null;
    } finally {
      setOrderActionLoading(false);
    }
  };

  const fetchUserOrders = useCallback(async (userId: number) => {
    setOrdersLoading(true);
    setError(null);
    try {
      const data = await orderService.getByUserId(userId);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching user orders');
      console.error('Error fetching user orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const addToCart = (menuItem: MenuItem, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.menuItem.id === menuItem.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.menuItem.id === menuItem.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        return [...prevItems, { menuItem, quantity }];
      }
    });
  };

  const removeFromCart = (menuItemId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.menuItem.id !== menuItemId));
  };

  const updateCartItemQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.menuItem.id === menuItemId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateCustomerInfo = (info: Partial<CustomerInfo>) => {
    setCustomerInfo(prev => ({ ...prev, ...info }));
  };

  const updateDeliveryFee = (fee: number) => {
    setDeliveryFee(fee);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const getCartTotal = () => {
    // Only include delivery fee for delivery orders
    const fee = customerInfo.type === 'Delivery' ? deliveryFee : 0;
    return getCartSubtotal() + fee;
  };

  const submitOrder = async (): Promise<Order | null> => {
    if (cartItems.length === 0) {
      setError('Cannot submit an empty order');
      return null;
    }

    if (!customerInfo.name || !customerInfo.address) {
      setError('Customer name and address are required');
      return null;
    }

    const orderData: CreateOrderDto = {
      customer: customerInfo.name,
      address: customerInfo.address,
      type: customerInfo.type,
      promotionCode: customerInfo.promotionCode,
      deliveryFee,
      items: cartItems.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        price: item.menuItem.price
      }))
    };

    const newOrder = await createOrder(orderData);
    if (newOrder) {
      clearCart();
    }
    return newOrder;
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const manager = new Manager(SOCKET_URL, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ["websocket", "polling"],
    path: "/socket.io",
    autoConnect: true,
    forceNew: true,
    secure: true,
    rejectUnauthorized: false,
  });

  const socket = manager.socket("/orders");

  socket.on("connect", () => {
    if (!socket) return;

    // Use the actual Socket.IO client ID
    // clientId = socket.id;
    console.log("✅ Connected to Socket.IO server");
    console.log(`🔗 Socket ID: ${socket.id}`);
    console.log(`🌐 Connected: ${socket.connected}`);

    socket.on("order:created", (order: Order) => {
      console.log("Received order:created event:", order);
      setOrders(prevOrders => {
        // Check if order already exists to avoid duplicates
        if (prevOrders.some(o => o.id === order.id)) {
          return prevOrders;
        }
        return [...prevOrders, order];
      });
    });
    socket.on("order:updated", (updatedOrder: Order) => {
      console.log("Received order:updated event:", updatedOrder);
      setOrders(prevOrders => 
        prevOrders.map(order => order.id === updatedOrder.id ? updatedOrder : order)
      );
      
      // Update current order if it's the one that was updated
      if (currentOrder?.id === updatedOrder.id) {
        setCurrentOrder(updatedOrder);
      }
    });
    socket.on("order:deleted", (data: { id: number }) => {
      console.log("Received order:deleted event:", data);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== data.id));
      
      // Clear current order if it's the one that was deleted
      if (currentOrder?.id === data.id) {
        setCurrentOrder(null);
      }
    });

    return () => {
      socket.off("order:created");
      socket.off("order:updated");
      socket.off("order:deleted");
      socket.disconnect();
      console.log("❌ Disconnected from Socket.IO server");
    }
  });
  }, [fetchOrders, currentOrder]);

  const value = {
    orders,
    currentOrder,
    loading,
    error,
    cartItems,
    customerInfo,
    deliveryFee,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    updateCustomerInfo,
    updateDeliveryFee,
    getCartTotal,
    getCartSubtotal,
    submitOrder,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    addItemsToOrder,
    removeItemFromOrder,
    fetchUserOrders,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
