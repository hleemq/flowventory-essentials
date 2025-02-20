
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const translations = {
  en: {
    title: "Dashboard",
    totalProducts: "Total Products",
    lowStock: "Low Stock Items",
    totalOrders: "Total Orders",
    revenue: "Revenue",
    recentActivity: "Recent Activity",
  },
  fr: {
    title: "Tableau de bord",
    totalProducts: "Total des produits",
    lowStock: "Articles en stock bas",
    totalOrders: "Total des commandes",
    revenue: "Revenu",
    recentActivity: "Activité récente",
  },
  ar: {
    title: "لوحة التحكم",
    totalProducts: "إجمالي المنتجات",
    lowStock: "المنتجات منخفضة المخزون",
    totalOrders: "إجمالي الطلبات",
    revenue: "الإيرادات",
    recentActivity: "النشاط الأخير",
  }
};

const mockData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 700 },
];

const Dashboard = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="container py-8 animate-in">
      <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 glass">
          <h3 className="text-lg font-medium text-muted-foreground">{t.totalProducts}</h3>
          <p className="text-3xl font-bold">1,234</p>
        </Card>
        
        <Card className="p-6 glass">
          <h3 className="text-lg font-medium text-muted-foreground">{t.lowStock}</h3>
          <p className="text-3xl font-bold text-warning-dark">23</p>
        </Card>
        
        <Card className="p-6 glass">
          <h3 className="text-lg font-medium text-muted-foreground">{t.totalOrders}</h3>
          <p className="text-3xl font-bold">567</p>
        </Card>
        
        <Card className="p-6 glass">
          <h3 className="text-lg font-medium text-muted-foreground">{t.revenue}</h3>
          <p className="text-3xl font-bold text-success-dark">$12,345</p>
        </Card>
      </div>

      <Card className="p-6 glass">
        <h2 className="text-xl font-semibold mb-4">{t.recentActivity}</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
