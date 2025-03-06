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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  // Fetch Users
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error("Failed to load users.");
      return data as UserType[];
    },
  });

  // Fetch Organizations
  const { data: organizations = [], isLoading: loadingOrganizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error("Failed to load organizations.");
      return data as OrganizationType[];
    },
  });

  // Fetch Organization Summary
  const { data: orgSummary } = useQuery({
    queryKey: ["org-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organization_summary").select("*");
      if (error) throw new Error("Failed to load organization summary.");
      return data as OrganizationSummary[];
    },
  });

  // Handle Add User
  const addUser = useMutation({
    mutationFn: async (userData: { email: string; password: string; firstName: string; lastName: string; role: UserRole }) => {
      const { error } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password.trim(),
        options: {
          data: {
            first_name: userData.firstName.trim(),
            last_name: userData.lastName.trim(),
            role: userData.role,
          },
        },
      });
      if (error) throw new Error("Failed to add user.");
    },
    onSuccess: () => {
      toast.success("User added successfully");
      queryClient.invalidateQueries(["users"]);
    },
    onError: () => toast.error("Failed to add user"),
  });

  // Handle Add Organization
  const addOrganization = useMutation({
    mutationFn: async (data: { name: string }) => {
      const { error } = await supabase.from("organizations").insert([{ name: data.name.trim() }]);
      if (error) throw new Error("Failed to add organization.");
    },
    onSuccess: () => {
      toast.success("Organization added successfully");
      queryClient.invalidateQueries(["organizations"]);
    },
    onError: () => toast.error("Failed to add organization"),
  });

  // Handle Assign User to Organization
  const assignUserToOrg = async (userId: string, orgId: string) => {
    try {
      const existingAssignment = await supabase
        .from("user_organizations")
        .select("id")
        .eq("user_id", userId)
        .eq("organization_id", orgId)
        .single();

      if (existingAssignment.data) {
        toast.warning("User is already assigned to this organization.");
        return;
      }

      const { error } = await supabase
        .from("user_organizations")
        .insert([{ user_id: userId, organization_id: orgId }]);

      if (error) throw error;
      toast.success("User assigned to organization");
    } catch (error) {
      toast.error("Failed to assign user to organization");
    }
  };

  if (loadingUsers || loadingOrganizations) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">User & Organization</h1>
        <Button variant="outline" onClick={() => navigate("/settings")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Settings
        </Button>
      </div>

      <div className="flex justify-between items-center gap-4">
        <UserForm onSubmit={addUser.mutate} buttonText="Add User" />
        <OrganizationForm onSubmit={addOrganization.mutate} buttonText="Add Organization" />
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Organizations</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Name</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.id} className="border-b">
                <td className="py-4">{org.name}</td>
                <td className="py-4">{org.is_active ? "Active" : "Inactive"}</td>
                <td className="py-4">{new Date(org.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <AuditLogs />
    </div>
  );
};

export default UserManagement;
