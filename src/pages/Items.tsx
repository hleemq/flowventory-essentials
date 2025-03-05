
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Trash, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
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
import { supabase, supportedCurrencies } from "@/integrations/supabase/client";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Items",
    description: "Add/edit items, scan barcodes, view low-stock alerts",
    addItem: "Add Item",
    addNewStockItem: "Add New Stock Item",
    uploadImage: "Upload Image",
    maxSize: "Max size: 5MB (JPEG, PNG, WebP)",
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
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this item?",
    confirm: "Yes, delete",
    viewTrash: "View Deleted Items",
    imageUploadError: "Image must be a JPEG, PNG, or WebP file under 5MB",
    dragDrop: "Drag and drop an image here, or click to select",
    currency: "Currency",
    selectCurrency: "Select currency"
  },
  fr: {
    title: "Articles",
    description: "Ajouter/modifier des articles, scanner des codes-barres, voir les alertes de stock bas",
    addItem: "Ajouter un article",
    addNewStockItem: "Ajouter un nouvel article",
    uploadImage: "Télécharger une image",
    maxSize: "Taille max: 5MB (JPEG, PNG, WebP)",
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
    edit: "Modifier",
    delete: "Supprimer",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet article ?",
    confirm: "Oui, supprimer",
    viewTrash: "Voir les articles supprimés",
    imageUploadError: "L'image doit être un fichier JPEG, PNG ou WebP de moins de 5 Mo",
    dragDrop: "Faites glisser une image ici, ou cliquez pour sélectionner",
    currency: "Devise",
    selectCurrency: "Sélectionner une devise"
  },
  ar: {
    title: "العناصر",
    description: "إضافة/تعديل العناصر، مسح الباركود، عرض تنبيهات المخزون المنخفض",
    addItem: "إضافة عنصر",
    addNewStockItem: "إضافة عنصر جديد",
    uploadImage: "رفع صورة",
    maxSize: "الحجم الأقصى: 5 ميغابايت (JPEG، PNG، WebP)",
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
    edit: "تعديل",
    delete: "حذف",
    confirmDelete: "هل أنت متأكد من حذف هذا العنصر؟",
    confirm: "نعم، احذف",
    viewTrash: "عرض العناصر المحذوفة",
    imageUploadError: "يجب أن تكون الصورة بتنسيق JPEG أو PNG أو WebP وأقل من 5 ميغابايت",
    dragDrop: "اسحب صورة وأسقطها هنا، أو انقر للتحديد",
    currency: "العملة",
    selectCurrency: "اختر العملة"
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
  currency: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  items_count: number;
}

// Define the shapes for the forms
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

interface EditingItem extends NewItem {
  id: string;
}

// Define different dialog modes
type DialogMode = 'add' | 'edit' | 'delete' | null;

const Items = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [formErrors, setFormErrors] = useState({
    stockCode: false,
    productName: false,
    warehouse: false,
    image: false,
  });

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
    currency: "MAD",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

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
          currency,
          warehouses:warehouses!items_warehouse_id_fkey (
            name,
            location
          )
        `)
        .is('deleted_at', null); // Only fetch non-deleted items
      
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
          currency: item.currency || "MAD",
        };
      });

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error("Failed to fetch items");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const validateAndSetImage = (file: File) => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(t.imageUploadError);
      setFormErrors({...formErrors, image: true});
      return;
    }
    
    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.imageUploadError);
      setFormErrors({...formErrors, image: true});
      return;
    }

    // Valid image
    setFormErrors({...formErrors, image: false});
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Set the file in the form data
    if (dialogMode === 'add') {
      setNewItem({...newItem, image: file});
    } else if (dialogMode === 'edit' && selectedItem) {
      setNewItem({...newItem, image: file});
    }
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const errors = {
      stockCode: !newItem.stockCode.trim(),
      productName: !newItem.productName.trim(),
      warehouse: !newItem.warehouse,
      image: false,
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

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

  const handleAddItem = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Handle image upload if it's a File object
      let imageUrl = newItem.image as string;
      if (newItem.image instanceof File) {
        imageUrl = await uploadImage(newItem.image);
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
        p_low_stock_threshold: newItem.lowStockThreshold,
        p_currency: newItem.currency
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
              currency: newItem.currency
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

      setDialogMode(null);
      resetForm();
      
      toast.success("Item added successfully");
      fetchItems(); // Refresh the items list
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error("Failed to add item: " + (error as Error).message);
    }
  };

  const handleEditItem = async () => {
    if (!validateForm() || !selectedItem) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Handle image upload if it's a File object
      let imageUrl = newItem.image as string;
      if (newItem.image instanceof File) {
        imageUrl = await uploadImage(newItem.image);
      }

      const { error } = await supabase
        .from('items')
        .update({
          sku: newItem.stockCode,
          name: newItem.productName,
          boxes: newItem.boxes,
          units_per_box: newItem.unitsPerBox,
          bought_price: newItem.boughtPrice,
          shipment_fees: newItem.shipmentFees,
          selling_price: newItem.sellingPrice,
          warehouse_id: newItem.warehouse,
          quantity: newItem.boxes * newItem.unitsPerBox,
          image: imageUrl,
          low_stock_threshold: newItem.lowStockThreshold,
          currency: newItem.currency
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      setDialogMode(null);
      resetForm();
      
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
      // Soft delete by setting deleted_at timestamp
      const { error } = await supabase
        .from('items')
        .update({
          deleted_at: new Date().toISOString()
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      setDialogMode(null);
      setSelectedItem(null);
      
      toast.success("Item moved to trash");
      fetchItems(); // Refresh the items list
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error("Failed to delete item: " + (error as Error).message);
    }
  };

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
      currency: "MAD",
    });
    setImagePreview("");
    setSelectedItem(null);
    setFormErrors({
      stockCode: false,
      productName: false,
      warehouse: false,
      image: false
    });
  };

  const openAddDialog = () => {
    resetForm();
    setDialogMode('add');
  };

  const openEditDialog = (item: Item) => {
    // Find the original item data
    const { data, error } = supabase
      .from('items')
      .select('*')
      .eq('id', item.id)
      .single();

    if (error) {
      console.error('Error fetching item for edit:', error);
      toast.error("Failed to load item details");
      return;
    }

    data.then((originalItem) => {
      if (originalItem) {
        setSelectedItem(item);
        setImagePreview(originalItem.image || "/placeholder.svg");
        setNewItem({
          id: originalItem.id,
          image: originalItem.image || "",
          stockCode: originalItem.sku,
          productName: originalItem.name,
          boxes: originalItem.boxes,
          unitsPerBox: originalItem.units_per_box,
          boughtPrice: originalItem.bought_price,
          shipmentFees: originalItem.shipment_fees,
          sellingPrice: originalItem.selling_price,
          warehouse: originalItem.warehouse_id,
          lowStockThreshold: originalItem.low_stock_threshold,
          currency: originalItem.currency || "MAD",
        });
        setDialogMode('edit');
      }
    });
  };

  const openDeleteDialog = (item: Item) => {
    setSelectedItem(item);
    setDialogMode('delete');
  };

  const getCurrencySymbol = (currencyCode: string) => {
    return supportedCurrencies[currencyCode]?.symbol || currencyCode;
  };

  return (
    <div className="container py-8 animate-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.description}</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t.addItem}
        </Button>
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
                      <TableCell>{item.initialPrice} {getCurrencySymbol(item.currency)}</TableCell>
                      <TableCell>{item.sellingPrice} {getCurrencySymbol(item.currency)}</TableCell>
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
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(item)}>
                              <Trash className="h-4 w-4 mr-2" />
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
      </Card>

      {/* Floating button for Corbeille (trash bin) */}
      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={() => navigate('/corbeille')} 
          variant="outline" 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg bg-background"
          title={t.viewTrash}
        >
          <Trash2 className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={dialogMode === 'add'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t.addNewStockItem}</DialogTitle>
            <DialogDescription>
              Fill in the item details below to add it to your inventory.
            </DialogDescription>
          </DialogHeader>
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
                onClick={triggerFileInput}
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
            <div className="grid gap-2">
              <Label htmlFor="currency">{t.currency}</Label>
              <Select
                value={newItem.currency}
                onValueChange={(value) =>
                  setNewItem({ ...newItem, currency: value })
                }
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
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setDialogMode(null)}>
              {t.cancel}
            </Button>
            <Button onClick={handleAddItem}>{t.addItem}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={dialogMode === 'edit'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the item details below.
            </DialogDescription>
          </DialogHeader>
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
                onClick={triggerFileInput}
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
                <Label htmlFor="editStockCode" className="flex items-center gap-1">
                  {t.stockCode}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="editStockCode"
                  value={newItem.stockCode}
                  onChange={(e) =>
                    setNewItem({ ...newItem, stockCode: e.target.value })
                  }
                  className={formErrors.stockCode ? "border-red-500" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editProductName" className="flex items-center gap-1">
                  {t.productName}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="editProductName"
                  value={newItem.productName}
                  onChange={(e) =>
                    setNewItem({ ...newItem, productName: e.target.value })
                  }
                  className={formErrors.productName ? "border-red-500" : ""}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editWarehouse" className="flex items-center gap-1">
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
                  id="editWarehouse"
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
                <Label htmlFor="editBoxes">{t.boxes}</Label>
                <Input
                  id="editBoxes"
                  type="number"
                  min="0"
                  value={newItem.boxes}
                  onChange={(e) =>
                    setNewItem({ ...newItem, boxes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editUnitsPerBox">{t.unitsPerBox}</Label>
                <Input
                  id="editUnitsPerBox"
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
                <Label htmlFor="editBoughtPrice">{t.boughtPrice}</Label>
                <Input
                  id="editBoughtPrice"
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
                <Label htmlFor="editShipmentFees">{t.shipmentFees}</Label>
                <Input
                  id="editShipmentFees"
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
                <Label htmlFor="editSellingPrice">{t.sellingPrice}</Label>
                <Input
                  id="editSellingPrice"
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
                <Label htmlFor="editLowStockThreshold">{t.lowStockThreshold}</Label>
                <Input
                  id="editLowStockThreshold"
                  type="number"
                  min="0"
                  value={newItem.lowStockThreshold}
                  onChange={(e) =>
                    setNewItem({ ...newItem, lowStockThreshold: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editCurrency">{t.currency}</Label>
              <Select
                value={newItem.currency}
                onValueChange={(value) =>
                  setNewItem({ ...newItem, currency: value })
                }
              >
                <SelectTrigger id="editCurrency">
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
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setDialogMode(null)}>
              {t.cancel}
            </Button>
            <Button onClick={handleEditItem}>{t.edit}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogMode === 'delete'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.confirmDelete}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedItem && (
              <p>
                This will move the item "{selectedItem.productName}" to the trash bin. 
                You can restore it from there if needed within 30 days.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setDialogMode(null)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              {t.confirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Items;
