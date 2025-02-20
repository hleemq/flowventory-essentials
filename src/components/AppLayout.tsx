
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./ui/button";
import { LogOut, LayoutDashboard, Package, Globe } from "lucide-react";

const translations = {
  en: {
    dashboard: "Dashboard",
    products: "Products",
    logout: "Logout",
    switchLanguage: "Switch Language"
  },
  fr: {
    dashboard: "Tableau de bord",
    products: "Produits",
    logout: "Déconnexion",
    switchLanguage: "Changer de langue"
  },
  ar: {
    dashboard: "لوحة التحكم",
    products: "المنتجات",
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
            <Button
              variant={location.pathname === "/products" ? "default" : "ghost"}
              asChild
              className="gap-2"
            >
              <Link to="/products">
                <Package className="h-4 w-4" />
                {t.products}
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
