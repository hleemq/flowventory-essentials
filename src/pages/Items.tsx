
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
  itemsCount: number;
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
        () => {
          fetchWarehouses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(warehouseChannel);
    };
  }, []);

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*');
      
      if (error) throw error;
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error("Failed to fetch warehouses");
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          warehouses!fk_items_warehouses (
            name,
            location
          )
        `);
      
      if (error) throw error;
      
      const formattedItems = data.map(item => ({
        id: item.id,
        image: item.image || "/placeholder.svg",
        stockCode: item.sku,
        productName: item.name,
        boxes: item.boxes,
        unitsPerBox: item.units_per_box,
        initialPrice: item.bought_price + item.shipment_fees,
        sellingPrice: item.selling_price,
        location: item.warehouses?.name || '',
        stockStatus: item.quantity > 0 ? "In Stock" : "Out of Stock",
        unitsLeft: item.quantity,
      }));

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
          }
        ])
        .select()
        .single();

      if (itemError) throw itemError;

      // Get current warehouse count
      const { data: warehouseData, error: getWarehouseError } = await supabase
        .from('warehouses')
        .select('items_count')
        .eq('id', newItem.warehouse)
        .single();
        
      if (getWarehouseError) throw getWarehouseError;

      // Update warehouse items count
      const { error: warehouseError } = await supabase
        .from('warehouses')
        .update({ 
          items_count: (warehouseData?.items_count || 0) + 1
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
      });
      
      fetchItems();
      toast.success("Item added successfully");
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error("Failed to add item");
    }
  };

  return (
    <div className="container py-8 animate-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{t.title}</h1>
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
              <div className="grid gap-2">
                <Label htmlFor="boxes">{t.boxes}</Label>
                <Input
                  id="boxes"
                  type="number"
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
                  value={newItem.unitsPerBox}
                  onChange={(e) =>
                    setNewItem({ ...newItem, unitsPerBox: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="boughtPrice">{t.boughtPrice}</Label>
                <Input
                  id="boughtPrice"
                  type="number"
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
                  value={newItem.shipmentFees}
                  onChange={(e) =>
                    setNewItem({ ...newItem, shipmentFees: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sellingPrice">{t.sellingPrice}</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={newItem.sellingPrice}
                  onChange={(e) =>
                    setNewItem({ ...newItem, sellingPrice: Number(e.target.value) })
                  }
                />
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
              {items
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
                    <TableCell>{item.stockStatus}</TableCell>
                    <TableCell>{item.unitsLeft}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        •••
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Items;
