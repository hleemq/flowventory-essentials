
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowDown,
  ArrowUp,
  ShoppingCart,
  DollarSign,
  Percent,
  Users,
  BarChart,
  Activity
} from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import CardGrid from "@/components/layout/CardGrid";

const translations = {
  en: {
    dashboardTitle: "Dashboard",
    welcomeMessage: "Welcome back!",
    totalRevenue: "Total Revenue",
    ordersProcessed: "Orders Processed",
    averageOrderValue: "Average Order Value",
    conversionRate: "Conversion Rate",
    revenueGrowth: "Revenue Growth",
    orderCompletionRate: "Order Completion Rate",
    customers: "Customers",
    totalCustomers: "Total Customers",
    newCustomers: "New Customers This Month",
    customerGrowth: "Customer Growth",
  },
  fr: {
    dashboardTitle: "Tableau de bord",
    welcomeMessage: "Bienvenue!",
    totalRevenue: "Revenu Total",
    ordersProcessed: "Commandes Traitées",
    averageOrderValue: "Valeur Moyenne des Commandes",
    conversionRate: "Taux de Conversion",
    revenueGrowth: "Croissance du Revenu",
    orderCompletionRate: "Taux d'Achèvement des Commandes",
    customers: "Clients",
    totalCustomers: "Nombre Total de Clients",
    newCustomers: "Nouveaux Clients ce Mois-ci",
    customerGrowth: "Croissance du Nombre de Clients",
  },
  ar: {
    dashboardTitle: "لوحة التحكم",
    welcomeMessage: "مرحبا بعودتك!",
    totalRevenue: "إجمالي الإيرادات",
    ordersProcessed: "الطلبات المجهزة",
    averageOrderValue: "متوسط قيمة الطلب",
    conversionRate: "معدل التحويل",
    revenueGrowth: "نمو الإيرادات",
    orderCompletionRate: "معدل إكمال الطلب",
    customers: "العملاء",
    totalCustomers: "إجمالي عدد العملاء",
    newCustomers: "عملاء جدد هذا الشهر",
    customerGrowth: "نمو عدد العملاء",
  },
};

interface DashboardData {
  total_revenue: number;
  orders_processed: number;
  average_order_value: number;
  conversion_rate: number;
  revenue_growth: number;
  order_completion_rate: number;
  total_customers: number;
  new_customers: number;
  customer_growth: number;
}

const fetchDashboardData = async () => {
  try {
    // Use the custom function instead of raw
    const { data: summaryData, error: summaryError } = await supabase
      .from('organization_summary')
      .select('*')
      .single();

    if (summaryError) {
      console.error('Error fetching summary data:', summaryError);
      return null;
    }

    const {
      total_revenue = 0,
      orders_processed = 0,
      average_order_value = 0,
      conversion_rate = 0,
      revenue_growth = 0,
      order_completion_rate = 0,
      total_customers = 0,
      new_customers = 0,
      customer_growth = 0,
    } = summaryData || {};

    return {
      total_revenue,
      orders_processed,
      average_order_value,
      conversion_rate,
      revenue_growth,
      order_completion_rate,
      total_customers,
      new_customers,
      customer_growth,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <PageContainer><div>Loading dashboard data...</div></PageContainer>;
  }

  if (error) {
    return <PageContainer><div>Error: {error}</div></PageContainer>;
  }

  return (
    <PageContainer>
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">{t.dashboardTitle}</h1>
        <p className="text-muted-foreground">
          {t.welcomeMessage} {user?.email}
        </p>
      </div>

      <CardGrid columns={4} gap="md">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.total_revenue || 0, "MAD", language)}
            </div>
            <p className="text-sm text-muted-foreground">
              {t.revenueGrowth}:{" "}
              {dashboardData?.revenue_growth > 0 ? (
                <>
                  <ArrowUp className="h-4 w-4 text-green-500 inline-block" />
                  {dashboardData?.revenue_growth}%
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4 text-red-500 inline-block" />
                  {dashboardData?.revenue_growth}%
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.ordersProcessed}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.orders_processed}
            </div>
            <p className="text-sm text-muted-foreground">
              {t.orderCompletionRate}: {dashboardData?.order_completion_rate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.averageOrderValue}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.average_order_value || 0, "MAD", language)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.conversionRate}</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.conversion_rate}%
            </div>
          </CardContent>
        </Card>
      </CardGrid>

      <CardGrid columns={2} gap="md" className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t.customers}
            </CardTitle>
            <CardDescription>{t.totalCustomers}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.total_customers}
            </div>
            <p className="text-sm text-muted-foreground">
              {t.newCustomers}: {dashboardData?.new_customers}
            </p>
            <p className="text-sm text-muted-foreground">
              {t.customerGrowth}: {dashboardData?.customer_growth}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              {t.revenueGrowth}
            </CardTitle>
            <CardDescription>Monthly analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold flex items-center">
                {dashboardData?.revenue_growth > 0 ? (
                  <>
                    <ArrowUp className="h-5 w-5 text-green-500 mr-1" />
                    {dashboardData?.revenue_growth}%
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-5 w-5 text-red-500 mr-1" />
                    {Math.abs(dashboardData?.revenue_growth || 0)}%
                  </>
                )}
              </div>
              <div className="h-10 flex items-end gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div 
                    key={i} 
                    className="w-3 bg-primary/60 rounded-t"
                    style={{ height: `${20 + Math.random() * 50}%` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </CardGrid>
    </PageContainer>
  );
};

export default Dashboard;
