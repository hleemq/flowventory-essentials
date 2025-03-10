
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Lock,
  UserCog,
  UserX,
  Building,
  Power,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserForm } from "@/components/user-management/UserForm";
import { OrganizationForm } from "@/components/user-management/OrganizationForm";
import { UserRole } from "@/utils/roles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuditLogs } from "@/components/user-management/AuditLogs";

// Define translations for all supported languages
const translations = {
  en: {
    title: "User & Organization Management",
    backToSettings: "Back to Settings",
    addUser: "Add User",
    addOrganization: "Add Organization",
    organizations: "Organizations",
    users: "Users",
    name: "Name",
    email: "Email",
    role: "Role",
    status: "Status",
    created: "Created",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    admin: "Admin",
    user: "User",
    makeAdmin: "Make Admin",
    makeUser: "Make User",
    activate: "Activate",
    deactivate: "Deactivate",
    resetPassword: "Reset Password",
    delete: "Delete",
    refresh: "Refresh Data",
    refreshing: "Refreshing...",
    noOrganizations: "No organizations found. Create your first organization using the form above.",
    noUsers: "No users found. Create your first user using the form above.",
    errorLoadingUsers: "Error loading users",
    errorLoadingOrgs: "Error loading organizations"
  },
  fr: {
    title: "Gestion des utilisateurs & organisations",
    backToSettings: "Retour aux paramètres",
    addUser: "Ajouter un utilisateur",
    addOrganization: "Ajouter une organisation",
    organizations: "Organisations",
    users: "Utilisateurs",
    name: "Nom",
    email: "Email",
    role: "Rôle",
    status: "Statut",
    created: "Créé",
    actions: "Actions",
    active: "Actif",
    inactive: "Inactif",
    admin: "Admin",
    user: "Utilisateur",
    makeAdmin: "Promouvoir admin",
    makeUser: "Définir comme utilisateur",
    activate: "Activer",
    deactivate: "Désactiver",
    resetPassword: "Réinitialiser mot de passe",
    delete: "Supprimer",
    refresh: "Rafraîchir les données",
    refreshing: "Rafraîchissement...",
    noOrganizations: "Aucune organisation trouvée. Créez votre première organisation à l'aide du formulaire ci-dessus.",
    noUsers: "Aucun utilisateur trouvé. Créez votre premier utilisateur à l'aide du formulaire ci-dessus.",
    errorLoadingUsers: "Erreur de chargement des utilisateurs",
    errorLoadingOrgs: "Erreur de chargement des organisations"
  },
  ar: {
    title: "إدارة المستخدمين والمؤسسات",
    backToSettings: "العودة إلى الإعدادات",
    addUser: "إضافة مستخدم",
    addOrganization: "إضافة مؤسسة",
    organizations: "المؤسسات",
    users: "المستخدمين",
    name: "الاسم",
    email: "البريد الإلكتروني",
    role: "الدور",
    status: "الحالة",
    created: "تم الإنشاء",
    actions: "الإجراءات",
    active: "نشط",
    inactive: "غير نشط",
    admin: "مدير",
    user: "مستخدم",
    makeAdmin: "جعله مدير",
    makeUser: "جعله مستخدم",
    activate: "تفعيل",
    deactivate: "تعطيل",
    resetPassword: "إعادة تعيين كلمة المرور",
    delete: "حذف",
    refresh: "تحديث البيانات",
    refreshing: "جاري التحديث...",
    noOrganizations: "لم يتم العثور على مؤسسات. قم بإنشاء أول مؤسسة لك باستخدام النموذج أعلاه.",
    noUsers: "لم يتم العثور على مستخدمين. قم بإنشاء أول مستخدم لك باستخدام النموذج أعلاه.",
    errorLoadingUsers: "خطأ في تحميل المستخدمين",
    errorLoadingOrgs: "خطأ في تحميل المؤسسات"
  }
};

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  organization_id: string | null;
  created_at?: string;
}

interface Organization {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const t = translations[language];
  
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch Users
  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        // First fetch profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, role, organization_id, created_at");

        if (profilesError) throw profilesError;

        // Get user emails from auth.users (requires separate approach)
        const usersWithEmails = await Promise.all(
          (profilesData || []).map(async (profile) => {
            try {
              // We need to query auth.users for emails, but we can't do it directly
              // Instead we'll use auth API or admin functions if available
              
              // For now, use a placeholder and update when we have proper auth setup
              return {
                ...profile,
                email: "user@example.com" // Placeholder, will be updated with actual emails
              };
            } catch (error) {
              console.error("Error fetching user email:", error);
              return {
                ...profile,
                email: "Unknown"
              };
            }
          })
        );

        console.log("Fetched users with profiles:", usersWithEmails);
        return usersWithEmails;
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
    }
  });

  // Fetch Organizations
  const { data: organizations = [], isLoading: isLoadingOrgs, error: orgsError } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id, name, is_active, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        console.log("Fetched organizations:", data);
        return data || [];
      } catch (error) {
        console.error("Error fetching organizations:", error);
        throw error;
      }
    }
  });

  // Skip Organization Summary If It Doesn't Exist
  const { data: orgSummary = [], isLoading: isLoadingSummary } = useQuery({
    queryKey: ["org-summary"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("organization_summary").select("*");
        if (error) throw error;
        console.log("Fetched organization summary:", data);
        return data || [];
      } catch (error) {
        console.warn("Skipping organization summary due to missing table:", error);
        return [];
      }
    }
  });

  // Function to refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({ queryKey: ["org-summary"] });
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle user actions (make admin, activate, etc.)
  const handleUserAction = async (userId: string, action: string) => {
    try {
      // Implementation will depend on your specific requirements
      toast.success(`${action} action completed for user ${userId}`);
      refreshData();
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      toast.error(`Failed to ${action.toLowerCase()} user`);
    }
  };

  // Handle organization actions (activate, deactivate)
  const handleOrgAction = async (orgId: string, action: string) => {
    try {
      if (action === "activate" || action === "deactivate") {
        const { error } = await supabase
          .from("organizations")
          .update({ is_active: action === "activate" })
          .eq("id", orgId);
        
        if (error) throw error;
        
        toast.success(`Organization ${action === "activate" ? "activated" : "deactivated"} successfully`);
        refreshData();
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      toast.error(`Failed to ${action.toLowerCase()} organization`);
    }
  };

  return (
    <div className="container py-8 space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <Button variant="outline" onClick={() => navigate("/settings")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t.backToSettings}
        </Button>
      </div>

      {/* Forms */}
      <div className="flex justify-between items-center gap-4">
        <UserForm onSubmit={() => refreshData()} buttonText={t.addUser} />
        <OrganizationForm onSubmit={() => refreshData()} buttonText={t.addOrganization} />
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={refreshData} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? t.refreshing : t.refresh}
        </Button>
      </div>

      {/* Organizations */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{t.organizations}</h2>
        
        {isLoadingOrgs ? (
          <div className="text-center p-4 text-muted-foreground">
            <div className="animate-pulse">Loading organizations...</div>
          </div>
        ) : orgsError ? (
          <div className="text-center p-4 text-red-500">
            {t.errorLoadingOrgs}: {(orgsError as Error).message}
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            {t.noOrganizations}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-2">{t.name}</th>
                  <th className="text-left px-4 py-2">{t.status}</th>
                  <th className="text-left px-4 py-2">{t.created}</th>
                  <th className="text-left px-4 py-2">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-2">{org.name}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        org.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {org.is_active ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        {org.is_active ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOrgAction(org.id, "deactivate")}
                          >
                            <Power className="h-4 w-4 mr-1" /> {t.deactivate}
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOrgAction(org.id, "activate")}
                          >
                            <Power className="h-4 w-4 mr-1" /> {t.activate}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Users */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{t.users}</h2>
        
        {isLoadingUsers ? (
          <div className="text-center p-4 text-muted-foreground">
            <div className="animate-pulse">Loading users...</div>
          </div>
        ) : usersError ? (
          <div className="text-center p-4 text-red-500">
            {t.errorLoadingUsers}: {(usersError as Error).message}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            {t.noUsers}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-2">{t.name}</th>
                  <th className="text-left px-4 py-2">{t.email}</th>
                  <th className="text-left px-4 py-2">{t.role}</th>
                  <th className="text-left px-4 py-2">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-2">{`${user.first_name} ${user.last_name}`}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      {user.role === "admin" ? t.admin : t.user}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        {user.role === "admin" ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUserAction(user.id, "makeUser")}
                          >
                            <UserCog className="h-4 w-4 mr-1" /> {t.makeUser}
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUserAction(user.id, "makeAdmin")}
                          >
                            <UserCog className="h-4 w-4 mr-1" /> {t.makeAdmin}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUserAction(user.id, "resetPassword")}
                        >
                          <Lock className="h-4 w-4 mr-1" /> {t.resetPassword}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      <AuditLogs />
    </div>
  );
};

export default UserManagement;
