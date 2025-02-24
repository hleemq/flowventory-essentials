
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type UserType = {
  id: string;
  email: string;
  role: string;
};

const translations = {
  en: {
    title: "User & Organization Management",
    loading: "Loading...",
    backToSettings: "Back to Settings",
    noUsers: "No users found"
  },
  fr: {
    title: "Gestion des Utilisateurs & Organisation",
    loading: "Chargement...",
    backToSettings: "Retour aux Paramètres",
    noUsers: "Aucun utilisateur trouvé"
  },
  ar: {
    title: "إدارة المستخدمين والمنظمة",
    loading: "جاري التحميل...",
    backToSettings: "العودة إلى الإعدادات",
    noUsers: "لم يتم العثور على مستخدمين"
  }
};

const UserManagement = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container py-8">{t.loading}</div>;
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <Button variant="outline" onClick={() => navigate('/settings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.backToSettings}
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {users.length > 0 ? (
            users.map(user => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">{t.noUsers}</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UserManagement;
