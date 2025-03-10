
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supportedCurrencies } from "@/integrations/supabase/client";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Dashboard",
    totalProducts: "Total Products",
    lowStock: "Low Stock Items",
    totalOrders: "Total Orders",
    revenue: "Revenue",
    recentActivity: "Recent Activity",
    loadingData: "Loading data...",
    errorLoadingData: "Error loading data",
    noData: "No data available",
    salesOverTime: "Sales Over Time"
  },
  fr: {
    title: "Tableau de bord",
    totalProducts: "Total des produits",
    lowStock: "Articles en stock bas",
    totalOrders: "Total des commandes",
    revenue: "Revenu",
    recentActivity: "Activité récente",
    loadingData: "Chargement des données...",
    errorLoadingData: "Erreur lors du chargement des données",
    noData: "Aucune donnée disponible",
    salesOverTime: "Ventes au fil du temps"
  },
  ar: {
    title: "لوحة التحكم",
    totalProducts: "إجمالي المنتجات",
    lowStock: "المنتجات منخفضة المخزون",
    totalOrders: "إجمالي الطلبات",
    revenue: "الإيرادات",
    recentActivity: "النشاط الأخير",
    loadingData: "جاري تحميل البيانات...",
    errorLoadingData: "خطأ في تحميل البيانات",
    noData: "لا توجد بيانات متاحة",
    salesOverTime: "المبيعات على مر الزمن"
  }
};

interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  totalOrders: number;
  totalRevenue: number;
  currency: string;
  salesData: Array<{
    name: string;
    value: number;
  }>;
}

const Dashboard = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockCount: 0,
    totalOrders: 0,
    totalRevenue: 0,
    currency: "MAD",
    salesData: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch total products
        const { data: products, error: productsError } = await supabase
          .from('items')
          .select('id')
          .is('deleted_at', null);
        
        if (productsError) throw productsError;
        
        // Fetch low stock items
        const { data: lowStockItems, error: lowStockError } = await supabase
          .from('items')
          .select('id, quantity, low_stock_threshold')
          .is('deleted_at', null)
          .lt('quantity', supabase.raw('low_stock_threshold'));
        
        if (lowStockError) throw lowStockError;
        
        // Fetch orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, total_amount, created_at');
        
        if (ordersError) throw ordersError;
        
        // Get user currency preference or default to MAD
        const { data: settings, error: settingsError } = await supabase
          .from('settings')
          .select('currency')
          .limit(1);
        
        // Generate sales data (by month for this year)
        const salesData = generateSalesData(orders || []);
        
        const totalRevenue = (orders || []).reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        
        setStats({
          totalProducts: products?.length || 0,
          lowStockCount: lowStockItems?.length || 0,
          totalOrders: orders?.length || 0,
          totalRevenue: totalRevenue,
          currency: settings && settings.length > 0 ? settings[0].currency : "MAD",
          salesData: salesData
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError((err as Error).message);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const generateSalesData = (orders: any[]) => {
    if (!orders || orders.length === 0) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Initialize data for all months
    const monthlyData = months.map(month => ({ name: month, value: 0 }));
    
    // Fill in real data where available
    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      if (orderDate.getFullYear() === currentYear) {
        const monthIndex = orderDate.getMonth();
        monthlyData[monthIndex].value += parseFloat(order.total_amount);
      }
    });
    
    return monthlyData;
  };

  const formatCurrency = (value: number) => {
    const currency = supportedCurrencies[stats.currency] || supportedCurrencies.MAD;
    return `${currency.symbol}${value.toLocaleString(language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-MA' : 'en-US')}`;
  };

  return (
    <div className="container py-8 animate-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-muted-foreground">{t.loadingData}</div>
        </div>
      ) : error ? (
        <Card className="p-6">
          <div className="text-center text-red-500">{t.errorLoadingData}: {error}</div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 glass">
              <h3 className="text-lg font-medium text-muted-foreground">{t.totalProducts}</h3>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
            </Card>
            
            <Card className="p-6 glass">
              <h3 className="text-lg font-medium text-muted-foreground">{t.lowStock}</h3>
              <p className="text-3xl font-bold text-warning-dark">{stats.lowStockCount}</p>
            </Card>
            
            <Card className="p-6 glass">
              <h3 className="text-lg font-medium text-muted-foreground">{t.totalOrders}</h3>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
            </Card>
            
            <Card className="p-6 glass">
              <h3 className="text-lg font-medium text-muted-foreground">{t.revenue}</h3>
              <p className="text-3xl font-bold text-success-dark">{formatCurrency(stats.totalRevenue)}</p>
            </Card>
          </div>

          <Card className="p-6 glass">
            <h2 className="text-xl font-semibold mb-4">{t.salesOverTime}</h2>
            {stats.salesData.length === 0 ? (
              <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
                {t.noData}
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), t.revenue]}
                    />
                    <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
