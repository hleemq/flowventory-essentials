
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Languages, LogOutIcon, RefreshCw } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NavItems from "./NavItems";
import Notifications from "../Notifications";

type MobileMenuProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  translations: {
    dashboard: string;
    inventory: string;
    items: string;
    warehouses: string;
    orders: string;
    customers: string;
    settings: string;
    menu: string;
    switchLanguage: string;
    logout: string;
    refresh: string;
  };
  onLanguageSwitch: () => void;
  onLogout: () => void;
  currentLanguage: string;
};

const MobileMenu = ({
  isOpen,
  onOpenChange,
  translations: t,
  onLanguageSwitch,
  onLogout,
  currentLanguage,
}: MobileMenuProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const refreshCurrentPage = () => {
    // Force a re-render of the current page without a full page reload
    const currentPath = location.pathname;
    navigate('/', { replace: true });
    setTimeout(() => {
      navigate(currentPath, { replace: true });
    }, 10);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
          <NavItems 
            translations={t} 
            onItemClick={() => onOpenChange(false)} 
          />
          <div className="mt-auto pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshCurrentPage}
                title={t.refresh}
              >
                <RefreshCw className="h-5 w-5 transition-transform hover:rotate-180" />
              </Button>
              <Notifications />
              <Button
                variant="ghost"
                size="icon"
                onClick={onLanguageSwitch}
                title={t.switchLanguage}
                className="relative group"
              >
                <Languages className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="absolute -bottom-1 right-0 text-[10px] font-medium bg-primary text-primary-foreground rounded-full px-1">
                  {currentLanguage.toUpperCase()}
                </span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-full justify-start text-destructive hover:text-destructive group"
              onClick={() => {
                onOpenChange(false);
                onLogout();
              }}
              title={t.logout}
            >
              <LogOutIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
