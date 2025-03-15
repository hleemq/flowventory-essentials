
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import PageContainer from "@/components/layout/PageContainer";
import CardGrid from "@/components/layout/CardGrid";
import { Package, Truck, Clock, ArrowUpRight } from "lucide-react";

const translations = {
  en: {
    title: "Orders",
    description: "Manage and track your customer orders",
    newOrder: "New Order",
    filterOrders: "Filter Orders",
    pendingOrders: "Pending Orders",
    completedOrders: "Completed Orders",
    viewAll: "View All",
    status: "Status",
    created: "Created",
    amount: "Amount",
    viewOrder: "View Details",
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered"
  },
  fr: {
    title: "Commandes",
    description: "Gérer et suivre les commandes de vos clients",
    newOrder: "Nouvelle Commande",
    filterOrders: "Filtrer les Commandes",
    pendingOrders: "Commandes en Attente",
    completedOrders: "Commandes Terminées",
    viewAll: "Voir Tout",
    status: "Statut",
    created: "Créée le",
    amount: "Montant",
    viewOrder: "Voir Détails",
    pending: "En attente",
    processing: "En traitement",
    shipped: "Expédiée",
    delivered: "Livrée"
  },
  ar: {
    title: "الطلبات",
    description: "إدارة وتتبع طلبات العملاء",
    newOrder: "طلب جديد",
    filterOrders: "تصفية الطلبات",
    pendingOrders: "الطلبات المعلقة",
    completedOrders: "الطلبات المكتملة",
    viewAll: "عرض الكل",
    status: "الحالة",
    created: "تم الإنشاء",
    amount: "المبلغ",
    viewOrder: "عرض التفاصيل",
    pending: "قيد الانتظار",
    processing: "قيد المعالجة",
    shipped: "تم الشحن",
    delivered: "تم التسليم"
  }
};

// Mock data for demonstration
const mockOrders = [
  { id: "ORD-001", status: "pending", customer: "Ahmed Hassan", amount: 1250.00, currency: "MAD", date: "2023-09-15T10:30:00Z" },
  { id: "ORD-002", status: "processing", customer: "Marie Dubois", amount: 520.75, currency: "EUR", date: "2023-09-18T15:45:00Z" },
  { id: "ORD-003", status: "shipped", customer: "John Smith", amount: 950.25, currency: "USD", date: "2023-09-20T09:15:00Z" },
  { id: "ORD-004", status: "delivered", customer: "Fatima El Mansouri", amount: 3200.50, currency: "MAD", date: "2023-09-10T14:20:00Z" },
  { id: "ORD-005", status: "pending", customer: "Pierre Martin", amount: 780.30, currency: "EUR", date: "2023-09-22T11:10:00Z" },
  { id: "ORD-006", status: "processing", customer: "Sarah Wilson", amount: 1100.75, currency: "USD", date: "2023-09-21T16:40:00Z" },
];

const Orders = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar";
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-purple-500" />;
      case "delivered":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return t.pending;
      case "processing": return t.processing;
      case "shipped": return t.shipped;
      case "delivered": return t.delivered;
      default: return status;
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "processing": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "shipped": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button className="w-full sm:w-auto">{t.newOrder}</Button>
          <Button variant="outline" className="w-full sm:w-auto">{t.filterOrders}</Button>
        </div>
      </div>
      
      <CardGrid columns={3}>
        {mockOrders.map((order) => (
          <Card key={order.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.id}</CardTitle>
                  <CardDescription>{order.customer}</CardDescription>
                </div>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className={isRTL ? "mr-1" : "ml-1"}>{getStatusText(order.status)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t.created}</p>
                  <p className="font-medium">{formatDate(order.date, language)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.amount}</p>
                  <p className="font-medium">
                    {formatCurrency(order.amount, order.currency as any, language)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 mt-auto">
              <Button variant="outline" className="w-full">
                {t.viewOrder}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardGrid>
    </PageContainer>
  );
};

export default Orders;
