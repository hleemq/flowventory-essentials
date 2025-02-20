
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";

const translations = {
  en: {
    title: "Inventory Overview",
    description: "Manage your items and warehouses",
  },
  fr: {
    title: "Vue d'ensemble de l'inventaire",
    description: "Gérez vos articles et entrepôts",
  },
  ar: {
    title: "نظرة عامة على المخزون",
    description: "إدارة العناصر والمستودعات",
  }
};

const Inventory = () => {
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

export default Inventory;
