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

const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch Users (Fix email retrieval)
  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role, organization_id");

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      // Fetch emails separately
      const usersWithEmails = await Promise.all(
        data.map(async (user) => {
          const { data: emailData, error: emailError } = await supabase
            .from("auth.users")
            .select("email")
            .eq("id", user.id)
            .single();
          return {
            ...user,
            email: emailData?.email || "Unknown",
          };
        })
      );

      console.log("Fetched users:", usersWithEmails);
      return usersWithEmails;
    }
  });

  // Fetch Organizations
  const { data: organizations = [], isLoading: isLoadingOrgs, error: orgsError } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, is_active, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching organizations:", error);
        throw error;
      }

      console.log("Fetched organizations:", data);
      return data;
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
        return data;
      } catch (error) {
        console.warn("Skipping organization summary due to missing table:", error);
        return [];
      }
    }
  });

  return (
    <div className="container py-8 space-y-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">User & Organization</h1>
        <Button variant="outline" onClick={() => navigate("/settings")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Settings
        </Button>
      </div>
      <div className="flex justify-between items-center gap-4">
        <UserForm onSubmit={() => {}} buttonText="Add User" />
        <OrganizationForm onSubmit={() => {}} buttonText="Add Organization" />
      </div>
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Organizations</h2>
        {organizations.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No organizations found. Create your first organization using the form above.
          </div>
        ) : (
          <ul>
            {organizations.map((org) => (
              <li key={org.id}>{org.name}</li>
            ))}
          </ul>
        )}
      </Card>
      <AuditLogs />
    </div>
  );
};

export default UserManagement;
