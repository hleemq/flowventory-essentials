
import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { NewItem, Warehouse } from "../types";
import { toast } from "sonner";

interface AddItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  warehouses: Warehouse[];
  onAddItem: (newItem: NewItem) => Promise<boolean>;
  translations: any;
}

const AddItemDialog = ({ 
  isOpen, 
  onOpenChange, 
  warehouses, 
  onAddItem, 
  translations: t 
}: AddItemDialogProps) => {
  const [newItem, setNewItem] = useState<NewItem>({
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

  const resetForm = () => {
    setNewItem({
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
    setImagePreview(null);
    setImageFile(null);
    setFormErrors({
      stockCode: false,
      productName: false,
      warehouse: false,
    });
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

  const handleSubmit = async () => {
    // Validate form
    const errors = {
      stockCode: !newItem.stockCode.trim(),
      productName: !newItem.productName.trim(),
      warehouse: !newItem.warehouse,
    };
    
    setFormErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const success = await onAddItem({
      ...newItem,
      image: imagePreview || ""
    });

    if (success) {
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.addItem}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.addNewStockItem}</DialogTitle>
          <DialogDescription>
            Fill in the item details below to add it to your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Image upload dropzone */}
          <ImageUpload 
            imagePreview={imagePreview} 
            onImageChange={handleImageChange}
            dragImageText={t.dragImage} 
          />
          
          <div className="grid gap-2">
            <Label htmlFor="stockCode" className="flex items-center gap-1">
              {t.stockCode}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="stockCode"
              value={newItem.stockCode}
              onChange={(e) =>
                setNewItem({ ...newItem, stockCode: e.target.value })
              }
              className={formErrors.stockCode ? "border-red-500" : ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="productName" className="flex items-center gap-1">
              {t.productName}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productName"
              value={newItem.productName}
              onChange={(e) =>
                setNewItem({ ...newItem, productName: e.target.value })
              }
              className={formErrors.productName ? "border-red-500" : ""}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="warehouse" className="flex items-center gap-1">
              {t.warehouse}
              <span className="text-red-500">*</span>
            </Label>
            <Select
              value={newItem.warehouse}
              onValueChange={(value) =>
                setNewItem({ ...newItem, warehouse: value })
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
              <Label htmlFor="boxes">{t.boxes}</Label>
              <Input
                id="boxes"
                type="number"
                min="0"
                value={newItem.boxes}
                onChange={(e) =>
                  setNewItem({ ...newItem, boxes: Number(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unitsPerBox">{t.unitsPerBox}</Label>
              <Input
                id="unitsPerBox"
                type="number"
                min="0"
                value={newItem.unitsPerBox}
                onChange={(e) =>
                  setNewItem({ ...newItem, unitsPerBox: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="boughtPrice">{t.boughtPrice}</Label>
              <Input
                id="boughtPrice"
                type="number"
                min="0"
                step="0.01"
                value={newItem.boughtPrice}
                onChange={(e) =>
                  setNewItem({ ...newItem, boughtPrice: Number(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shipmentFees">{t.shipmentFees}</Label>
              <Input
                id="shipmentFees"
                type="number"
                min="0"
                step="0.01"
                value={newItem.shipmentFees}
                onChange={(e) =>
                  setNewItem({ ...newItem, shipmentFees: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sellingPrice">{t.sellingPrice}</Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                value={newItem.sellingPrice}
                onChange={(e) =>
                  setNewItem({ ...newItem, sellingPrice: Number(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lowStockThreshold">{t.lowStockThreshold}</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={newItem.lowStockThreshold}
                onChange={(e) =>
                  setNewItem({ ...newItem, lowStockThreshold: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button onClick={handleSubmit}>{t.addItem}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
