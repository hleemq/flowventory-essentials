
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";

const translations = {
  en: {
    title: "Warehouses",
    description: "Add/edit warehouse name or geolocation",
  },
  fr: {
    title: "Entrepôts",
    description: "Ajouter/modifier le nom ou la géolocalisation de l'entrepôt",
  },
  ar: {
    title: "المستودعات",
    description: "إضافة/تعديل اسم المستودع أو الموقع الجغرافي",
  }
};

const Warehouses = () => {
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

export default Warehouses;
