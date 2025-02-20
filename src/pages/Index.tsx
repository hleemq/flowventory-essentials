
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, ArrowRight, UserPlus } from "lucide-react";

const translations = {
  en: {
    welcome: "Welcome to StockFlow",
    subtitle: "Your modern inventory management solution",
    email: "Email",
    password: "Password",
    login: "Login",
    signup: "Sign Up",
    or: "or",
    switchLanguage: "Switch Language"
  },
  fr: {
    welcome: "Bienvenue sur StockFlow",
    subtitle: "Votre solution moderne de gestion des stocks",
    email: "Email",
    password: "Mot de passe",
    login: "Connexion",
    signup: "S'inscrire",
    or: "ou",
    switchLanguage: "Changer de langue"
  },
  ar: {
    title: "مرحباً بك في ستوك فلو",
    subtitle: "حل إدارة المخزون الحديث الخاص بك",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    or: "أو",
    switchLanguage: "تغيير اللغة"
  }
};

const Index = () => {
  const { login } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

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
            <div className="space-y-2">
              <Button type="submit" className="w-full gap-2">
                {isLogin ? t.login : t.signup}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t.or}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => setIsLogin(!isLogin)}
              >
                {!isLogin ? t.login : t.signup}
                {!isLogin ? <ArrowRight className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Index;
