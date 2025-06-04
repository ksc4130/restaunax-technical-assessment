import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { MenuItem } from '../services/menuItemService';
import { menuItemService } from '../services/menuItemService';
import { Manager } from 'socket.io-client';
import type { UpdateMenuItemDto, CreateMenuItemDto } from '../services/menuItemService';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || '';

interface MenuItemContextType {
  menuItems: MenuItem[];
  popularItems: MenuItem[];
  loading: boolean;
  error: string | null;
  popularItemsLoading: boolean;
  menuItemsLoading: boolean;
  creatingMenuItem: boolean;
  fetchMenuItems: (category?: string) => Promise<void>;
  fetchPopularItems: (limit?: number) => Promise<void>;
  getMenuItemById: (id: number) => MenuItem | undefined;
  createMenuItem: (menuItem: CreateMenuItemDto | FormData) => Promise<MenuItem | null>;
  updateMenuItem: (id: number, menuItem: UpdateMenuItemDto | FormData) => Promise<MenuItem | null>;
  deleteMenuItem: (id: number) => Promise<boolean>;
}

const MenuItemContext = createContext<MenuItemContextType | undefined>(undefined);

interface MenuItemProviderProps {
  children: ReactNode;
}

export const MenuItemProvider: React.FC<MenuItemProviderProps> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [menuItemsLoading, setMenuItemsLoading] = useState<boolean>(false);
  const [popularItemsLoading, setPopularItemsLoading] = useState<boolean>(false);
  const [creatingMenuItem, setCreatingMenuItem] = useState<boolean>(false);
  const loading = menuItemsLoading || popularItemsLoading;
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').split('/rest')[0];

  const setMenuItemImagePaths = useCallback((items: MenuItem[]) => {
    items.forEach(item => {
      if (item.imagePath && item.imagePath.startsWith(API_BASE_URL)) {
        item.imagePath.replace(API_BASE_URL, '');
      }
      item.imagePath = API_BASE_URL + item.imagePath;
    });
  }, [API_BASE_URL]);

  const fetchMenuItems = useCallback(async (category?: string) => {
    setMenuItemsLoading(true);
    setError(null);
    try {
      const data = await menuItemService.getAll(category);
      setMenuItemImagePaths(data);
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
      console.error('Error fetching menu items:', err);
    } finally {
      setMenuItemsLoading(false);
    }
  }, [setMenuItemImagePaths]);

  const fetchPopularItems = useCallback(async (limit: number = 5) => {
    setPopularItemsLoading(true);
    setError(null);
    try {
      const data = await menuItemService.getPopular(limit);
      setMenuItemImagePaths(data);
      setPopularItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch popular items');
      console.error('Error fetching popular items:', err);
    } finally {
      setPopularItemsLoading(false);
    }
  }, [setMenuItemImagePaths]);

  const getMenuItemById = (id: number) => {
    const data = menuItems.find(item => item.id === id);
    if (data) {
      setMenuItemImagePaths([data]);
    }
    return data;
  };

  const createMenuItem = async (menuItem: CreateMenuItemDto | FormData): Promise<MenuItem | null> => {
    setCreatingMenuItem(true);
    setError(null);
    try {
      const newMenuItem = await menuItemService.create(menuItem);
      // No need to refresh the menu items list as Socket.io will handle it
      return newMenuItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create menu item');
      console.error('Error creating menu item:', err);
      return null;
    } finally {
      setCreatingMenuItem(false);
    }
  };

  const updateMenuItem = async (id: number, menuItem: UpdateMenuItemDto | FormData): Promise<MenuItem | null> => {
    setError(null);
    try {
      // Use the appropriate update method based on the type of menuItem
      const updatedMenuItem = await menuItemService.update(id, menuItem);
      // No need to refresh the menu items list as Socket.io will handle it
      return updatedMenuItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update menu item');
      console.error('Error updating menu item:', err);
      return null;
    }
  };

  const deleteMenuItem = async (id: number): Promise<boolean> => {
    setError(null);
    try {
      await menuItemService.delete(id);
      // No need to refresh the menu items list as Socket.io will handle it
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete menu item');
      console.error('Error deleting menu item:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchPopularItems();
  }, [fetchMenuItems, fetchPopularItems]);

  // Set up Socket.io connection for real-time menu item updates
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

    const socket = manager.socket("/menu-items");

    socket.on("connect", () => {
      if (!socket) return;

      console.log("✅ Connected to Menu Items Socket.IO server");
      console.log(`🔗 Socket ID: ${socket.id}`);
      console.log(`🌐 Connected: ${socket.connected}`);

      socket.on("menuItem:created", (menuItem: MenuItem) => {
        console.log("Received menuItem:created event:", menuItem);
        
        // Create a copy of the new menu item to avoid modifying the original
        const newMenuItemWithPath = { ...menuItem };
        
        // Set the image path
        if (newMenuItemWithPath.imagePath) {
          // Check if the path already includes the API_BASE_URL to avoid duplication
          if (!newMenuItemWithPath.imagePath.startsWith(API_BASE_URL)) {
            newMenuItemWithPath.imagePath = API_BASE_URL + newMenuItemWithPath.imagePath;
          }
        }
        
        setMenuItems(prevItems => {
          // Check if item already exists to avoid duplicates
          if (prevItems.some(item => item.id === menuItem.id)) {
            return prevItems;
          }
          return [...prevItems, newMenuItemWithPath];
        });
        
        // Also update the popular items if needed (assuming new items are popular)
        if (popularItems.length < 5) {
          setPopularItems(prevItems => {
            // Check if item already exists to avoid duplicates
            if (prevItems.some(item => item.id === menuItem.id)) {
              return prevItems;
            }
            return [...prevItems, newMenuItemWithPath];
          });
        }
      });

      socket.on("menuItem:updated", (updatedMenuItem: MenuItem) => {
        console.log("Received menuItem:updated event:", updatedMenuItem);
        
        // Create a copy of the updated menu item to avoid modifying the original
        const updatedMenuItemWithPath = { ...updatedMenuItem };
        
        // Set the image path
        if (updatedMenuItemWithPath.imagePath) {
          // Check if the path already includes the API_BASE_URL to avoid duplication
          setMenuItemImagePaths([updatedMenuItemWithPath]);
        }
        
        setMenuItems(prevItems => 
          prevItems.map(item => {
            if (item.id === updatedMenuItem.id) {
              return {...item, ...updatedMenuItemWithPath}; // Merge the updated item
            }
            return item;
          })
        );
        
        // Also update the popular items if the updated item is in there
        setPopularItems(prevItems => 
          prevItems.map(item => {
            if (item.id === updatedMenuItem.id) {
              return {...item, ...updatedMenuItemWithPath}; // Merge the updated item
            }
            return item;
          })
        );
      });

      socket.on("menuItem:deleted", (data: { id: number }) => {
        console.log("Received menuItem:deleted event:", data);
        setMenuItems(prevItems => prevItems.filter(item => item.id !== data.id));
        setPopularItems(prevItems => prevItems.filter(item => item.id !== data.id));
      });
    });

    return () => {
      socket.off("menuItem:created");
      socket.off("menuItem:updated");
      socket.off("menuItem:deleted");
      socket.disconnect();
      console.log("❌ Disconnected from Menu Items Socket.IO server");
    };
  }, [API_BASE_URL]);

  const value = {
    menuItems,
    popularItems,
    loading,
    error,
    popularItemsLoading,
    menuItemsLoading,
    creatingMenuItem,
    fetchMenuItems,
    fetchPopularItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };

  return (
    <MenuItemContext.Provider value={value}>
      {children}
    </MenuItemContext.Provider>
  );
};

export const useMenuItems = (): MenuItemContextType => {
  const context = useContext(MenuItemContext);
  if (context === undefined) {
    throw new Error('useMenuItems must be used within a MenuItemProvider');
  }
  return context;
};
