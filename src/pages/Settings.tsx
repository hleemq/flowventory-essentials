
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";

const translations = {
  en: {
    title: "Settings",
    description: "Change currency, backup/restore data, manage account",
  },
  fr: {
    title: "Paramètres",
    description: "Changer la devise, sauvegarder/restaurer les données, gérer le compte",
  },
  ar: {
    title: "الإعدادات",
    description: "تغيير العملة، نسخ احتياطي/استعادة البيانات، إدارة الحساب",
  }
};

const Settings = () => {
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

export default Settings;
