
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supportedCurrencies } from "@/integrations/supabase/client";

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

interface ItemFormProps {
  item: NewItem;
  formErrors: {
    stockCode: boolean;
    productName: boolean;
    warehouse: boolean;
    image: boolean;
  };
  warehouses: Warehouse[];
  onItemChange: (item: NewItem) => void;
  onSubmit: () => void;
  onCancel: () => void;
  imagePreview: string;
  setImagePreview: (url: string) => void;
  translations: any;
  submitLabel: string;
}

const ItemForm = ({
  item,
  formErrors,
  warehouses,
  onItemChange,
  onSubmit,
  onCancel,
  imagePreview,
  setImagePreview,
  translations: t,
  submitLabel
}: ItemFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (field: keyof NewItem, value: any) => {
    onItemChange({ ...item, [field]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const validateAndSetImage = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type) || file.size > maxSize) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    handleInputChange('image', file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="flex flex-col items-center gap-4">
        <div
          className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/10' 
              : formErrors.image 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-primary hover:bg-primary/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-full w-auto max-w-full object-contain"
            />
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-1">{t.dragDrop}</p>
              <p className="text-xs text-muted-foreground">{t.maxSize}</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="stockCode" className="flex items-center gap-1">
            {t.stockCode}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="stockCode"
            value={item.stockCode}
            onChange={(e) => handleInputChange('stockCode', e.target.value)}
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
            value={item.productName}
            onChange={(e) => handleInputChange('productName', e.target.value)}
            className={formErrors.productName ? "border-red-500" : ""}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="warehouse" className="flex items-center gap-1">
          {t.warehouse}
          <span className="text-red-500">*</span>
        </Label>
        <Select
          value={item.warehouse}
          onValueChange={(value) => handleInputChange('warehouse', value)}
        >
          <SelectTrigger className={formErrors.warehouse ? "border-red-500" : ""}>
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
            value={item.boxes}
            onChange={(e) => handleInputChange('boxes', Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="unitsPerBox">{t.unitsPerBox}</Label>
          <Input
            id="unitsPerBox"
            type="number"
            min="0"
            value={item.unitsPerBox}
            onChange={(e) => handleInputChange('unitsPerBox', Number(e.target.value))}
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
            value={item.boughtPrice}
            onChange={(e) => handleInputChange('boughtPrice', Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="shipmentFees">{t.shipmentFees}</Label>
          <Input
            id="shipmentFees"
            type="number"
            min="0"
            step="0.01"
            value={item.shipmentFees}
            onChange={(e) => handleInputChange('shipmentFees', Number(e.target.value))}
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
            value={item.sellingPrice}
            onChange={(e) => handleInputChange('sellingPrice', Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lowStockThreshold">{t.lowStockThreshold}</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            min="0"
            value={item.lowStockThreshold}
            onChange={(e) => handleInputChange('lowStockThreshold', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="currency">{t.currency}</Label>
        <Select
          value={item.currency}
          onValueChange={(value) => handleInputChange('currency', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t.selectCurrency} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(supportedCurrencies).map(([code, currency]) => (
              <SelectItem key={code} value={code}>
                {currency.symbol} - {currency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          {t.cancel}
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </div>
  );
};

export default ItemForm;
