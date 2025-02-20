
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, ArrowRight } from "lucide-react";

const translations = {
  en: {
    welcome: "Welcome to StockFlow",
    subtitle: "Your modern inventory management solution",
    email: "Email",
    password: "Password",
    login: "Login",
    switchLanguage: "Switch Language"
  },
  fr: {
    welcome: "Bienvenue sur StockFlow",
    subtitle: "Votre solution moderne de gestion des stocks",
    email: "Email",
    password: "Mot de passe",
    login: "Connexion",
    switchLanguage: "Changer de langue"
  },
  ar: {
    welcome: "مرحباً بك في ستوك فلو",
    subtitle: "حل إدارة المخزون الحديث الخاص بك",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    switchLanguage: "تغيير اللغة"
  }
};

const Index = () => {
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const t = translations[language];

  const handleLanguageSwitch = () => {
    const langs: ("en" | "fr" | "ar")[] = ["en", "fr", "ar"];
    const currentIndex = langs.indexOf(language);
    const nextIndex = (currentIndex + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <Button
        variant="ghost"
        className="absolute top-4 right-4 gap-2"
        onClick={handleLanguageSwitch}
      >
        <Globe className="h-4 w-4" />
        {t.switchLanguage}
      </Button>

      <div className="w-full max-w-md space-y-8 animate-in slide-up">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t.welcome}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        <Card className="p-6 glass">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass"
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              {t.login}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Index;
