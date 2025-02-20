
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";

const translations = {
  en: {
    title: "Items",
    description: "Add/edit items, scan barcodes, view low-stock alerts",
  },
  fr: {
    title: "Articles",
    description: "Ajouter/modifier des articles, scanner des codes-barres, voir les alertes de stock bas",
  },
  ar: {
    title: "العناصر",
    description: "إضافة/تعديل العناصر، مسح الباركود، عرض تنبيهات المخزون المنخفض",
  }
};

const Items = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="container py-8 animate-in">
      <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
      <Card className="p-6">
        <p className="text-muted-foreground">{t.description}</p>
      </Card>
    </div>
  );
};

export default Items;
