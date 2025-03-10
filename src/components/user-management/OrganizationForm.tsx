
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  en: {
    addOrganization: "Add Organization",
    createOrganization: "Create Organization",
    organizationName: "Organization Name",
    success: "Organization created successfully",
    error: "Failed to create organization",
    organizationDescription: "Enter the details of the new organization"
  },
  fr: {
    addOrganization: "Ajouter une organisation",
    createOrganization: "Créer une organisation",
    organizationName: "Nom de l'organisation",
    success: "Organisation créée avec succès",
    error: "Échec de la création de l'organisation",
    organizationDescription: "Entrez les détails de la nouvelle organisation"
  },
  ar: {
    addOrganization: "إضافة مؤسسة",
    createOrganization: "إنشاء مؤسسة",
    organizationName: "اسم المؤسسة",
    success: "تم إنشاء المؤسسة بنجاح",
    error: "فشل في إنشاء المؤسسة",
    organizationDescription: "أدخل تفاصيل المؤسسة الجديدة"
  }
};

interface OrganizationFormProps {
  onSubmit?: (data: { name: string }) => Promise<void>;
  buttonText?: string;
}

export const OrganizationForm = ({ 
  onSubmit,
  buttonText
}: OrganizationFormProps) => {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (onSubmit) {
        await onSubmit({ name });
      } else {
        // Direct Supabase insertion if no onSubmit is provided
        const { error } = await supabase
          .from("organizations")
          .insert({ name });
          
        if (error) throw error;
        
        // Invalidate the organizations query to refresh the list
        await queryClient.invalidateQueries({ queryKey: ["organizations"] });
        toast.success(t.success);
      }
      
      setOpen(false);
      setName("");
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Building className="mr-2 h-4 w-4" />
          {buttonText || t.addOrganization}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.createOrganization}</DialogTitle>
          <DialogDescription>{t.organizationDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t.organizationName}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.createOrganization}...
              </span>
            ) : (
              t.createOrganization
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
