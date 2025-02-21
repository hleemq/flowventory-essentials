import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pen, Trash2 } from "lucide-react";
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
    title: "Orders",
    description: "Manage your orders here",
    newOrder: "New Order",
    createNewOrder: "Create New Order",
    customerDetails: "Customer Details",
    products: "Products",
    orderSummary: "Order Summary",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    orderNumber: "Order Number",
    customer: "Customer",
    date: "Date",
    status: "Status",
    totalAmount: "Total Amount",
    actions: "Actions",
    searchProducts: "Search products...",
    exportOrder: "Export Order",
    createOrder: "Create Order",
    completed: "Completed",
    cancel: "Cancel",
  },
  fr: {
    title: "Commandes",
    description: "Gérez vos commandes ici",
    newOrder: "Nouvelle commande",
    createNewOrder: "Créer une nouvelle commande",
    customerDetails: "Détails du client",
    products: "Produits",
    orderSummary: "Résumé de la commande",
    name: "Nom",
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    orderNumber: "Numéro de commande",
    customer: "Client",
    date: "Date",
    status: "Statut",
    totalAmount: "Montant total",
    actions: "Actions",
    searchProducts: "Rechercher des produits...",
    exportOrder: "Exporter la commande",
    createOrder: "Créer la commande",
    completed: "Terminée",
    cancel: "Annuler",
  },
  ar: {
    title: "الطلبات",
    description: "إدارة طلباتك هنا",
    newOrder: "طلب جديد",
    createNewOrder: "إنشاء طلب جديد",
    customerDetails: "تفاصيل العميل",
    products: "المنتجات",
    orderSummary: "ملخص الطلب",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    address: "العنوان",
    orderNumber: "رقم الطلب",
    customer: "العميل",
    date: "التاريخ",
    status: "الحالة",
    totalAmount: "المبلغ الإجمالي",
    actions: "الإجراءات",
    searchProducts: "البحث عن المنتجات...",
    exportOrder: "تصدير الطلب",
    createOrder: "إنشاء الطلب",
    completed: "مكتمل",
    cancel: "إلغاء",
  }
};

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  status: string;
  totalAmount: string;
}

const Orders = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      orderNumber: "ORD-2501-0360",
      customer: "Issam",
      date: "28/01/2025",
      status: "Completed",
      totalAmount: "18,726.40 MAD",
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
  });

  return (
    <div className="container py-8 animate-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.description}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t.newOrder}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.createNewOrder}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div>
                <h3 className="font-semibold mb-4">{t.customerDetails}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t.name}</Label>
                    <Input
                      id="name"
                      value={newOrder.customerName}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, customerName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newOrder.email}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">{t.phone}</Label>
                    <Input
                      id="phone"
                      value={newOrder.phone}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">{t.address}</Label>
                    <Input
                      id="address"
                      value={newOrder.address}
                      onChange={(e) =>
                        setNewOrder({ ...newOrder, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">{t.products}</h3>
                <Input 
                  placeholder={t.searchProducts}
                  className="mb-4"
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Stock Code</TableHead>
                      <TableHead>Available Quantity</TableHead>
                      <TableHead>Units per Box</TableHead>
                      <TableHead>Available Boxes</TableHead>
                      <TableHead>Boxes</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>TEST</TableCell>
                      <TableCell>MP122</TableCell>
                      <TableCell>380</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>19</TableCell>
                      <TableCell></TableCell>
                      <TableCell>100 Mad</TableCell>
                      <TableCell>No...</TableCell>
                      <TableCell>Select</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">{t.orderSummary}</h3>
                  <Button variant="outline">
                    {t.exportOrder}
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stock Code</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Boxes</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Total Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Final Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>MP122</TableCell>
                      <TableCell>TEST</TableCell>
                      <TableCell>10</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>200</TableCell>
                      <TableCell>mad 20.00</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>mad 20.00</TableCell>
                      <TableCell>mad 4000.00</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="text-right mt-4">
                  <p className="font-semibold">Total Amount: mad 4000.00</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button className="min-w-[200px]">
                {t.createOrder}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.orderNumber}</TableHead>
              <TableHead>{t.customer}</TableHead>
              <TableHead>{t.date}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead>{t.totalAmount}</TableHead>
              <TableHead>{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t.completed}
                  </span>
                </TableCell>
                <TableCell>{order.totalAmount}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
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

export default Orders;
