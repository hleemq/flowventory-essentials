
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageContainer from "@/components/layout/PageContainer";
import ItemsHeader from "@/components/items/ItemsHeader";

const translations = {
  en: {
    title: "Warehouses",
    description: "Add/edit warehouse name or geolocation",
    addWarehouse: "Add Warehouse",
    addNewWarehouse: "Add New Warehouse",
    name: "Name",
    location: "Location",
    itemsCount: "Items Count",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    warehouseName: "Warehouse name",
    warehouseLocation: "Warehouse location",
  },
  fr: {
    title: "Entrepôts",
    description: "Ajouter/modifier le nom ou la géolocalisation de l'entrepôt",
    addWarehouse: "Ajouter un entrepôt",
    addNewWarehouse: "Ajouter un nouvel entrepôt",
    name: "Nom",
    location: "Emplacement",
    itemsCount: "Nombre d'articles",
    actions: "Actions",
    edit: "Modifier",
    delete: "Supprimer",
    cancel: "Annuler",
    warehouseName: "Nom de l'entrepôt",
    warehouseLocation: "Emplacement de l'entrepôt",
  },
  ar: {
    title: "المستودعات",
    description: "إضافة/تعديل اسم المستودع أو الموقع الجغرافي",
    addWarehouse: "إضافة مستودع",
    addNewWarehouse: "إضافة مستودع جديد",
    name: "الاسم",
    location: "الموقع",
    itemsCount: "عدد العناصر",
    actions: "الإجراءات",
    edit: "تعديل",
    delete: "حذف",
    cancel: "إلغاء",
    warehouseName: "اسم المستودع",
    warehouseLocation: "موقع المستودع",
  }
};

interface Warehouse {
  id: string;
  name: string;
  location: string;
  items_count: number;
}

const Warehouses = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    location: false,
  });

  useEffect(() => {
    fetchWarehouses();

    // Subscribe to realtime updates
    const channel = supabase
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
      supabase.removeChannel(channel);
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

  const validateForm = () => {
    const errors = {
      name: !newWarehouse.name.trim(),
      location: !newWarehouse.location.trim(),
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleAddWarehouse = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('warehouses')
        .insert([
          {
            name: newWarehouse.name,
            location: newWarehouse.location,
            items_count: 0,
          }
        ])
        .select();

      if (error) throw error;

      setWarehouses([...warehouses, ...data]);
      setIsDialogOpen(false);
      setNewWarehouse({ name: "", location: "" });
      toast.success("Warehouse added successfully");
    } catch (error) {
      console.error('Error adding warehouse:', error);
      toast.error("Failed to add warehouse");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setWarehouses(warehouses.filter(w => w.id !== id));
      toast.success("Warehouse deleted successfully");
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast.error("Failed to delete warehouse");
    }
  };

  return (
    <PageContainer>
      <ItemsHeader
        title={t.title}
        description={t.description}
        addButtonLabel={t.addWarehouse}
        onAddClick={() => setIsDialogOpen(true)}
        language={language}
      />

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.name}</TableHead>
              <TableHead>{t.location}</TableHead>
              <TableHead>{t.itemsCount}</TableHead>
              <TableHead>{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell>{warehouse.name}</TableCell>
                <TableCell>{warehouse.location}</TableCell>
                <TableCell>{warehouse.items_count}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="text-blue-500">
                      {t.edit}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-red-500"
                      onClick={() => handleDelete(warehouse.id)}
                    >
                      {t.delete}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.addNewWarehouse}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                {t.name}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder={t.warehouseName}
                value={newWarehouse.name}
                onChange={(e) =>
                  setNewWarehouse({ ...newWarehouse, name: e.target.value })
                }
                className={formErrors.name ? "border-red-500" : ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                {t.location}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder={t.warehouseLocation}
                value={newWarehouse.location}
                onChange={(e) =>
                  setNewWarehouse({ ...newWarehouse, location: e.target.value })
                }
                className={formErrors.location ? "border-red-500" : ""}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleAddWarehouse}>{t.addWarehouse}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Warehouses;
