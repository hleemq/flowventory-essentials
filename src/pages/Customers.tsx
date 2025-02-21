
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pen, Trash2 } from "lucide-react";
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
    title: "Customers",
    description: "Manage your customers here",
    addCustomer: "Add Customer",
    addNewCustomer: "Add New Customer",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    totalOrders: "Total Orders",
    lastOrder: "Last Order",
    totalAmount: "Total Amount",
    status: "Status",
    actions: "Actions",
    cancel: "Cancel",
  },
  fr: {
    title: "Clients",
    description: "Gérez vos clients ici",
    addCustomer: "Ajouter un client",
    addNewCustomer: "Ajouter un nouveau client",
    name: "Nom",
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    totalOrders: "Total des commandes",
    lastOrder: "Dernière commande",
    totalAmount: "Montant total",
    status: "Statut",
    actions: "Actions",
    cancel: "Annuler",
  },
  ar: {
    title: "العملاء",
    description: "إدارة عملائك هنا",
    addCustomer: "إضافة عميل",
    addNewCustomer: "إضافة عميل جديد",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    address: "العنوان",
    totalOrders: "إجمالي الطلبات",
    lastOrder: "آخر طلب",
    totalAmount: "المبلغ الإجمالي",
    status: "الحالة",
    actions: "الإجراءات",
    cancel: "إلغاء",
  }
};

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  lastOrder: string;
  totalAmount: string;
  status: string;
}

const Customers = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleAddCustomer = () => {
    const customer: Customer = {
      id: Math.random().toString(36).slice(2),
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      totalOrders: 0,
      lastOrder: "-",
      totalAmount: "0 MAD",
      status: "Active",
    };

    setCustomers([...customers, customer]);
    setIsDialogOpen(false);
    setNewCustomer({ name: "", email: "", phone: "", address: "" });
  };

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
              {t.addCustomer}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t.addNewCustomer}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">{t.address}</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleAddCustomer}>{t.addCustomer}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.name}</TableHead>
              <TableHead>{t.email}</TableHead>
              <TableHead>{t.phone}</TableHead>
              <TableHead>{t.totalOrders}</TableHead>
              <TableHead>{t.lastOrder}</TableHead>
              <TableHead>{t.totalAmount}</TableHead>
              <TableHead>{t.status}</TableHead>
              <TableHead>{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.totalOrders}</TableCell>
                <TableCell>{customer.lastOrder}</TableCell>
                <TableCell>{customer.totalAmount}</TableCell>
                <TableCell>{customer.status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
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

export default Customers;
