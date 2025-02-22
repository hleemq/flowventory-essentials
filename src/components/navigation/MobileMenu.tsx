
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Globe, LogOut } from "lucide-react";
import NavItems from "./NavItems";
import Notifications from "../Notifications";

type MobileMenuProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  translations: {
    menu: string;
    switchLanguage: string;
    logout: string;
    [key: string]: string;
  };
  onLanguageSwitch: () => void;
  onLogout: () => void;
};

const MobileMenu = ({
  isOpen,
  onOpenChange,
  translations: t,
  onLanguageSwitch,
  onLogout,
}: MobileMenuProps) => {
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
              <Notifications />
              <Button
                variant="ghost"
                className="gap-2"
                onClick={onLanguageSwitch}
              >
                <Globe className="h-4 w-4" />
                {t.switchLanguage}
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => {
                onOpenChange(false);
                onLogout();
              }}
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
