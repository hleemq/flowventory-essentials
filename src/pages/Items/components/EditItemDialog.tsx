
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "./ImageUpload";
import { Item, Warehouse, EditingItem } from "../types";

interface EditItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item;
  warehouses: Warehouse[];
  onUpdateItem: (item: EditingItem) => Promise<boolean>;
  translations: any;
}

const EditItemDialog = ({ 
  isOpen, 
  onOpenChange, 
  item, 
  warehouses, 
  onUpdateItem,
  translations: t 
}: EditItemDialogProps) => {
  const [editingItem, setEditingItem] = useState<EditingItem>({
    id: "",
    image: "",
    stockCode: "",
    productName: "",
    boxes: 0,
    unitsPerBox: 0,
    boughtPrice: 0,
    shipmentFees: 0,
    sellingPrice: 0,
    warehouse: "",
    lowStockThreshold: 10,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState({
    stockCode: false,
    productName: false,
    warehouse: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      fetchItemDetails();
    }
  }, [isOpen, item]);

  const fetchItemDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch the complete item data from Supabase
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', item.id)
        .single();
      
      if (error) throw error;
      
      setEditingItem({
        id: data.id,
        image: data.image || "",
        stockCode: data.sku,
        productName: data.name,
        boxes: data.boxes,
        unitsPerBox: data.units_per_box,
        boughtPrice: data.bought_price,
        shipmentFees: data.shipment_fees,
        sellingPrice: data.selling_price,
        warehouse: data.warehouse_id || "",
        lowStockThreshold: data.low_stock_threshold,
      });
      
      setImagePreview(data.image);
    } catch (error) {
      console.error('Error fetching item details:', error);
      toast.error("Failed to fetch item details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (file: File) => {
    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateItemSubmit = async () => {
    const success = await onUpdateItem({
      ...editingItem,
      image: imagePreview || editingItem.image
    });

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.editItem}</DialogTitle>
          <DialogDescription>
            Update the item details below.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              {/* Image upload dropzone */}
              <ImageUpload 
                imagePreview={imagePreview || editingItem.image} 
                onImageChange={handleImageChange} 
                dragImageText={t.dragImage}
              />
              
              <div className="grid gap-2">
                <Label htmlFor="edit-stockCode" className="flex items-center gap-1">
                  {t.stockCode}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-stockCode"
                  value={editingItem.stockCode}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, stockCode: e.target.value })
                  }
                  className={formErrors.stockCode ? "border-red-500" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-productName" className="flex items-center gap-1">
                  {t.productName}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-productName"
                  value={editingItem.productName}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, productName: e.target.value })
                  }
                  className={formErrors.productName ? "border-red-500" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-warehouse" className="flex items-center gap-1">
                  {t.warehouse}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={editingItem.warehouse}
                  onValueChange={(value) =>
                    setEditingItem({ ...editingItem, warehouse: value })
                  }
                >
                  <SelectTrigger
                    className={formErrors.warehouse ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder={t.selectWarehouse} />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-boxes">{t.boxes}</Label>
                  <Input
                    id="edit-boxes"
                    type="number"
                    min="0"
                    value={editingItem.boxes}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, boxes: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-unitsPerBox">{t.unitsPerBox}</Label>
                  <Input
                    id="edit-unitsPerBox"
                    type="number"
                    min="0"
                    value={editingItem.unitsPerBox}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, unitsPerBox: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-boughtPrice">{t.boughtPrice}</Label>
                  <Input
                    id="edit-boughtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingItem.boughtPrice}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, boughtPrice: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-shipmentFees">{t.shipmentFees}</Label>
                  <Input
                    id="edit-shipmentFees"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingItem.shipmentFees}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, shipmentFees: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-sellingPrice">{t.sellingPrice}</Label>
                  <Input
                    id="edit-sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingItem.sellingPrice}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, sellingPrice: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lowStockThreshold">{t.lowStockThreshold}</Label>
                  <Input
                    id="edit-lowStockThreshold"
                    type="number"
                    min="0"
                    value={editingItem.lowStockThreshold}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, lowStockThreshold: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleUpdateItemSubmit}>{t.update}</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
