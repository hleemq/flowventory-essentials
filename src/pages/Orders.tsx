
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";

const translations = {
  en: {
    title: "Orders",
    description: "Create orders, view details, generate PDF invoices",
  },
  fr: {
    title: "Commandes",
    description: "Créer des commandes, voir les détails, générer des factures PDF",
  },
  ar: {
    title: "الطلبات",
    description: "إنشاء الطلبات، عرض التفاصيل، إنشاء فواتير PDF",
  }
};

const Orders = () => {
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

export default Orders;
