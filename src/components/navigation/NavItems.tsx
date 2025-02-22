
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, List, Warehouse, ShoppingCart, Users, Settings } from "lucide-react";
import { useState } from "react";

type NavItemsProps = {
  translations: {
    dashboard: string;
    inventory: string;
    items: string;
    warehouses: string;
    orders: string;
    customers: string;
    settings: string;
  };
  onItemClick?: () => void;
};

const NavItems = ({ translations: t, onItemClick }: NavItemsProps) => {
  const location = useLocation();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const isInventoryActive = location.pathname.startsWith('/inventory');

  return (
    <>
      <Button
        variant={location.pathname === "/dashboard" ? "default" : "ghost"}
        asChild
        className="w-full justify-start gap-2"
        onClick={onItemClick}
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
            onClick={onItemClick}
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
            onClick={onItemClick}
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
        onClick={onItemClick}
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
        onClick={onItemClick}
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
        onClick={onItemClick}
      >
        <Link to="/settings">
          <Settings className="h-4 w-4" />
          {t.settings}
        </Link>
      </Button>
    </>
  );
};

export default NavItems;
