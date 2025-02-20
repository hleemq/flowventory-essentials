
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./ui/button";
import { LogOut, LayoutDashboard, Package, Globe, ShoppingCart, Users, Settings, List, Warehouse } from "lucide-react";

const translations = {
  en: {
    dashboard: "Dashboard",
    inventory: "Inventory",
    items: "Items",
    warehouses: "Warehouses",
    orders: "Orders",
    customers: "Customers",
    settings: "Settings",
    logout: "Logout",
    switchLanguage: "Switch Language"
  },
  fr: {
    dashboard: "Tableau de bord",
    inventory: "Inventaire",
    items: "Articles",
    warehouses: "Entrepôts",
    orders: "Commandes",
    customers: "Clients",
    settings: "Paramètres",
    logout: "Déconnexion",
    switchLanguage: "Changer de langue"
  },
  ar: {
    dashboard: "لوحة التحكم",
    inventory: "المخزون",
    items: "العناصر",
    warehouses: "المستودعات",
    orders: "الطلبات",
    customers: "العملاء",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    switchLanguage: "تغيير اللغة"
  }
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const t = translations[language];

  const handleLanguageSwitch = () => {
    const langs: ("en" | "fr" | "ar")[] = ["en", "fr", "ar"];
    const currentIndex = langs.indexOf(language);
    const nextIndex = (currentIndex + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const isInventoryActive = location.pathname.startsWith('/inventory');
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container flex h-16 items-center gap-4 px-4">
          <div className="flex gap-1 md:gap-2">
            <Button
              variant={location.pathname === "/dashboard" ? "default" : "ghost"}
              asChild
              className="gap-2"
            >
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                {t.dashboard}
              </Link>
            </Button>
            
            {/* Inventory Section with Subsections */}
            <div className="relative group">
              <Button
                variant={isInventoryActive ? "default" : "ghost"}
                asChild
                className="gap-2"
              >
                <Link to="/inventory">
                  <Package className="h-4 w-4" />
                  {t.inventory}
                </Link>
              </Button>
              <div className="absolute left-0 hidden group-hover:block min-w-[150px] p-2 mt-1 bg-popover rounded-md shadow-lg border">
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start gap-2 mb-1"
                >
                  <Link to="/inventory/items">
                    <List className="h-4 w-4" />
                    {t.items}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start gap-2"
                >
                  <Link to="/inventory/warehouses">
                    <Warehouse className="h-4 w-4" />
                    {t.warehouses}
                  </Link>
                </Button>
              </div>
            </div>

            <Button
              variant={location.pathname === "/orders" ? "default" : "ghost"}
              asChild
              className="gap-2"
            >
              <Link to="/orders">
                <ShoppingCart className="h-4 w-4" />
                {t.orders}
              </Link>
            </Button>

            <Button
              variant={location.pathname === "/customers" ? "default" : "ghost"}
              asChild
              className="gap-2"
            >
              <Link to="/customers">
                <Users className="h-4 w-4" />
                {t.customers}
              </Link>
            </Button>

            <Button
              variant={location.pathname === "/settings" ? "default" : "ghost"}
              asChild
              className="gap-2"
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                {t.settings}
              </Link>
            </Button>
          </div>
          <div className="flex-1" />
          <Button
            variant="ghost"
            className="gap-2"
            onClick={handleLanguageSwitch}
          >
            <Globe className="h-4 w-4" />
            {t.switchLanguage}
          </Button>
          <Button
            variant="ghost"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {t.logout}
          </Button>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
