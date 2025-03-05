
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, Trash, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, ar } from "date-fns/locale";

// Define available translations
const translations = {
  en: {
    title: "Trash Bin",
    description: "Items deleted in the last 30 days can be restored or permanently deleted",
    search: "Search deleted items...",
    noItems: "No deleted items found.",
    image: "Image",
    stockCode: "Stock Code",
    productName: "Product Name",
    deletedAt: "Deleted",
    actions: "Actions",
    restore: "Restore",
    permanentlyDelete: "Permanently Delete",
    restoreSuccess: "Item restored successfully",
    deleteSuccess: "Item permanently deleted",
    confirmDelete: "Are you sure you want to permanently delete this item? This action cannot be undone.",
    yes: "Yes, delete",
    no: "No, cancel",
    daysLeft: "{count} days left",
    returnToItems: "Return to Items"
  },
  fr: {
    title: "Corbeille",
    description: "Les articles supprimés au cours des 30 derniers jours peuvent être restaurés ou supprimés définitivement",
    search: "Rechercher des articles supprimés...",
    noItems: "Aucun article supprimé trouvé.",
    image: "Image",
    stockCode: "Code stock",
    productName: "Nom du produit",
    deletedAt: "Supprimé",
    actions: "Actions",
    restore: "Restaurer",
    permanentlyDelete: "Supprimer définitivement",
    restoreSuccess: "Article restauré avec succès",
    deleteSuccess: "Article supprimé définitivement",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer définitivement cet article ? Cette action ne peut pas être annulée.",
    yes: "Oui, supprimer",
    no: "Non, annuler",
    daysLeft: "{count} jours restants",
    returnToItems: "Retour aux Articles"
  },
  ar: {
    title: "سلة المحذوفات",
    description: "يمكن استعادة العناصر المحذوفة في آخر 30 يومًا أو حذفها نهائيًا",
    search: "البحث في العناصر المحذوفة...",
    noItems: "لم يتم العثور على عناصر محذوفة.",
    image: "الصورة",
    stockCode: "رمز المخزون",
    productName: "اسم المنتج",
    deletedAt: "تم الحذف",
    actions: "الإجراءات",
    restore: "استعادة",
    permanentlyDelete: "حذف نهائي",
    restoreSuccess: "تمت استعادة العنصر بنجاح",
    deleteSuccess: "تم حذف العنصر نهائيًا",
    confirmDelete: "هل أنت متأكد أنك تريد حذف هذا العنصر نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.",
    yes: "نعم، احذف",
    no: "لا، إلغاء",
    daysLeft: "متبقي {count} أيام",
    returnToItems: "العودة إلى العناصر"
  }
};

interface Item {
  id: string;
  image: string;
  stockCode: string;
  productName: string;
  deleted_at: string;
}

const Corbeille = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState("");
  const [deletedItems, setDeletedItems] = useState<Item[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Set the appropriate locale for date-fns
  const getLocale = () => {
    switch (language) {
      case 'fr': return fr;
      case 'ar': return ar;
      default: return enUS;
    }
  };

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const fetchDeletedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          id,
          image,
          sku,
          name,
          deleted_at
        `)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedItems = (data || []).map((item) => ({
        id: item.id,
        image: item.image || "/placeholder.svg",
        stockCode: item.sku,
        productName: item.name,
        deleted_at: item.deleted_at,
      }));

      setDeletedItems(formattedItems);
    } catch (error) {
      console.error('Error fetching deleted items:', error);
      toast.error("Failed to fetch deleted items");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ deleted_at: null })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(t.restoreSuccess);
      fetchDeletedItems();
    } catch (error) {
      console.error('Error restoring item:', error);
      toast.error("Failed to restore item");
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeletePermanently = async () => {
    if (!itemToDelete) return;
    
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemToDelete);
      
      if (error) throw error;
      
      toast.success(t.deleteSuccess);
      setIsConfirmDeleteOpen(false);
      setItemToDelete(null);
      fetchDeletedItems();
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      toast.error("Failed to delete item");
    }
  };

  // Calculate days remaining until permanent deletion
  const getDaysRemaining = (deletedDate: string) => {
    const deleteDate = new Date(deletedDate);
    const expiryDate = new Date(deleteDate);
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return t.daysLeft.replace('{count}', String(daysLeft));
  };

  return (
    <div className="container py-8 animate-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.description}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/inventory/items')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.returnToItems}
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
                <TableHead>{t.deletedAt}</TableHead>
                <TableHead>{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t.noItems}
                  </TableCell>
                </TableRow>
              ) : (
                deletedItems
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
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDistanceToNow(new Date(item.deleted_at), { addSuffix: true, locale: getLocale() })}</span>
                          <span className="text-xs text-muted-foreground">{getDaysRemaining(item.deleted_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRestore(item.id)}
                            className="flex items-center"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            {t.restore}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => confirmDelete(item.id)}
                            className="flex items-center"
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            {t.permanentlyDelete}
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

      {/* Confirm Delete Dialog */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t.confirmDelete}</h2>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
                {t.no}
              </Button>
              <Button variant="destructive" onClick={handleDeletePermanently}>
                {t.yes}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Corbeille;
