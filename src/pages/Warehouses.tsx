
import { useState } from "react";
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
  itemsCount: number;
}

const Warehouses = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: "1",
      name: "Depot",
      location: "Sbit",
      itemsCount: 2,
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
  });

  const handleAddWarehouse = () => {
    const warehouse: Warehouse = {
      id: Math.random().toString(36).slice(2),
      name: newWarehouse.name,
      location: newWarehouse.location,
      itemsCount: 0,
    };

    setWarehouses([...warehouses, warehouse]);
    setIsDialogOpen(false);
    setNewWarehouse({ name: "", location: "" });
  };

  const handleDelete = (id: string) => {
    setWarehouses(warehouses.filter(w => w.id !== id));
  };

  return (
    <div className="container py-8 animate-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t.addWarehouse}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t.addNewWarehouse}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  placeholder={t.warehouseName}
                  value={newWarehouse.name}
                  onChange={(e) =>
                    setNewWarehouse({ ...newWarehouse, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">{t.location}</Label>
                <Input
                  id="location"
                  placeholder={t.warehouseLocation}
                  value={newWarehouse.location}
                  onChange={(e) =>
                    setNewWarehouse({ ...newWarehouse, location: e.target.value })
                  }
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
      </div>

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
                <TableCell>{warehouse.itemsCount}</TableCell>
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
    </div>
  );
};

export default Warehouses;
