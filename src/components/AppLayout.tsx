
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogOut, LayoutDashboard, Package, Globe, ShoppingCart, Users, Settings, List, Warehouse, Menu } from "lucide-react";
import { useState } from "react";
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
  const location = useLocation();
  const t = translations[language];
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSwitch = () => {
    const langs: ("en" | "fr" | "ar")[] = ["en", "fr", "ar"];
    const currentIndex = langs.indexOf(language);
    const nextIndex = (currentIndex + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const isInventoryActive = location.pathname.startsWith('/inventory');

  const NavItems = () => (
    <>
      <Button
        variant={location.pathname === "/dashboard" ? "default" : "ghost"}
        asChild
        className="w-full justify-start gap-2"
        onClick={() => setIsOpen(false)}
      >
        <Link to="/dashboard">
          <LayoutDashboard className="h-4 w-4" />
          {t.dashboard}
        </Link>
      </Button>

      <div className="relative">
        <Button
          variant={isInventoryActive ? "default" : "ghost"}
          className="w-full justify-start gap-2"
          onClick={() => setIsInventoryOpen(!isInventoryOpen)}
        >
          <Package className="h-4 w-4" />
          {t.inventory}
        </Button>
        <div className={`${isInventoryOpen ? "block" : "hidden"} space-y-1 mt-1 ml-4`}>
          <Button
            variant="ghost"
            asChild
            className="w-full justify-start gap-2"
            onClick={() => setIsOpen(false)}
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
            onClick={() => setIsOpen(false)}
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
        className="w-full justify-start gap-2"
        onClick={() => setIsOpen(false)}
      >
        <Link to="/orders">
          <ShoppingCart className="h-4 w-4" />
          {t.orders}
        </Link>
      </Button>

      <Button
        variant={location.pathname === "/customers" ? "default" : "ghost"}
        asChild
        className="w-full justify-start gap-2"
        onClick={() => setIsOpen(false)}
      >
        <Link to="/customers">
          <Users className="h-4 w-4" />
          {t.customers}
        </Link>
      </Button>

      <Button
        variant={location.pathname === "/settings" ? "default" : "ghost"}
        asChild
        className="w-full justify-start gap-2"
        onClick={() => setIsOpen(false)}
      >
        <Link to="/settings">
          <Settings className="h-4 w-4" />
          {t.settings}
        </Link>
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container flex h-16 items-center gap-4 px-4">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t.menu}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader className="mb-4">
                  <SheetTitle>{t.menu}</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2">
                  <NavItems />
                  <div className="mt-auto pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <Notifications />
                      <Button
                        variant="ghost"
                        className="gap-2"
                        onClick={handleLanguageSwitch}
                      >
                        <Globe className="h-4 w-4" />
                        {t.switchLanguage}
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      {t.logout}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1 md:gap-2">
            <NavItems />
          </div>
          
          <div className="flex-1" />
          
          {/* Desktop Actions */}
          <div className="hidden md:flex gap-2 items-center">
            <Notifications />
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
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
