
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Download,
  Upload,
  UserPlus,
  Building,
  Users,
  ScrollText,
  Paintbrush,
  Coins
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const translations = {
  en: {
    title: "Settings",
    currency: "Currency",
    backup: "Backup & Restore",
    account: "Account Management",
    download: "Download Backup",
    restore: "Restore Data",
    newUser: "Create New User",
    addToOrg: "Add User to Organization",
    createOrg: "Create Organization",
    logs: "System Logs",
    customize: "Customize Pages",
    systemLogs: "System Logs",
    currencySettings: "Currency Settings",
    backupSettings: "Backup Settings",
    accountSettings: "Account Settings",
    customization: "Customization",
    saveChanges: "Save Changes",
    loading: "Loading...",
  },
  fr: {
    title: "Paramètres",
    currency: "Devise",
    backup: "Sauvegarde & Restauration",
    account: "Gestion du Compte",
    download: "Télécharger la Sauvegarde",
    restore: "Restaurer les Données",
    newUser: "Créer un Nouvel Utilisateur",
    addToOrg: "Ajouter à l'Organisation",
    createOrg: "Créer une Organisation",
    logs: "Journaux Système",
    customize: "Personnaliser les Pages",
    systemLogs: "Journaux Système",
    currencySettings: "Paramètres de Devise",
    backupSettings: "Paramètres de Sauvegarde",
    accountSettings: "Paramètres du Compte",
    customization: "Personnalisation",
    saveChanges: "Enregistrer",
    loading: "Chargement...",
  },
  ar: {
    title: "الإعدادات",
    currency: "العملة",
    backup: "النسخ الاحتياطي والاستعادة",
    account: "إدارة الحساب",
    download: "تحميل النسخة الاحتياطية",
    restore: "استعادة البيانات",
    newUser: "إنشاء مستخدم جديد",
    addToOrg: "إضافة إلى المنظمة",
    createOrg: "إنشاء منظمة",
    logs: "سجلات النظام",
    customize: "تخصيص الصفحات",
    systemLogs: "سجلات النظام",
    currencySettings: "إعدادات العملة",
    backupSettings: "إعدادات النسخ الاحتياطي",
    accountSettings: "إعدادات الحساب",
    customization: "التخصيص",
    saveChanges: "حفظ التغييرات",
    loading: "جاري التحميل...",
  }
};

type SettingsType = {
  currency: string;
  backup_frequency: string;
  theme: string;
  id: string;
};

const Settings = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language];
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchSystemLogs();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemLogs = async () => {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Failed to load system logs");
    } else {
      setSystemLogs(data || []);
    }
  };

  const updateCurrency = async (newCurrency: string) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ currency: newCurrency })
        .eq('user_id', user?.id);

      if (error) throw error;
      setSettings(prev => prev ? { ...prev, currency: newCurrency } : null);
      toast.success("Currency updated successfully");
    } catch (error) {
      toast.error("Failed to update currency");
    }
  };

  const downloadBackup = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*');

      if (error) throw error;

      const backupData = {
        timestamp: new Date().toISOString(),
        data: data
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stockflow_backup_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Backup downloaded successfully");
    } catch (error) {
      toast.error("Failed to download backup");
    }
  };

  if (loading) {
    return <div className="container py-8">{t.loading}</div>;
  }

  return (
    <div className="container py-8 space-y-8 animate-in">
      <h1 className="text-4xl font-bold">{t.title}</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Currency Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5" />
            {t.currencySettings}
          </h2>
          <Select
            value={settings?.currency || 'USD'}
            onValueChange={updateCurrency}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">$ (USD)</SelectItem>
              <SelectItem value="EUR">€ (EUR)</SelectItem>
              <SelectItem value="MAD">MAD (Moroccan Dirham)</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Backup & Restore */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Download className="h-5 w-5" />
            {t.backupSettings}
          </h2>
          <div className="space-y-4">
            <Button
              onClick={downloadBackup}
              className="w-full"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              {t.download}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  {t.restore}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.restore}</DialogTitle>
                  <DialogDescription>
                    Upload a backup file to restore your data.
                  </DialogDescription>
                </DialogHeader>
                {/* Restore functionality would go here */}
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Account Management */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.accountSettings}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              {t.newUser}
            </Button>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              {t.addToOrg}
            </Button>
            <Button variant="outline">
              <Building className="mr-2 h-4 w-4" />
              {t.createOrg}
            </Button>
          </div>
        </Card>

        {/* System Logs */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            {t.systemLogs}
          </h2>
          <div className="overflow-auto max-h-[300px] rounded border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-start">Action</th>
                  <th className="px-4 py-2 text-start">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {systemLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2">{log.action}</td>
                    <td className="px-4 py-2">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Customization */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            {t.customization}
          </h2>
          {/* Customization options would go here */}
        </Card>
      </div>
    </div>
  );
};

export default Settings;
