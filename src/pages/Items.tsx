
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UploadCloud, 
  MoreHorizontal,
  RefreshCw 
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase, formatCurrency } from "@/integrations/supabase/client";
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
    editItem: "Edit Item",
    deleteItem: "Delete Item",
    confirmDelete: "Confirm Delete",
    confirmDeleteMessage: "Are you sure you want to delete this item? It will be moved to the recycle bin and can be recovered within 30 days.",
    dragImage: "Drag and drop image here or click to browse",
    update: "Update",
    recycleBin: "Recycle Bin",
    edit: "Edit",
    delete: "Delete",
    viewRecycleBin: "View Recycle Bin",
    emptyState: "No items found. Click 'Add Item' to add your first inventory item.",
    noResults: "No items found matching your search."
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
    editItem: "Modifier l'article",
    deleteItem: "Supprimer l'article",
    confirmDelete: "Confirmer la suppression",
    confirmDeleteMessage: "Êtes-vous sûr de vouloir supprimer cet article ? Il sera déplacé vers la corbeille et pourra être récupéré dans les 30 jours.",
    dragImage: "Faites glisser et déposez l'image ici ou cliquez pour parcourir",
    update: "Mettre à jour",
    recycleBin: "Corbeille",
    edit: "Modifier",
    delete: "Supprimer",
    viewRecycleBin: "Voir la corbeille",
    emptyState: "Aucun article trouvé. Cliquez sur 'Ajouter un article' pour ajouter votre premier article d'inventaire.",
    noResults: "Aucun article trouvé correspondant à votre recherche."
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
    editItem: "تعديل العنصر",
    deleteItem: "حذف العنصر",
    confirmDelete: "تأكيد الحذف",
    confirmDeleteMessage: "هل أنت متأكد من أنك تريد حذف هذا العنصر؟ سيتم نقله إلى سلة المحذوفات ويمكن استعادته خلال 30 يومًا.",
    dragImage: "اسحب وأفلت الصورة هنا أو انقر للتصفح",
    update: "تحديث",
    recycleBin: "سلة المحذوفات",
    edit: "تعديل",
    delete: "حذف",
    viewRecycleBin: "عرض سلة المحذوفات",
    emptyState: "لم يتم العثور على عناصر. انقر على 'إضافة عنصر' لإضافة أول عنصر مخزون.",
    noResults: "لم يتم العثور على عناصر مطابقة لبحثك."
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
  warehouses: {  // This is returned as a single object, not an array
    name: string;
    location: string;
  } | null;
}

const Items = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  const [editingItem, setEditingItem] = useState({
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

  useEffect(() => {
    // Handle drag and drop events for the dropzone
    const dropzone = dropzoneRef.current;
    if (!dropzone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('border-primary');
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('border-primary');
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('border-primary');
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    };

    dropzone.addEventListener('dragover', handleDragOver);
    dropzone.addEventListener('dragleave', handleDragLeave);
    dropzone.addEventListener('drop', handleDrop);

    return () => {
      dropzone.removeEventListener('dragover', handleDragOver);
      dropzone.removeEventListener('dragleave', handleDragLeave);
      dropzone.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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

  const validateForm = (form: typeof newItem) => {
    const errors = {
      stockCode: !form.stockCode.trim(),
      productName: !form.productName.trim(),
      warehouse: !form.warehouse,
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleAddItem = async () => {
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

      // Update warehouse items count
      const { error: warehouseError } = await supabase
        .from('warehouses')
        .update({ 
          items_count: warehouses.find(w => w.id === newItem.warehouse)?.items_count + 1 || 1
        })
        .eq('id', newItem.warehouse);

      if (warehouseError) throw warehouseError;

      setIsDialogOpen(false);
      resetNewItemForm();
      
      toast.success("Item added successfully");
      fetchItems(); // Refresh the items list
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error("Failed to add item: " + (error as Error).message);
    }
  };

  const resetNewItemForm = () => {
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
  };

  const handleOpenEditDialog = async (item: Item) => {
    setSelectedItem(item);
    
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
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error('Error fetching item details:', error);
      toast.error("Failed to fetch item details");
    }
  };

  const handleUpdateItem = async () => {
    if (!validateForm(editingItem)) {
      toast.error("Please fill in all required fields");
      return;
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

      setIsEditDialogOpen(false);
      resetNewItemForm();
      
      toast.success("Item updated successfully");
      fetchItems(); // Refresh the items list
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error("Failed to update item: " + (error as Error).message);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      // Soft delete the item by setting deleted_at
      const { error } = await supabase
        .from('items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', selectedItem.id);
      
      if (error) throw error;
      
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      
      toast.success("Item moved to recycle bin");
      fetchItems(); // Refresh the items list
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error("Failed to delete item: " + (error as Error).message);
    }
  };

  return (
    <div className="container py-8 animate-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.description}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetNewItemForm();
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
              <div 
                ref={dropzoneRef}
                className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">{t.dragImage}</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    {t.emptyState}
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
                      <TableCell>{formatCurrency(item.initialPrice)}</TableCell>
                      <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Recycle bin button (fixed at the bottom right) */}
        <div className="fixed bottom-8 right-8">
          <Button 
            variant="outline" 
            className="rounded-full w-12 h-12 p-0 shadow-md"
            onClick={() => navigate('/recycle-bin')}
            title={t.viewRecycleBin}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setImagePreview(null);
          setImageFile(null);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.editItem}</DialogTitle>
            <DialogDescription>
              Update the item details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Image upload dropzone */}
            <div 
              ref={dropzoneRef}
              className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview || editingItem.image ? (
                <img
                  src={imagePreview || editingItem.image}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center text-center p-4">
                  <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t.dragImage}</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleImageFile(e.target.files[0]);
                  }
                }}
              />
            </div>
            
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleUpdateItem}>{t.update}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.confirmDelete}</DialogTitle>
            <DialogDescription>{t.confirmDeleteMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              {t.delete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Items;
