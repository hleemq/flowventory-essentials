
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag } from "lucide-react";

const translations = {
  en: {
    title: "Products",
    description: "Manage your product catalog",
    noProducts: "No products found",
    addProduct: "Add Product"
  },
  fr: {
    title: "Produits",
    description: "Gérez votre catalogue de produits",
    noProducts: "Aucun produit trouvé",
    addProduct: "Ajouter un produit"
  },
  ar: {
    title: "المنتجات",
    description: "إدارة كتالوج المنتجات الخاص بك",
    noProducts: "لم يتم العثور على منتجات",
    addProduct: "إضافة منتج"
  }
};

const Products = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t.addProduct}
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">{t.description}</p>
      
      <Card className="p-6 flex flex-col items-center justify-center py-20">
        <div className="bg-muted/50 p-6 rounded-full mb-4">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-center">{t.noProducts}</p>
        <Button className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          {t.addProduct}
        </Button>
      </Card>
    </PageContainer>
  );
};

export default Products;
