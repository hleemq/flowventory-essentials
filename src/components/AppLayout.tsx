
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./ui/button";
import { Languages, RefreshCw, LogOutIcon } from "lucide-react";
import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavItems from "./navigation/NavItems";
import MobileMenu from "./navigation/MobileMenu";
import Notifications from "./Notifications";

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
    switchLanguage: "Switch Language",
    menu: "Menu",
    refresh: "Refresh Page"
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
    switchLanguage: "Changer de langue",
    menu: "Menu",
    refresh: "Actualiser la page"
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
    switchLanguage: "تغيير اللغة",
    menu: "القائمة",
    refresh: "تحديث الصفحة"
  }
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageSwitch = () => {
    const langs: ("en" | "fr" | "ar")[] = ["en", "fr", "ar"];
    const currentIndex = langs.indexOf(language);
    const nextIndex = (currentIndex + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const refreshCurrentPage = useCallback(() => {
    // Force a re-render of the current page without a full page reload
    const currentPath = location.pathname;
    navigate('/', { replace: true });
    setTimeout(() => {
      navigate(currentPath, { replace: true });
    }, 10);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container flex h-16 items-center gap-4 px-4">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <MobileMenu
              isOpen={isOpen}
              onOpenChange={setIsOpen}
              translations={t}
              onLanguageSwitch={handleLanguageSwitch}
              onLogout={logout}
              currentLanguage={language}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1 md:gap-2">
            <NavItems translations={t} />
          </div>
          
          <div className="flex-1" />
          
          {/* Desktop Actions */}
          <div className="hidden md:flex gap-2 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshCurrentPage}
              className="relative group"
              title={t.refresh}
            >
              <RefreshCw className="h-5 w-5 transition-transform group-hover:rotate-180" />
            </Button>
            <Notifications />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLanguageSwitch}
              className="relative group"
              title={t.switchLanguage}
            >
              <Languages className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="absolute -bottom-1 right-0 text-[10px] font-medium bg-primary text-primary-foreground rounded-full px-1">
                {language.toUpperCase()}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive group"
              onClick={logout}
              title={t.logout}
            >
              <LogOutIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
            </Button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
