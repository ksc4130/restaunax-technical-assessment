import apiRequest from './api';
import type { MenuItem } from './menuItemService';

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  orderId: number;
  menuItemId: number;
  menuItem: MenuItem;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  customer: string;
  total: number;
  status: string;
  type: string;
  deliveryFee?: number;
  promotionCode?: string;
  address: string;
  time: string;
  createdAt: string;
  updatedAt: string;
  userId?: number;
  orderItems: OrderItem[];
}

export interface CreateOrderItemDto {
  menuItemId: number;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  customer: string;
  address: string;
  type?: string;
  promotionCode?: string;
  deliveryFee?: number;
  userId?: number;
  items: CreateOrderItemDto[];
}

export interface UpdateOrderDto {
  customer?: string;
  status?: string;
  type?: string;
  address?: string;
  promotionCode?: string;
  deliveryFee?: number;
}

export const orderService = {
  getAll: async (status?: string): Promise<Order[]> => {
    const endpoint = status ? `/orders?status=${encodeURIComponent(status)}` : '/orders';
    return apiRequest<Order[]>(endpoint);
  },

  getById: async (id: number): Promise<Order> => {
    return apiRequest<Order>(`/orders/${id}`);
  },

  create: async (order: CreateOrderDto): Promise<Order> => {
    return apiRequest<Order, CreateOrderDto>('/orders', 'POST', order);
  },

  update: async (id: number, order: UpdateOrderDto): Promise<Order> => {
    return apiRequest<Order, UpdateOrderDto>(`/orders/${id}`, 'PUT', order);
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/orders/${id}`, 'DELETE');
  },

  getByUserId: async (userId: number): Promise<Order[]> => {
    return apiRequest<Order[]>(`/orders/user/${userId}`);
  },

  addItems: async (orderId: number, items: CreateOrderItemDto[]): Promise<Order> => {
    return apiRequest<Order, CreateOrderItemDto[]>(`/orders/${orderId}/items`, 'POST', items);
  },

  removeItem: async (orderId: number, itemId: number): Promise<Order> => {
    return apiRequest<Order>(`/orders/${orderId}/items/${itemId}`, 'DELETE');
  }
};
