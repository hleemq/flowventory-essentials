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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    loading: "Loading..."
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
    loading: "Chargement..."
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
    loading: "جاري التحميل..."
  }
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [users, setUsers] = useState<UserType[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error("Failed to load organizations");
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
      fetchUsers();
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
      fetchOrganizations();
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
      fetchOrganizations();
    } catch (error) {
      console.error('Error updating organization status:', error);
      toast.error("Failed to update organization status");
    }
  };

  const assignUserToOrganization = async (userId: string, organizationId: string) => {
    try {
      const { error } = await supabase
        .from('user_organizations')
        .insert([{ user_id: userId, organization_id: organizationId }]);

      if (error) throw error;

      toast.success("User assigned to organization");
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
      fetchUsers();
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

      <div className="flex justify-between items-center gap-4">
        <UserForm onSubmit={handleAddUser} buttonText={t.addUser} />
        <OrganizationForm onSubmit={handleAddOrganization} buttonText={t.addOrganization} />
      </div>

      {/* Organizations Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{t.organizations}</h2>
        <div className="space-y-4">
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
      </Card>

      {/* Users Section */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">{t.users}</h2>
        <div className="space-y-4">
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
                        </DialogHeader>
                        <Select
                          value={selectedOrg || ''}
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
      </Card>
    </div>
  );
};

export default UserManagement;
