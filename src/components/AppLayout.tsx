
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./ui/button";
import { Globe, LogOut } from "lucide-react";
import { useState } from "react";
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
    menu: "Menu"
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
    menu: "Menu"
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
    menu: "القائمة"
  }
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSwitch = () => {
    const langs: ("en" | "fr" | "ar")[] = ["en", "fr", "ar"];
    const currentIndex = langs.indexOf(language);
    const nextIndex = (currentIndex + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

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
            <Notifications />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLanguageSwitch}
              className="relative"
              title={t.switchLanguage}
            >
              <Globe className="h-4 w-4" />
              <span className="absolute -bottom-1 right-0 text-[10px] font-medium">
                {language.toUpperCase()}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={logout}
              title={t.logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
