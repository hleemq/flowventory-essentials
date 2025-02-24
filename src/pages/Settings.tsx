
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
  Coins,
  ScrollText
} from "lucide-react";

const translations = {
  en: {
    title: "Settings",
    currency: "Currency",
    currencySettings: "Currency Settings",
    backupSettings: "Backup & Restore",
    systemLogs: "System Logs",
    download: "Download Backup",
    restore: "Restore Data",
    loading: "Loading...",
    noLogs: "No system logs found"
  },
  fr: {
    title: "Paramètres",
    currency: "Devise",
    currencySettings: "Paramètres de Devise",
    backupSettings: "Sauvegarde & Restauration",
    systemLogs: "Journaux Système",
    download: "Télécharger la Sauvegarde",
    restore: "Restaurer les Données",
    loading: "Chargement...",
    noLogs: "Aucun journal système trouvé"
  },
  ar: {
    title: "الإعدادات",
    currency: "العملة",
    currencySettings: "إعدادات العملة",
    backupSettings: "النسخ الاحتياطي والاستعادة",
    systemLogs: "سجلات النظام",
    download: "تحميل النسخة الاحتياطية",
    restore: "استعادة البيانات",
    loading: "جاري التحميل...",
    noLogs: "لم يتم العثور على سجلات النظام"
  }
};

type SettingsType = {
  currency: string;
  backup_frequency: string;
  theme: string;
  id: string;
};

type SystemLogType = {
  id: string;
  action: string;
  created_at: string;
};

const Settings = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language];
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemLogs, setSystemLogs] = useState<SystemLogType[]>([]);

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchSystemLogs();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('settings')
          .insert([
            {
              user_id: user?.id,
              currency: 'USD',
              backup_frequency: 'weekly',
              theme: 'system'
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSystemLogs(data || []);
    } catch (error) {
      console.error('Error fetching system logs:', error);
      toast.error("Failed to load system logs");
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
      
      // Log the currency update
      await supabase
        .from('system_logs')
        .insert([{
          action: `Currency updated to ${newCurrency}`,
          user_id: user?.id
        }]);

      toast.success("Currency updated successfully");
      fetchSystemLogs(); // Refresh logs
    } catch (error) {
      console.error('Error updating currency:', error);
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
      a.download = `backup_${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log the backup
      await supabase
        .from('system_logs')
        .insert([{
          action: 'Data backup downloaded',
          user_id: user?.id
        }]);

      toast.success("Backup downloaded successfully");
      fetchSystemLogs(); // Refresh logs
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error("Failed to download backup");
    }
  };

  if (loading) {
    return <div className="container py-8">{t.loading}</div>;
  }

  return (
    <div className="container py-8 space-y-8">
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
                {systemLogs.length > 0 ? (
                  systemLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-2">{log.action}</td>
                      <td className="px-4 py-2">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-center text-muted-foreground">
                      {t.noLogs}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
