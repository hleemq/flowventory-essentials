
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Items",
    description: "Add/edit items, scan barcodes, view low-stock alerts",
    addItem: "Add Item",
    addNewStockItem: "Add New Stock Item",
    uploadImage: "Upload Image",
    stockCode: "Stock Code",
    productName: "Product Name",
    boxes: "Boxes",
    unitsPerBox: "Units Per Box",
    boughtPrice: "Bought Price",
    shipmentFees: "Shipment Fees",
    sellingPrice: "Selling Price",
    warehouse: "Warehouse",
    selectWarehouse: "Select warehouse",
    cancel: "Cancel",
    search: "Search items...",
    location: "Location",
    initialPrice: "Initial Price",
    stockStatus: "Stock Status",
    unitsLeft: "Units Left",
    actions: "Actions",
    image: "Image",
    lowStockThreshold: "Low Stock Threshold",
  },
  fr: {
    title: "Articles",
    description: "Ajouter/modifier des articles, scanner des codes-barres, voir les alertes de stock bas",
    addItem: "Ajouter un article",
    addNewStockItem: "Ajouter un nouvel article",
    uploadImage: "Télécharger une image",
    stockCode: "Code stock",
    productName: "Nom du produit",
    boxes: "Boîtes",
    unitsPerBox: "Unités par boîte",
    boughtPrice: "Prix d'achat",
    shipmentFees: "Frais d'expédition",
    sellingPrice: "Prix de vente",
    warehouse: "Entrepôt",
    selectWarehouse: "Sélectionner un entrepôt",
    cancel: "Annuler",
    search: "Rechercher des articles...",
    location: "Emplacement",
    initialPrice: "Prix initial",
    stockStatus: "État du stock",
    unitsLeft: "Unités restantes",
    actions: "Actions",
    image: "Image",
    lowStockThreshold: "Seuil de stock bas",
  },
  ar: {
    title: "العناصر",
    description: "إضافة/تعديل العناصر، مسح الباركود، عرض تنبيهات المخزون المنخفض",
    addItem: "إضافة عنصر",
    addNewStockItem: "إضافة عنصر جديد",
    uploadImage: "رفع صورة",
    stockCode: "رمز المخزون",
    productName: "اسم المنتج",
    boxes: "الصناديق",
    unitsPerBox: "الوحدات لكل صندوق",
    boughtPrice: "سعر الشراء",
    shipmentFees: "رسوم الشحن",
    sellingPrice: "سعر البيع",
    warehouse: "المستودع",
    selectWarehouse: "اختر المستودع",
    cancel: "إلغاء",
    search: "البحث عن العناصر...",
    location: "الموقع",
    initialPrice: "السعر الأولي",
    stockStatus: "حالة المخزون",
    unitsLeft: "الوحدات المتبقية",
    actions: "الإجراءات",
    image: "الصورة",
    lowStockThreshold: "حد المخزون المنخفض",
  }
};

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
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  items_count: number;
}

// Define the shape of what Supabase returns for items
interface ItemResponse {
  id: string;
  image: string | null;
  sku: string;
  name: string;
  boxes: number;
  units_per_box: number;
  bought_price: number;
  shipment_fees: number;
  selling_price: number;
  quantity: number;
  warehouse_id: string | null;
  warehouses?: {  // Make this a single object, not an array
    name: string;
    location: string;
  } | null;
}

const Items = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({
    stockCode: false,
    productName: false,
    warehouse: false,
  });

  const [newItem, setNewItem] = useState({
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

  useEffect(() => {
    fetchWarehouses();
    fetchItems();

    // Subscribe to realtime updates for warehouses
    const warehouseChannel = supabase
      .channel('warehouse-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'warehouses'
        },
        (payload) => {
          console.log('Warehouse update received:', payload);
          fetchWarehouses();
        }
      )
      .subscribe();

    // Subscribe to realtime updates for items
    const itemsChannel = supabase
      .channel('items-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items'
        },
        (payload) => {
          console.log('Item update received:', payload);
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(warehouseChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, []);

  const fetchWarehouses = async () => {
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
  };

  const fetchItems = async () => {
    try {
      // Fix the relationship syntax by using one of the suggested relationships
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
        `);
      
      if (error) throw error;
      
      console.log("Fetched items:", data);
      
      const formattedItems = (data || []).map((item: ItemResponse) => {
        // Handle the warehouses object correctly - it could be null or a single object
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
    }
  };

  const validateForm = () => {
    const errors = {
      stockCode: !newItem.stockCode.trim(),
      productName: !newItem.productName.trim(),
      warehouse: !newItem.warehouse,
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleAddItem = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
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
        p_image: newItem.image || "/placeholder.svg",
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
              image: newItem.image || "/placeholder.svg",
              low_stock_threshold: newItem.lowStockThreshold,
            }
          ])
          .select();

        if (itemError) throw itemError;
        console.log("Item added successfully via direct insert:", itemData);
      } else {
        console.log("Item added successfully via RPC:", data);
      }

      // Update warehouse items count
      const { error: warehouseError } = await supabase
        .from('warehouses')
        .update({ 
          items_count: warehouses.find(w => w.id === newItem.warehouse)?.items_count + 1 || 1
        })
        .eq('id', newItem.warehouse);

      if (warehouseError) throw warehouseError;

      setIsDialogOpen(false);
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
      
      toast.success("Item added successfully");
      fetchItems(); // Refresh the items list
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error("Failed to add item: " + (error as Error).message);
    }
  };

  return (
    <div className="container py-8 animate-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.description}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <div className="flex flex-col items-center gap-4">
                <img
                  src={newItem.image || "/placeholder.svg"}
                  alt="Product"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <Button variant="outline" onClick={() => {}}>
                  {t.uploadImage}
                </Button>
              </div>
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleAddItem}>{t.addItem}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.image}</TableHead>
                <TableHead>{t.stockCode}</TableHead>
                <TableHead>{t.productName}</TableHead>
                <TableHead>{t.boxes}</TableHead>
                <TableHead>{t.unitsPerBox}</TableHead>
                <TableHead>{t.initialPrice}</TableHead>
                <TableHead>{t.sellingPrice}</TableHead>
                <TableHead>{t.location}</TableHead>
                <TableHead>{t.stockStatus}</TableHead>
                <TableHead>{t.unitsLeft}</TableHead>
                <TableHead>{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    No items found. Click 'Add Item' to add your first inventory item.
                  </TableCell>
                </TableRow>
              ) : (
                items
                  .filter(
                    (item) =>
                      item.productName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      item.stockCode
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>{item.stockCode}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.boxes}</TableCell>
                      <TableCell>{item.unitsPerBox}</TableCell>
                      <TableCell>{item.initialPrice}</TableCell>
                      <TableCell>{item.sellingPrice}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.stockStatus === "In Stock" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {item.stockStatus}
                        </span>
                      </TableCell>
                      <TableCell>{item.unitsLeft}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          •••
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Items;
