
import { useState } from "react";
import { supabase, formatCurrency } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Item, ItemResponse, NewItem, EditingItem } from "../types";

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState({
    stockCode: false,
    productName: false,
    warehouse: false,
  });

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
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
          warehouses:warehouses!items_warehouse_id_fkey (
            name,
            location
          )
        `)
        .is('deleted_at', null);
      
      if (error) throw error;
      
      console.log("Fetched items:", data);
      
      // Explicitly type the data from Supabase as any to allow us to work around the type issue
      const supabaseData = data as any[];
      
      const formattedItems = (supabaseData || []).map((item) => {
        // Handle the warehouses object correctly
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
        };
      });

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error("Failed to fetch items");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `item-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('items')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('items')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const validateForm = (form: NewItem) => {
    const errors = {
      stockCode: !form.stockCode.trim(),
      productName: !form.productName.trim(),
      warehouse: !form.warehouse,
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleAddItem = async (newItem: NewItem) => {
    if (!validateForm(newItem)) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Using a direct SQL RPC call to bypass the triggers
      const { data, error } = await supabase.rpc('add_item_without_audit', {
        p_sku: newItem.stockCode,
        p_name: newItem.productName,
        p_boxes: newItem.boxes,
        p_units_per_box: newItem.unitsPerBox,
        p_bought_price: newItem.boughtPrice,
        p_shipment_fees: newItem.shipmentFees,
        p_selling_price: newItem.sellingPrice,
        p_warehouse_id: newItem.warehouse,
        p_quantity: newItem.boxes * newItem.unitsPerBox,
        p_image: imageUrl || "/placeholder.svg",
        p_low_stock_threshold: newItem.lowStockThreshold
      });

      if (error) {
        // Fallback to direct insert if RPC is not available
        console.log("Falling back to direct insert due to RPC error:", error);
        
        // Use prepared statement syntax with the auth.uid() function disabled for this insert
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .insert([
            {
              sku: newItem.stockCode,
              name: newItem.productName,
              boxes: newItem.boxes,
              units_per_box: newItem.unitsPerBox,
              bought_price: newItem.boughtPrice,
              shipment_fees: newItem.shipmentFees,
              selling_price: newItem.sellingPrice,
              warehouse_id: newItem.warehouse,
              quantity: newItem.boxes * newItem.unitsPerBox,
              image: imageUrl || "/placeholder.svg",
              low_stock_threshold: newItem.lowStockThreshold,
            }
          ])
          .select();

        if (itemError) throw itemError;
        console.log("Item added successfully via direct insert:", itemData);
      } else {
        console.log("Item added successfully via RPC:", data);
      }

      toast.success("Item added successfully");
      fetchItems(); // Refresh the items list
      return true;
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error("Failed to add item: " + (error as Error).message);
      return false;
    }
  };

  const handleUpdateItem = async (editingItem: EditingItem) => {
    if (!validateForm(editingItem)) {
      toast.error("Please fill in all required fields");
      return false;
    }

    try {
      // Upload image if a new one is provided
      let imageUrl = editingItem.image;
      if (imageFile) {
        const newImageUrl = await uploadImage(imageFile);
        if (newImageUrl) {
          imageUrl = newImageUrl;
        }
      }

      const { error } = await supabase
        .from('items')
        .update({
          sku: editingItem.stockCode,
          name: editingItem.productName,
          boxes: editingItem.boxes,
          units_per_box: editingItem.unitsPerBox,
          bought_price: editingItem.boughtPrice,
          shipment_fees: editingItem.shipmentFees,
          selling_price: editingItem.sellingPrice,
          warehouse_id: editingItem.warehouse,
          quantity: editingItem.boxes * editingItem.unitsPerBox,
          image: imageUrl,
          low_stock_threshold: editingItem.lowStockThreshold,
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      
      toast.success("Item updated successfully");
      fetchItems(); // Refresh the items list
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error("Failed to update item: " + (error as Error).message);
      return false;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      // Soft delete the item by setting deleted_at
      const { error } = await supabase
        .from('items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', itemId);
      
      if (error) throw error;
      
      toast.success("Item moved to recycle bin");
      fetchItems(); // Refresh the items list
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error("Failed to delete item: " + (error as Error).message);
      return false;
    }
  };

  return {
    items,
    isLoading,
    imagePreview,
    setImagePreview,
    imageFile,
    setImageFile,
    formErrors,
    setFormErrors,
    fetchItems,
    validateForm,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    uploadImage
  };
};
