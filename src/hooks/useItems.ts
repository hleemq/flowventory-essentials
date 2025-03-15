
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type definitions for items and related entities
interface Item {
  id: string;
  image: string;
  stockCode: string;
  productName: string;
  boxes: number;
  unitsPerBox: number;
  initialPrice: number;
  sellingPrice: number;
  location: string;
  stockStatus: string;
  unitsLeft: number;
  currency: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  items_count: number;
}

interface NewItem {
  image: string | File;
  stockCode: string;
  productName: string;
  boxes: number;
  unitsPerBox: number;
  boughtPrice: number;
  shipmentFees: number;
  sellingPrice: number;
  warehouse: string;
  lowStockThreshold: number;
  currency: string;
}

/**
 * Custom hook for managing inventory items
 * Provides functionality to fetch, filter, and manage items and warehouses
 * 
 * @param isDeleted - When true, fetch only deleted items (trash bin)
 * @returns Object with items data and management functions
 */
export const useItems = (isDeleted = false) => {
  // State management for items, warehouses and loading status
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches warehouse data from the database
   * Used for warehouse selection in item forms and filtering
   */
  const fetchWarehouses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*');
      
      if (error) throw error;
      console.log("Fetched warehouses:", data);
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error("Failed to fetch warehouses");
    }
  }, []);

  /**
   * Fetches item data from the database with related warehouse information
   * Filters items based on deletion status (for trash bin functionality)
   */
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build query with join to warehouses table
      const query = supabase
        .from('items')
        .select(`
          id,
          image,
          sku,
          name,
          boxes,
          units_per_box,
          bought_price,
          shipment_fees,
          selling_price,
          quantity,
          warehouse_id,
          currency,
          warehouses:warehouses!items_warehouse_id_fkey (
            name,
            location
          )
        `);
      
      // Filter based on deleted status
      if (isDeleted) {
        query.not('deleted_at', 'is', null);
      } else {
        query.is('deleted_at', null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log(`Fetched ${isDeleted ? 'deleted' : ''} items:`, data);
      
      const supabaseData = data as any[];
      
      // Transform the data from database format to application format
      const formattedItems = (supabaseData || []).map((item) => {
        let warehouseName = '';
        
        if (item.warehouses) {
          warehouseName = item.warehouses.name || '';
        }
        
        return {
          id: item.id,
          image: item.image || "/placeholder.svg",
          stockCode: item.sku,
          productName: item.name,
          boxes: item.boxes,
          unitsPerBox: item.units_per_box,
          initialPrice: item.bought_price + item.shipment_fees,
          sellingPrice: item.selling_price,
          location: warehouseName,
          stockStatus: item.quantity > 0 ? "In Stock" : "Out of Stock",
          unitsLeft: item.quantity,
          currency: item.currency || "MAD",
        };
      });

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error("Failed to fetch items");
    } finally {
      setIsLoading(false);
    }
  }, [isDeleted]);

  /**
   * Uploads an image file to Supabase storage
   * Generates a random filename to avoid collisions
   * 
   * @param file - The file object to upload
   * @returns URL of the uploaded file
   */
  const uploadImage = async (file: File): Promise<string> => {
    // Generate unique filename to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `items/${fileName}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('public')
      .upload(filePath, file);
    
    if (error) {
      throw error;
    }
    
    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };

  // Initial data fetch and realtime subscriptions
  useEffect(() => {
    fetchWarehouses();
    fetchItems();

    // Set up realtime subscriptions to database changes
    // This allows the UI to update automatically when data changes

    // Listen for warehouse table changes
    const warehouseChannel = supabase
      .channel('warehouse-updates')
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen for all events (insert, update, delete)
          schema: 'public',
          table: 'warehouses'
        },
        () => {
          fetchWarehouses();
        }
      )
      .subscribe();

    // Listen for items table changes
    const itemsChannel = supabase
      .channel('items-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items'
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    // Listen for settings table changes
    const settingsChannel = supabase
      .channel('settings-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings'
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    // Listen for notifications
    const notificationsChannel = supabase
      .channel('notifications-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          console.log('Notification update received:', payload);
        }
      )
      .subscribe();

    // Clean up subscriptions when component unmounts
    return () => {
      supabase.removeChannel(warehouseChannel);
      supabase.removeChannel(itemsChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [fetchItems, fetchWarehouses]);

  // Return values and functions for component use
  return {
    items,
    warehouses,
    fetchItems,
    fetchWarehouses,
    isLoading,
    uploadImage
  };
};
