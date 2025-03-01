import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pen, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
    processing: "Processing",
    pending: "Pending",
    cancelled: "Cancelled",
    cancel: "Cancel",
    noOrders: "No orders found. Click 'New Order' to create your first order.",
    viewOrder: "View Order",
    editOrder: "Edit Order",
    deleteOrder: "Delete Order",
    confirmDelete: "Are you sure you want to delete this order?",
    selectCustomer: "Select a customer",
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
    processing: "En cours",
    pending: "En attente",
    cancelled: "Annulée",
    cancel: "Annuler",
    noOrders: "Aucune commande trouvée. Cliquez sur 'Nouvelle commande' pour créer votre première commande.",
    viewOrder: "Voir la commande",
    editOrder: "Modifier la commande",
    deleteOrder: "Supprimer la commande",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cette commande?",
    selectCustomer: "Sélectionner un client",
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
    processing: "قيد المعالجة",
    pending: "قيد الانتظار",
    cancelled: "ملغى",
    cancel: "إلغاء",
    noOrders: "لم يتم العثور على طلبات. انقر على 'طلب جديد' لإنشاء طلبك الأول.",
    viewOrder: "عرض الطلب",
    editOrder: "تعديل الطلب",
    deleteOrder: "حذف الطلب",
    confirmDelete: "هل أنت متأكد من رغبتك في حذف هذا الطلب؟",
    selectCustomer: "اختر عميل",
  }
};

interface OrderResponse {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer: {
    id: string;
    name: string;
  } | null;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer: {
    id: string;
    name: string;
  } | null;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  units_per_box: number;
  selling_price: number;
}

interface OrderItem {
  id: string;
  product: Product;
  boxes: number;
  units: number;
  price: number;
  discount: number;
  totalPrice: number;
}

const Orders = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [newOrder, setNewOrder] = useState({
    customerId: "",
    items: [] as OrderItem[],
    totalAmount: 0,
  });

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
    fetchProducts();

    const ordersChannel = supabase
      .channel('orders-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order update received:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    const orderItemsChannel = supabase
      .channel('order-items-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        (payload) => {
          console.log('Order item update received:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    const customersChannel = supabase
      .channel('customers-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          console.log('Customer update received:', payload);
          fetchCustomers();
        }
      )
      .subscribe();

    const productsChannel = supabase
      .channel('products-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items'
        },
        (payload) => {
          console.log('Product update received:', payload);
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(orderItemsChannel);
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching orders...");
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          customer:customers!orders_customer_id_fkey (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
      
      console.log("Fetched orders:", data);
      
      const formattedOrders: Order[] = (data || []).map(order => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total_amount: order.total_amount,
        customer: order.customer
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      console.log("Fetching customers...");
      const { data, error } = await supabase
        .from('customers')
        .select('*');
      
      if (error) throw error;
      console.log("Fetched customers:", data);
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error("Failed to fetch customers");
    }
  };

  const fetchProducts = async () => {
    try {
      console.log("Fetching products...");
      const { data, error } = await supabase
        .from('items')
        .select('id, name, sku, quantity, units_per_box, selling_price')
        .gt('quantity', 0);
      
      if (error) throw error;
      console.log("Fetched products:", data);
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error("Failed to fetch products");
    }
  };

  const handleCreateOrder = async () => {
    try {
      if (!newOrder.customerId) {
        toast.error("Please select a customer");
        return;
      }

      if (newOrder.items.length === 0) {
        toast.error("Please add at least one item to the order");
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_id: newOrder.customerId,
            total_amount: newOrder.totalAmount,
            status: 'Pending'
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsToInsert = newOrder.items.map(item => ({
        order_id: orderData.id,
        item_id: item.product.id,
        quantity: (item.boxes * item.product.units_per_box) + item.units,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      setIsDialogOpen(false);
      setNewOrder({
        customerId: "",
        items: [],
        totalAmount: 0,
      });
      
      toast.success("Order created successfully");
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Failed to create order: " + (error as Error).message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const { error: deleteItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (deleteItemsError) throw deleteItemsError;

      const { error: deleteOrderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (deleteOrderError) throw deleteOrderError;

      toast.success("Order deleted successfully");
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error("Failed to delete order");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'MAD',
    }).format(amount);
  };

  const getStatusBadgeClasses = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'processing':
        return "bg-blue-100 text-blue-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return t.completed;
      case 'processing':
        return t.processing;
      case 'pending':
        return t.pending;
      case 'cancelled':
        return t.cancelled;
      default:
        return status;
    }
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
              {t.newOrder}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.createNewOrder}</DialogTitle>
              <DialogDescription>
                Select a customer and add products to create a new order.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div>
                <h3 className="font-semibold mb-4">{t.customerDetails}</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer">{t.customer}</Label>
                    <select
                      id="customer"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      value={newOrder.customerId}
                      onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
                    >
                      <option value="">{t.selectCustomer}</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
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
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No products available. Add products first in the Items section.
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>{product.units_per_box}</TableCell>
                          <TableCell>{Math.floor(product.quantity / product.units_per_box)}</TableCell>
                          <TableCell>{formatCurrency(product.selling_price)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                if (!newOrder.items.some(item => item.product.id === product.id)) {
                                  const newItem: OrderItem = {
                                    id: `temp-${Date.now()}`,
                                    product: product,
                                    boxes: 1,
                                    units: 0,
                                    price: product.selling_price,
                                    discount: 0,
                                    totalPrice: product.selling_price * product.units_per_box
                                  };
                                  
                                  setNewOrder({
                                    ...newOrder,
                                    items: [...newOrder.items, newItem],
                                    totalAmount: newOrder.totalAmount + newItem.totalPrice
                                  });
                                } else {
                                  toast.info("Product already added to the order");
                                }
                              }}
                            >
                              Add to Order
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {newOrder.items.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">{t.orderSummary}</h3>
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
                      {newOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product.sku}</TableCell>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              min="0"
                              max={Math.floor(item.product.quantity / item.product.units_per_box)}
                              value={item.boxes}
                              onChange={(e) => {
                                const boxes = Number(e.target.value);
                                const totalQty = (boxes * item.product.units_per_box) + item.units;
                                const totalPrice = item.price * totalQty * (1 - item.discount / 100);
                                
                                const updatedItems = newOrder.items.map(i => 
                                  i.id === item.id 
                                    ? { ...i, boxes, totalPrice } 
                                    : i
                                );
                                
                                setNewOrder({
                                  ...newOrder,
                                  items: updatedItems,
                                  totalAmount: updatedItems.reduce((sum, i) => sum + i.totalPrice, 0)
                                });
                              }}
                              className="w-16 text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              min="0"
                              max={item.product.units_per_box - 1}
                              value={item.units}
                              onChange={(e) => {
                                const units = Number(e.target.value);
                                const totalQty = (item.boxes * item.product.units_per_box) + units;
                                const totalPrice = item.price * totalQty * (1 - item.discount / 100);
                                
                                const updatedItems = newOrder.items.map(i => 
                                  i.id === item.id 
                                    ? { ...i, units, totalPrice } 
                                    : i
                                );
                                
                                setNewOrder({
                                  ...newOrder,
                                  items: updatedItems,
                                  totalAmount: updatedItems.reduce((sum, i) => sum + i.totalPrice, 0)
                                });
                              }}
                              className="w-16 text-center"
                            />
                          </TableCell>
                          <TableCell>{(item.boxes * item.product.units_per_box) + item.units}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              min="0"
                              max="100"
                              value={item.discount}
                              onChange={(e) => {
                                const discount = Number(e.target.value);
                                const totalQty = (item.boxes * item.product.units_per_box) + item.units;
                                const totalPrice = item.price * totalQty * (1 - discount / 100);
                                
                                const updatedItems = newOrder.items.map(i => 
                                  i.id === item.id 
                                    ? { ...i, discount, totalPrice } 
                                    : i
                                );
                                
                                setNewOrder({
                                  ...newOrder,
                                  items: updatedItems,
                                  totalAmount: updatedItems.reduce((sum, i) => sum + i.totalPrice, 0)
                                });
                              }}
                              className="w-16 text-center"
                            />
                          </TableCell>
                          <TableCell>{formatCurrency(item.price * (1 - item.discount / 100))}</TableCell>
                          <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => {
                                const updatedItems = newOrder.items.filter(i => i.id !== item.id);
                                setNewOrder({
                                  ...newOrder,
                                  items: updatedItems,
                                  totalAmount: updatedItems.reduce((sum, i) => sum + i.totalPrice, 0)
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="text-right mt-4">
                    <p className="font-semibold">{t.totalAmount}: {formatCurrency(newOrder.totalAmount)}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button 
                className="min-w-[200px]" 
                onClick={handleCreateOrder}
                disabled={!newOrder.customerId || newOrder.items.length === 0}
              >
                {t.createOrder}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {t.noOrders}
                </TableCell>
              </TableRow>
            ) : (
              orders
                .filter(order => 
                  (order.customer?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
                )
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>ORD-{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.customer?.name || "Unknown Customer"}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" title={t.viewOrder}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t.editOrder}>
                          <Pen className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500"
                          title={t.deleteOrder}
                          onClick={() => {
                            if (confirm(t.confirmDelete)) {
                              handleDeleteOrder(order.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Orders;
