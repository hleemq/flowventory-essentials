import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CurrencySettings from "@/components/settings/CurrencySettings";
import BackupSettings from "@/components/settings/BackupSettings";
import CustomizationSettings from "@/components/settings/CustomizationSettings";
import SystemLogs from "@/components/settings/SystemLogs";

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
    noLogs: "No system logs found",
    userManagement: "User & Organization",
    customization: "Customization",
    darkMode: "Dark Mode",
    compactMode: "Compact Mode"
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
    noLogs: "Aucun journal système trouvé",
    userManagement: "Utilisateur & Organisation",
    customization: "Personnalisation",
    darkMode: "Mode Sombre",
    compactMode: "Mode Compact"
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
    noLogs: "لم يتم العثور على سجلات النظام",
    userManagement: "المستخدم والمنظمة",
    customization: "التخصيص",
    darkMode: "الوضع الداكن",
    compactMode: "الوضع المضغوط"
  }
};

type SettingsType = {
  currency: string;
  backup_frequency: string;
  theme: string;
  id: string;
  organization_id: string;
};

type SystemLogType = {
  id: string;
  action: string;
  created_at: string;
  details: any;
};

const Settings = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemLogs, setSystemLogs] = useState<SystemLogType[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        .update({ 
          currency: newCurrency,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setSettings(prev => prev ? { ...prev, currency: newCurrency } : null);
      
      await supabase
        .from('system_logs')
        .insert([{
          action: `Currency updated to ${newCurrency}`,
          user_id: user?.id,
          details: { newCurrency, timestamp: new Date().toISOString() }
        }]);

      toast.success("Currency updated successfully");
      fetchSystemLogs();
    } catch (error) {
      console.error('Error updating currency:', error);
      toast.error("Failed to update currency");
    }
  };

  const downloadBackup = async () => {
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*');

      if (itemsError) throw itemsError;

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) throw ordersError;

      const backupData = {
        timestamp: new Date().toISOString(),
        items: itemsData,
        orders: ordersData,
        settings: settings
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

      await supabase
        .from('system_logs')
        .insert([{
          action: 'Data backup downloaded',
          user_id: user?.id,
          details: { timestamp: new Date().toISOString() }
        }]);

      toast.success("Backup downloaded successfully");
      fetchSystemLogs();
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error("Failed to download backup");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      const backupData = JSON.parse(fileContent);

      // Validate backup data structure
      if (!backupData.items || !backupData.orders || !backupData.timestamp) {
        throw new Error('Invalid backup file format');
      }

      // Restore items
      const { error: itemsError } = await supabase
        .from('items')
        .upsert(backupData.items);

      if (itemsError) throw itemsError;

      // Restore orders
      const { error: ordersError } = await supabase
        .from('orders')
        .upsert(backupData.orders);

      if (ordersError) throw ordersError;

      await supabase
        .from('system_logs')
        .insert([{
          action: 'Data restored from backup',
          user_id: user?.id,
          details: { 
            timestamp: new Date().toISOString(),
            backup_date: backupData.timestamp
          }
        }]);

      toast.success("Data restored successfully");
      fetchSystemLogs();
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error("Failed to restore backup");
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return <div className="container py-8">{t.loading}</div>;
  }

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-4xl font-bold">{t.title}</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <CurrencySettings
          currentCurrency={settings?.currency || 'USD'}
          onCurrencyChange={updateCurrency}
          title={t.currencySettings}
        />

        <BackupSettings
          onDownload={downloadBackup}
          onFileUpload={handleFileUpload}
          title={t.backupSettings}
          downloadText={t.download}
          restoreText={t.restore}
        />

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t.userManagement}
          </h2>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/user-management')}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Users & Organization
          </Button>
        </Card>

        <CustomizationSettings
          darkMode={darkMode}
          compactMode={compactMode}
          onDarkModeChange={setDarkMode}
          onCompactModeChange={setCompactMode}
          title={t.customization}
          darkModeText={t.darkMode}
          compactModeText={t.compactMode}
        />

        <SystemLogs
          logs={systemLogs}
          title={t.systemLogs}
          noLogsMessage={t.noLogs}
        />
      </div>
    </div>
  );
};

export default Settings;

