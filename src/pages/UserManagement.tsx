
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Lock,
  UserCog,
  Shield,
  UserX,
  Users,
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
import { OrganizationSummary } from "@/types/audit";

type UserType = {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  is_active?: boolean;
};

type OrganizationType = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

const translations = {
  en: {
    title: "User & Organization",
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
    assignOrganization: "Assign Organization",
    selectOrganization: "Select organization",
    loading: "Loading...",
    switchOrganization: "Switch Organization",
    currentSchema: "Current Schema",
    summary: "Organization Summary",
    totalUsers: "Total Users",
    totalItems: "Total Items",
    totalOrders: "Total Orders",
    lastOrder: "Last Order",
    noUsers: "No users found. Add your first user using the form above.",
    noOrganizations: "No organizations found. Create your first organization using the form above.",
    refreshing: "Refreshing...",
    refresh: "Refresh",
    errorLoadingUsers: "Error loading users. Please try again.",
    errorLoadingOrgs: "Error loading organizations. Please try again."
  },
  fr: {
    title: "Utilisateur & Organisation",
    backToSettings: "Retour aux paramètres",
    addUser: "Ajouter un utilisateur",
    addOrganization: "Ajouter une organisation",
    organizations: "Organisations",
    users: "Utilisateurs",
    name: "Nom",
    email: "Email",
    role: "Rôle",
    status: "Statut",
    created: "Créé le",
    actions: "Actions",
    active: "Actif",
    inactive: "Inactif",
    assignOrganization: "Assigner une organisation",
    selectOrganization: "Sélectionner une organisation",
    loading: "Chargement...",
    switchOrganization: "Changer d'organisation",
    currentSchema: "Schéma actuel",
    summary: "Résumé de l'organisation",
    totalUsers: "Nombre d'utilisateurs",
    totalItems: "Nombre d'articles",
    totalOrders: "Nombre de commandes",
    lastOrder: "Dernière commande"
  },
  ar: {
    title: "المستخدمين والمؤسسات",
    backToSettings: "العودة للإعدادات",
    addUser: "إضافة مستخدم",
    addOrganization: "إضافة مؤسسة",
    organizations: "المؤسسات",
    users: "المستخدمين",
    name: "الاسم",
    email: "البريد الإلكتروني",
    role: "الدور",
    status: "الحالة",
    created: "تاريخ الإنشاء",
    actions: "الإجراءات",
    active: "نشط",
    inactive: "غير نشط",
    assignOrganization: "تعيين المؤسسة",
    selectOrganization: "اختر المؤسسة",
    loading: "جاري التحميل...",
    switchOrganization: "تغيير المؤسسة",
    currentSchema: "المخطط الحالي",
    summary: "ملخص المؤسسة",
    totalUsers: "إجمالي المستخدمين",
    totalItems: "إجمالي العناصر",
    totalOrders: "إجمالي الطلبات",
    lastOrder: "آخر طلب"
  }
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const queryClient = useQueryClient();
  
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use React Query for data fetching with improved error handling
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log("Fetching users data");
      // For admin users, we fetch all users without filtering
      const { data, error } = await supabase
        .from('profiles')
        .select('*, auth.users!inner(email)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      
      // Map the data to include the email from the auth.users table
      const mappedData = data.map(profile => ({
        ...profile,
        email: profile.auth?.users?.email || '',
      }));
      
      console.log("Fetched users:", mappedData);
      return mappedData as UserType[];
    }
  });

  const {
    data: organizations = [],
    isLoading: isLoadingOrgs,
    error: orgsError,
    refetch: refetchOrgs
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      console.log("Fetching organizations data");
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching organizations:", error);
        throw error;
      }
      
      console.log("Fetched organizations:", data);
      return data as OrganizationType[];
    }
  });

  const { 
    data: orgSummary = [], 
    isLoading: isLoadingSummary,
    error: summaryError,
    refetch: refetchSummary 
  } = useQuery({
    queryKey: ['org-summary'],
    queryFn: async () => {
      console.log("Fetching organization summary data");
      const { data, error } = await supabase
        .from('organization_summary')
        .select('*');
      
      if (error) {
        console.error("Error fetching organization summary:", error);
        throw error;
      }
      
      console.log("Fetched organization summary:", data);
      return data as OrganizationSummary[];
    }
  });

  useEffect(() => {
    if (usersError) {
      console.error('Error fetching users:', usersError);
      toast.error(t.errorLoadingUsers);
    }
    
    if (orgsError) {
      console.error('Error fetching organizations:', orgsError);
      toast.error(t.errorLoadingOrgs);
    }
    
    if (summaryError) {
      console.error('Error fetching organization summary:', summaryError);
      toast.error("Failed to load organization summary");
    }
  }, [usersError, orgsError, summaryError, t]);

  // Function to fetch email for a user from auth.users
  const fetchUserEmail = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('auth.users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data?.email || '';
    } catch (error) {
      console.error('Error fetching user email:', error);
      return '';
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      console.log("Refreshing all data");
      await Promise.all([
        refetchUsers(),
        refetchOrgs(),
        refetchSummary()
      ]);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddUser = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }) => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role
          }
        }
      });

      if (signUpError) throw signUpError;

      toast.success("User added successfully");
      refetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error("Failed to add user");
    }
  };

  const handleAddOrganization = async (data: { name: string }) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .insert([{ name: data.name }]);

      if (error) throw error;

      toast.success("Organization added successfully");
      refetchOrgs();
      refetchSummary();
    } catch (error) {
      console.error('Error adding organization:', error);
      toast.error("Failed to add organization");
    }
  };

  const toggleOrganizationStatus = async (orgId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ is_active: !isActive })
        .eq('id', orgId);

      if (error) throw error;

      toast.success("Organization status updated");
      refetchOrgs();
    } catch (error) {
      console.error('Error updating organization status:', error);
      toast.error("Failed to update organization status");
    }
  };

  const assignUserToOrganization = async (userId: string, organizationId: string) => {
    try {
      console.log(`Assigning user ${userId} to organization ${organizationId}`);
      
      // Check if relationship already exists
      const { data: existingRelation, error: checkError } = await supabase
        .from('user_organizations')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organizationId);
      
      if (checkError) throw checkError;
      
      // Only insert if relationship doesn't exist
      if (!existingRelation || existingRelation.length === 0) {
        const { error } = await supabase
          .from('user_organizations')
          .insert([{ user_id: userId, organization_id: organizationId }]);

        if (error) throw error;
        
        console.log("User successfully assigned to organization");
      } else {
        console.log("Relationship already exists, no changes made");
      }

      toast.success("User assigned to organization");
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['org-summary'] });
    } catch (error) {
      console.error('Error assigning user to organization:', error);
      toast.error("Failed to assign user to organization");
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) throw error;

      toast.success("User status updated");
      refetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error("Failed to update user status");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success("Password reset email sent");
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error("Failed to send password reset email");
    }
  };

  const switchOrganizationSchema = async (organizationId: string) => {
    try {
      await supabase.rpc('set_organization_schema', {
        org_id: organizationId
      });
      toast.success("Organization schema switched successfully");
      refetchSummary();
    } catch (error) {
      console.error('Error switching organization schema:', error);
      toast.error("Failed to switch organization schema");
    }
  };

  const isLoading = isLoadingUsers || isLoadingOrgs || isLoadingSummary;

  if (isLoading) {
    return <div className="container py-8">{t.loading}</div>;
  }

  return (
    <div className="container py-8 space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">{t.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? t.refreshing : t.refresh}
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.backToSettings}
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4">
        <UserForm onSubmit={handleAddUser} buttonText={t.addUser} />
        <OrganizationForm onSubmit={handleAddOrganization} buttonText={t.addOrganization} />
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{t.summary}</h2>
        {orgSummary.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No organization summary data available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {orgSummary?.map((summary) => (
              <div key={summary.organization_id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{summary.organization_name}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>{t.totalUsers}: {summary.total_users}</p>
                  <p>{t.totalItems}: {summary.total_items}</p>
                  <p>{t.totalOrders}: {summary.total_orders}</p>
                  {summary.last_order_date && (
                    <p>{t.lastOrder}: {new Date(summary.last_order_date).toLocaleDateString(language)}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => switchOrganizationSchema(summary.organization_id)}
                  >
                    {t.switchOrganization}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{t.organizations}</h2>
        {organizations.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            {t.noOrganizations}
          </div>
        ) : (
          <div className="space-y-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">{t.name}</th>
                  <th className="pb-2">{t.status}</th>
                  <th className="pb-2">{t.created}</th>
                  <th className="pb-2">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="border-b">
                    <td className="py-4">{org.name}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        org.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {org.is_active ? t.active : t.inactive}
                      </span>
                    </td>
                    <td className="py-4">
                      {new Date(org.created_at).toLocaleDateString(language)}
                    </td>
                    <td className="py-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleOrganizationStatus(org.id, org.is_active)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{t.users}</h2>
        {users.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            {t.noUsers}
          </div>
        ) : (
          <div className="space-y-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">{t.name}</th>
                  <th className="pb-2">{t.email}</th>
                  <th className="pb-2">{t.role}</th>
                  <th className="pb-2">{t.organizations}</th>
                  <th className="pb-2">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-4">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="py-4">{user.email}</td>
                    <td className="py-4 capitalize">{user.role}</td>
                    <td className="py-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Building className="mr-2 h-4 w-4" />
                            {t.assignOrganization}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t.assignOrganization}</DialogTitle>
                            <DialogDescription>
                              Select an organization to assign this user to
                            </DialogDescription>
                          </DialogHeader>
                          <Select
                            onValueChange={(value) => {
                              setSelectedOrg(value);
                              assignUserToOrganization(user.id, value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t.selectOrganization} />
                            </SelectTrigger>
                            <SelectContent>
                              {organizations.map((org) => (
                                <SelectItem key={org.id} value={org.id}>
                                  {org.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </DialogContent>
                      </Dialog>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleUserStatus(user.id, !!user.is_active)}
                        >
                          {user.is_active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCog className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => resetPassword(user.email)}
                        >
                          <Lock className="h-4 w-4" />
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
