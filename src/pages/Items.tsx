
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ItemsTable from "@/components/items/ItemsTable";
import ItemsHeader from "@/components/items/ItemsHeader";
import ItemsSearch from "@/components/items/ItemsSearch";
import TrashButton from "@/components/items/TrashButton";
import ItemDialogs from "@/components/items/ItemDialogs";
import { useItems } from "@/hooks/useItems";

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
    deleteItemDescription: "This will move the item \"{itemName}\" to the trash bin. You can restore it from there if needed within 30 days.",
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
    deleteItemDescription: "Cela déplacera l'article \"{itemName}\" vers la corbeille. Vous pourrez le restaurer à partir de là si nécessaire dans les 30 jours.",
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
    deleteItemDescription: "سيؤدي هذا إلى نقل العنصر \"{itemName}\" إلى سلة المهملات. يمكنك استعادته من هناك إذا لزم الأمر في غضون 30 يومًا.",
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

type DialogMode = 'add' | 'edit' | 'delete' | null;

const Items = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [formErrors, setFormErrors] = useState({
    stockCode: false,
    productName: false,
    warehouse: false,
    image: false,
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
    currency: "MAD",
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  
  const { items, warehouses, fetchItems, uploadImage, isLoading } = useItems();

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

  const handleAddItem = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      let imageUrl = newItem.image as string;
      if (newItem.image instanceof File) {
        imageUrl = await uploadImage(newItem.image);
      }

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
        console.log("Falling back to direct insert due to RPC error:", error);
        
        // Direct insert if RPC fails
        const { error: itemError } = await supabase
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
          ]);

        if (itemError) throw itemError;
      }

      setDialogMode(null);
      resetForm();
      
      toast.success("Item added successfully");
      fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(`Failed to add item: ${(error as Error).message}`);
    }
  };

  const handleEditItem = async () => {
    if (!validateForm() || !selectedItem) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
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
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(`Failed to update item: ${(error as Error).message}`);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
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
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(`Failed to delete item: ${(error as Error).message}`);
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
    const { data, error } = supabase
      .from('items')
      .select('*')
      .eq('id', item.id)
      .single();

    if (!data || error) {
      console.error('Error fetching item for edit:', error);
      toast.error("Failed to load item details");
      return;
    }

    data.then((originalItem) => {
      if (originalItem) {
        setSelectedItem(item);
        setImagePreview(originalItem.image || "/placeholder.svg");
        setNewItem({
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

  return (
    <div className="container py-8 animate-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <ItemsHeader 
        title={t.title}
        description={t.description}
        addButtonLabel={t.addItem}
        onAddClick={openAddDialog}
        language={language}
      />

      <Card className="p-6">
        <ItemsSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={t.search}
        />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading items...</div>
          </div>
        ) : (
          <ItemsTable
            items={items}
            searchQuery={searchQuery}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            translations={t}
          />
        )}
      </Card>

      <TrashButton title={t.viewTrash} />

      <ItemDialogs
        dialogMode={dialogMode}
        setDialogMode={setDialogMode}
        newItem={newItem}
        setNewItem={setNewItem}
        selectedItem={selectedItem}
        formErrors={formErrors}
        warehouses={warehouses}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        onAddItem={handleAddItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
        translations={t}
      />
    </div>
  );
};

export default Items;
