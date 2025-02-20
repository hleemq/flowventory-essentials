
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";

const translations = {
  en: {
    title: "Customers",
    description: "Add/edit customers, view order history",
  },
  fr: {
    title: "Clients",
    description: "Ajouter/modifier des clients, voir l'historique des commandes",
  },
  ar: {
    title: "العملاء",
    description: "إضافة/تعديل العملاء، عرض سجل الطلبات",
  }
};

const Customers = () => {
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

export default Customers;
