
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const useItems = (isDeleted = false) => {
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
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
      
      if (isDeleted) {
        query.not('deleted_at', 'is', null);
      } else {
        query.is('deleted_at', null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log(`Fetched ${isDeleted ? 'deleted' : ''} items:`, data);
      
      const supabaseData = data as any[];
      
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

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `items/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('public')
      .upload(filePath, file);
    
    if (error) {
      throw error;
    }
    
    const { data: urlData } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  };

  useEffect(() => {
    fetchWarehouses();
    fetchItems();

    const warehouseChannel = supabase
      .channel('warehouse-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'warehouses'
        },
        () => {
          fetchWarehouses();
        }
      )
      .subscribe();

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

    return () => {
      supabase.removeChannel(warehouseChannel);
      supabase.removeChannel(itemsChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [fetchItems, fetchWarehouses]);

  return {
    items,
    warehouses,
    fetchItems,
    fetchWarehouses,
    isLoading,
    uploadImage
  };
};
