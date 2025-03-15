
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
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Download,
  Upload,
  Coins,
  ScrollText,
  Users,
  Paintbrush
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import CardGrid from "@/components/layout/CardGrid";

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
  language: string;
  dark_mode: boolean;
  compact_mode: boolean;
};

type SystemLogType = {
  id: string;
  action: string;
  created_at: string;
  details: any;
};

type UserType = {
  id: string;
  email: string;
  role: string;
};

const Settings = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language];
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemLogs, setSystemLogs] = useState<SystemLogType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchSystemLogs();
      fetchOrganizationUsers();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setDarkMode(data.dark_mode || false);
        setCompactMode(data.compact_mode || false);
      } else {
        const { data: newSettings, error: createError } = await supabase
          .from('settings')
          .insert([
            {
              user_id: user?.id,
              currency: 'USD',
              backup_frequency: 'weekly',
              theme: 'system',
              language: language,
              dark_mode: false,
              compact_mode: false
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationUsers = async () => {
    if (!settings?.organization_id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('organization_id', settings.organization_id);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Failed to load users");
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_audit_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

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
        .from('system_audit_logs')
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
        .from('system_audit_logs')
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

      if (!backupData.items || !backupData.orders || !backupData.timestamp) {
        throw new Error('Invalid backup file format');
      }

      const { error: itemsError } = await supabase
        .from('items')
        .upsert(backupData.items);

      if (itemsError) throw itemsError;

      const { error: ordersError } = await supabase
        .from('orders')
        .upsert(backupData.orders);

      if (ordersError) throw ordersError;

      await supabase
        .from('system_audit_logs')
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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateAppearance = async (darkMode: boolean, compactMode: boolean) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ 
          dark_mode: darkMode,
          compact_mode: compactMode,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setDarkMode(darkMode);
      setCompactMode(compactMode);
      
      // Apply dark mode to document
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Apply compact mode to document
      if (compactMode) {
        document.documentElement.classList.add('compact');
      } else {
        document.documentElement.classList.remove('compact');
      }

      toast.success("Appearance settings updated");
    } catch (error) {
      console.error('Error updating appearance:', error);
      toast.error("Failed to update appearance settings");
    }
  };

  if (loading) {
    return <PageContainer>{t.loading}</PageContainer>;
  }

  return (
    <PageContainer>
      <h1 className="text-4xl font-bold mb-8">{t.title}</h1>

      <CardGrid columns={2} gap="md">
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
            
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
                id="backup-file"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                {t.restore}
              </Button>
            </div>
          </div>
        </Card>

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

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            {t.customization}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">{t.darkMode}</Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={(checked) => {
                  setDarkMode(checked);
                  updateAppearance(checked, compactMode);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="compact-mode">{t.compactMode}</Label>
              <Switch
                id="compact-mode"
                checked={compactMode}
                onCheckedChange={(checked) => {
                  setCompactMode(checked);
                  updateAppearance(darkMode, checked);
                }}
              />
            </div>
          </div>
        </Card>
      </CardGrid>

      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          {t.systemLogs}
        </h2>
        <div className="overflow-auto max-h-[300px] rounded border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-start">Action</th>
                <th className="px-4 py-2 text-start">Details</th>
                <th className="px-4 py-2 text-start">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {systemLogs.length > 0 ? (
                systemLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2">{log.action}</td>
                    <td className="px-4 py-2">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-center text-muted-foreground">
                    {t.noLogs}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Settings;
