
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import PageContainer from "@/components/layout/PageContainer";
import CardGrid from "@/components/layout/CardGrid";
import { Button } from "@/components/ui/button";
import { Package, Boxes, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";

const translations = {
  en: {
    title: "Inventory Overview",
    description: "Manage your items and warehouses",
    itemsCard: "Items",
    itemsDescription: "Manage your products and stock levels",
    warehousesCard: "Warehouses",
    warehousesDescription: "Manage storage locations",
    viewAll: "View All",
    manageItems: "Manage Items",
    manageWarehouses: "Manage Warehouses"
  },
  fr: {
    title: "Vue d'ensemble de l'inventaire",
    description: "Gérez vos articles et entrepôts",
    itemsCard: "Articles",
    itemsDescription: "Gérer vos produits et niveaux de stock",
    warehousesCard: "Entrepôts",
    warehousesDescription: "Gérer les emplacements de stockage",
    viewAll: "Voir tout",
    manageItems: "Gérer les articles",
    manageWarehouses: "Gérer les entrepôts"
  },
  ar: {
    title: "نظرة عامة على المخزون",
    description: "إدارة العناصر والمستودعات",
    itemsCard: "العناصر",
    itemsDescription: "إدارة المنتجات ومستويات المخزون",
    warehousesCard: "المستودعات",
    warehousesDescription: "إدارة مواقع التخزين",
    viewAll: "عرض الكل",
    manageItems: "إدارة العناصر",
    manageWarehouses: "إدارة المستودعات"
  }
};

const Inventory = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();

  return (
    <PageContainer>
      <h1 className="text-4xl font-bold mb-2">{t.title}</h1>
      <p className="text-muted-foreground mb-8">{t.description}</p>
      
      <CardGrid columns={2} gap="lg">
        <Card className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{t.itemsCard}</h2>
          </div>
          <p className="text-muted-foreground mb-6 flex-grow">{t.itemsDescription}</p>
          <Button onClick={() => navigate('/items')} className="w-full">
            <Package className="mr-2 h-4 w-4" />
            {t.manageItems}
          </Button>
        </Card>
        
        <Card className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Warehouse className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{t.warehousesCard}</h2>
          </div>
          <p className="text-muted-foreground mb-6 flex-grow">{t.warehousesDescription}</p>
          <Button onClick={() => navigate('/warehouses')} className="w-full">
            <Warehouse className="mr-2 h-4 w-4" />
            {t.manageWarehouses}
          </Button>
        </Card>
      </CardGrid>
    </PageContainer>
  );
};

export default Inventory;
