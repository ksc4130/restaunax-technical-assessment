import apiRequest from './api';

const formDataRequest = async <T>(
  endpoint: string,
  method: string = 'POST',
  formData: FormData
): Promise<T> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    body: formData,
    credentials: 'omit',
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  
  return await response.json() as T;
};

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  imagePath?: string;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemDto {
  name: string;
  price: number;
  imagePath?: string;
  description?: string;
  category?: string;
}

export interface UpdateMenuItemDto {
  name?: string;
  price?: number;
  imagePath?: string;
  description?: string;
  category?: string;
}

export const menuItemService = {
  getAll: async (category?: string): Promise<MenuItem[]> => {
    const endpoint = category ? `/menu-items?category=${encodeURIComponent(category)}` : '/menu-items';
    return apiRequest<MenuItem[]>(endpoint);
  },

  getById: async (id: number): Promise<MenuItem> => {
    return apiRequest<MenuItem>(`/menu-items/${id}`);
  },

  create: async (menuItem: CreateMenuItemDto | FormData): Promise<MenuItem> => {
    if (menuItem instanceof FormData) {
      return formDataRequest<MenuItem>('/menu-items/upload', 'POST', menuItem);
    }
    return apiRequest<MenuItem, CreateMenuItemDto>('/menu-items', 'POST', menuItem);
  },

  update: async (id: number, menuItem: UpdateMenuItemDto | FormData): Promise<MenuItem> => {
    if (menuItem instanceof FormData) {
      return formDataRequest<MenuItem>(`/menu-items/${id}/upload`, 'PUT', menuItem);
    }
    return apiRequest<MenuItem, UpdateMenuItemDto>(`/menu-items/${id}`, 'PUT', menuItem);
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/menu-items/${id}`, 'DELETE');
  },

  getPopular: async (limit: number = 5): Promise<MenuItem[]> => {
    return apiRequest<MenuItem[]>(`/menu-items/popular?limit=${limit}`);
  }
};
