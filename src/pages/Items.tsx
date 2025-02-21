
import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const Items = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleAddItem = () => {
    const item: Item = {
      id: Math.random().toString(36).slice(2),
      image: newItem.image || "/placeholder.svg",
      stockCode: newItem.stockCode,
      productName: newItem.productName,
      boxes: newItem.boxes,
      unitsPerBox: newItem.unitsPerBox,
      initialPrice: newItem.boughtPrice + newItem.shipmentFees,
      sellingPrice: newItem.sellingPrice,
      location: newItem.warehouse,
      stockStatus: "In Stock",
      unitsLeft: newItem.boxes * newItem.unitsPerBox,
    };

    setItems([...items, item]);
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
                <Label htmlFor="stockCode">{t.stockCode}</Label>
                <Input
                  id="stockCode"
                  value={newItem.stockCode}
                  onChange={(e) =>
                    setNewItem({ ...newItem, stockCode: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="productName">{t.productName}</Label>
                <Input
                  id="productName"
                  value={newItem.productName}
                  onChange={(e) =>
                    setNewItem({ ...newItem, productName: e.target.value })
                  }
                />
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
                    setNewItem({
                      ...newItem,
                      shipmentFees: Number(e.target.value),
                    })
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
                    setNewItem({
                      ...newItem,
                      sellingPrice: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="warehouse">{t.warehouse}</Label>
                <Input
                  id="warehouse"
                  placeholder={t.selectWarehouse}
                  value={newItem.warehouse}
                  onChange={(e) =>
                    setNewItem({ ...newItem, warehouse: e.target.value })
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
