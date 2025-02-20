
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";

const translations = {
  en: {
    title: "Products",
    noProducts: "No products found",
  },
  fr: {
    title: "Produits",
    noProducts: "Aucun produit trouvé",
  },
  ar: {
    title: "المنتجات",
    noProducts: "لم يتم العثور على منتجات",
  }
};

const Products = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="container py-8 animate-in">
      <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
      <Card className="p-6 glass">
        <p className="text-muted-foreground text-center">{t.noProducts}</p>
      </Card>
    </div>
  );
};

export default Products;
