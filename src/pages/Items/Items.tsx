
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Search, RefreshCw, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import ItemsTable from "./components/ItemsTable";
import AddItemDialog from "./components/AddItemDialog";
import EditItemDialog from "./components/EditItemDialog";
import DeleteItemDialog from "./components/DeleteItemDialog";
import { translations } from "./translations";
import { useItems } from "./hooks/useItems";
import { useWarehouses } from "./hooks/useWarehouses";
import { Item } from "./types";

const Items = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const { 
    items, 
    isLoading, 
    fetchItems, 
    handleAddItem, 
    handleUpdateItem, 
    handleDeleteItem 
  } = useItems();

  const { warehouses, fetchWarehouses } = useWarehouses();

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
      
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error('Error fetching item details:', error);
      toast.error("Failed to fetch item details");
    }
  };

  const openDeleteDialog = (item: Item) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const filteredItems = items.filter(
    (item) =>
      item.productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.stockCode
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-8 animate-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.description}</p>
        </div>
        <AddItemDialog 
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          warehouses={warehouses}
          onAddItem={handleAddItem}
          translations={t}
        />
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

        <ItemsTable 
          items={filteredItems} 
          isLoading={isLoading} 
          onEdit={handleOpenEditDialog} 
          onDelete={openDeleteDialog}
          translations={t}
        />
        
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
      {selectedItem && (
        <EditItemDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          item={selectedItem}
          warehouses={warehouses}
          onUpdateItem={handleUpdateItem}
          translations={t}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {selectedItem && (
        <DeleteItemDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          item={selectedItem}
          onDeleteItem={handleDeleteItem}
          translations={t}
        />
      )}
    </div>
  );
};

export default Items;
