
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { supabase, formatCurrency } from "@/integrations/supabase/client";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Recycle Bin",
    description: "Items deleted in the last 30 days",
    search: "Search deleted items...",
    backToItems: "Back to Items",
    empty: "The recycle bin is empty.",
    restore: "Restore",
    delete: "Delete Permanently",
    confirmDelete: "Confirm Permanent Deletion",
    confirmDeleteMessage: "This action cannot be undone. Are you sure you want to permanently delete this item?",
    cancel: "Cancel",
    confirmRestore: "Confirm Restore",
    confirmRestoreMessage: "Are you sure you want to restore this item?",
    noResults: "No items found matching your search.",
    deleteDate: "Delete Date",
    image: "Image",
    stockCode: "Stock Code",
    productName: "Product Name",
    warehouse: "Warehouse",
    actions: "Actions"
  },
  fr: {
    title: "Corbeille",
    description: "Articles supprimés au cours des 30 derniers jours",
    search: "Rechercher des articles supprimés...",
    backToItems: "Retour aux Articles",
    empty: "La corbeille est vide.",
    restore: "Restaurer",
    delete: "Supprimer définitivement",
    confirmDelete: "Confirmer la suppression définitive",
    confirmDeleteMessage: "Cette action ne peut pas être annulée. Êtes-vous sûr de vouloir supprimer définitivement cet article ?",
    cancel: "Annuler",
    confirmRestore: "Confirmer la restauration",
    confirmRestoreMessage: "Êtes-vous sûr de vouloir restaurer cet article ?",
    noResults: "Aucun article ne correspond à votre recherche.",
    deleteDate: "Date de suppression",
    image: "Image",
    stockCode: "Code stock",
    productName: "Nom du produit",
    warehouse: "Entrepôt",
    actions: "Actions"
  },
  ar: {
    title: "سلة المحذوفات",
    description: "العناصر المحذوفة في آخر 30 يومًا",
    search: "البحث في العناصر المحذوفة...",
    backToItems: "العودة إلى العناصر",
    empty: "سلة المحذوفات فارغة.",
    restore: "استعادة",
    delete: "حذف نهائي",
    confirmDelete: "تأكيد الحذف النهائي",
    confirmDeleteMessage: "لا يمكن التراجع عن هذا الإجراء. هل أنت متأكد من أنك تريد حذف هذا العنصر نهائيًا؟",
    cancel: "إلغاء",
    confirmRestore: "تأكيد الاستعادة",
    confirmRestoreMessage: "هل أنت متأكد من أنك تريد استعادة هذا العنصر؟",
    noResults: "لم يتم العثور على عناصر مطابقة لبحثك.",
    deleteDate: "تاريخ الحذف",
    image: "الصورة",
    stockCode: "رمز المخزون",
    productName: "اسم المنتج",
    warehouse: "المستودع",
    actions: "الإجراءات"
  }
};

interface DeletedItem {
  id: string;
  image: string;
  stockCode: string;
  productName: string;
  warehouse: string;
  deleted_at: string;
}

const RecycleBin = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DeletedItem | null>(null);

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const fetchDeletedItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          id,
          image,
          sku,
          name,
          deleted_at,
          warehouses:warehouses!items_warehouse_id_fkey (
            name
          )
        `)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      
      if (error) throw error;
      
      // Map the data to the expected format
      const formattedItems = (data || []).map((item: any) => ({
        id: item.id,
        image: item.image || "/placeholder.svg",
        stockCode: item.sku,
        productName: item.name,
        warehouse: item.warehouses?.name || '',
        deleted_at: new Date(item.deleted_at).toLocaleString(
          language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
          { dateStyle: 'medium', timeStyle: 'short' }
        ),
      }));

      setDeletedItems(formattedItems);
    } catch (error) {
      console.error('Error fetching deleted items:', error);
      toast.error("Failed to fetch deleted items");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedItem) return;
    
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', selectedItem.id);
      
      if (error) throw error;
      
      toast.success("Item permanently deleted");
      setDeletedItems(deletedItems.filter(item => item.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      toast.error("Failed to delete item");
    }
  };

  const handleRestore = async () => {
    if (!selectedItem) return;
    
    try {
      const { error } = await supabase
        .from('items')
        .update({ deleted_at: null })
        .eq('id', selectedItem.id);
      
      if (error) throw error;
      
      toast.success("Item restored successfully");
      setDeletedItems(deletedItems.filter(item => item.id !== selectedItem.id));
      setIsRestoreDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error("Failed to restore item");
    }
  };

  const filteredItems = deletedItems.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stockCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-8 animate-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.description}</p>
        </div>
        <Button onClick={() => navigate('/inventory/items')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.backToItems}
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
                <TableHead>{t.warehouse}</TableHead>
                <TableHead>{t.deleteDate}</TableHead>
                <TableHead>{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? t.noResults : t.empty}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
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
                    <TableCell>{item.warehouse}</TableCell>
                    <TableCell>{item.deleted_at}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsRestoreDialogOpen(true);
                          }}
                        >
                          {t.restore}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          {t.delete}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.confirmDelete}</DialogTitle>
            <DialogDescription>{t.confirmDeleteMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handlePermanentDelete}>
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.confirmRestore}</DialogTitle>
            <DialogDescription>{t.confirmRestoreMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleRestore}>
              {t.restore}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecycleBin;
