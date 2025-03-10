import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pen, Trash2, RefreshCw } from "lucide-react";
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
import { supportedCurrencies } from "@/integrations/supabase/client";

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
    loading: "Loading customers...",
    error: "Error loading customers",
    noCustomers: "No customers found. Add your first customer using the form above.",
    refresh: "Refresh",
    refreshing: "Refreshing...",
    confirmDelete: "Are you sure you want to delete this customer?",
    yes: "Yes, delete",
    no: "No, cancel",
    deleteSuccess: "Customer deleted successfully",
    deleteError: "Error deleting customer",
    addSuccess: "Customer added successfully",
    addError: "Error adding customer",
    update: "Update",
    updateSuccess: "Customer updated successfully",
    updateError: "Error updating customer"
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
    loading: "Chargement des clients...",
    error: "Erreur lors du chargement des clients",
    noCustomers: "Aucun client trouvé. Ajoutez votre premier client à l'aide du formulaire ci-dessus.",
    refresh: "Rafraîchir",
    refreshing: "Rafraîchissement...",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer ce client ?",
    yes: "Oui, supprimer",
    no: "Non, annuler",
    deleteSuccess: "Client supprimé avec succès",
    deleteError: "Erreur lors de la suppression du client",
    addSuccess: "Client ajouté avec succès",
    addError: "Erreur lors de l'ajout du client",
    update: "Mettre à jour",
    updateSuccess: "Client mis à jour avec succès",
    updateError: "Erreur lors de la mise à jour du client"
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
    loading: "جاري تحميل العملاء...",
    error: "خطأ في تحميل العملاء",
    noCustomers: "لم يتم العثور على عملاء. قم بإضافة أول عميل لك باستخدام النموذج أعلاه.",
    refresh: "تحديث",
    refreshing: "جاري التحديث...",
    confirmDelete: "هل أنت متأكد من رغبتك في حذف هذا العميل؟",
    yes: "نعم، احذف",
    no: "لا، إلغاء",
    deleteSuccess: "تم حذف العميل بنجاح",
    deleteError: "خطأ في حذف العميل",
    addSuccess: "تمت إضافة العميل بنجاح",
    addError: "خطأ في إضافة العميل",
    update: "تحديث",
    updateSuccess: "تم تحديث العميل بنجاح",
    updateError: "خطأ في تحديث العميل"
  }
};

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*');
        
      if (customersError) throw customersError;

      const customersWithOrdersData = await Promise.all((customersData || []).map(async (customer) => {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('id, total_amount, created_at')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false });
          
        if (orderError) console.error("Error fetching orders for customer:", orderError);
        
        const orders = orderData || [];
        const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        const lastOrder = orders.length > 0 ? new Date(orders[0].created_at).toLocaleDateString() : "-";
        
        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address || "",
          totalOrders: orders.length,
          lastOrder: lastOrder,
          totalAmount: `${totalAmount} ${customer.currency || "MAD"}`,
          status: "Active"
        };
      }));
      
      setCustomers(customersWithOrdersData);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError((err as Error).message);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const refreshData = () => {
    setIsRefreshing(true);
    fetchCustomers();
  };

  const handleAddOrUpdateCustomer = async () => {
    try {
      if (isEditMode && selectedCustomer) {
        const { error } = await supabase
          .from('customers')
          .update({
            name: newCustomer.name,
            email: newCustomer.email,
            phone: newCustomer.phone,
            address: newCustomer.address
          })
          .eq('id', selectedCustomer.id);
          
        if (error) throw error;
        
        toast.success(t.updateSuccess);
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([
            {
              name: newCustomer.name,
              email: newCustomer.email,
              phone: newCustomer.phone,
              address: newCustomer.address
            }
          ]);
          
        if (error) throw error;
        
        toast.success(t.addSuccess);
      }
      
      setIsDialogOpen(false);
      setNewCustomer({ name: "", email: "", phone: "", address: "" });
      setIsEditMode(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error("Error adding/updating customer:", err);
      toast.error(isEditMode ? t.updateError : t.addError);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', selectedCustomer.id);
        
      if (error) throw error;
      
      toast.success(t.deleteSuccess);
      setIsDeleteConfirmOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
      toast.error(t.deleteError);
    }
  };

  const openAddDialog = () => {
    setNewCustomer({ name: "", email: "", phone: "", address: "" });
    setIsEditMode(false);
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="container py-8 animate-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.description}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? t.refreshing : t.refresh}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                {t.addCustomer}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{isEditMode ? t.addNewCustomer : t.addNewCustomer}</DialogTitle>
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
                <Button onClick={handleAddOrUpdateCustomer}>
                  {isEditMode ? t.update : t.addCustomer}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center p-8">
            <div className="animate-pulse">{t.loading}</div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            {t.error}: {error}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            {t.noCustomers}
          </div>
        ) : (
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
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDeleteClick(customer)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t.confirmDelete}</h2>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                {t.no}
              </Button>
              <Button variant="destructive" onClick={handleDeleteCustomer}>
                {t.yes}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
