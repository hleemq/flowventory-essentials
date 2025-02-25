
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AuditLog } from "@/types/audit";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const translations = {
  en: {
    title: "Audit Logs",
    timestamp: "Timestamp",
    action: "Action",
    schema: "Schema",
    table: "Table",
    details: "Details",
    loading: "Loading audit logs...",
    noLogs: "No audit logs found"
  },
  fr: {
    title: "Journaux d'audit",
    timestamp: "Horodatage",
    action: "Action",
    schema: "Schéma",
    table: "Table",
    details: "Détails",
    loading: "Chargement des journaux d'audit...",
    noLogs: "Aucun journal d'audit trouvé"
  },
  ar: {
    title: "سجلات التدقيق",
    timestamp: "التوقيت",
    action: "الإجراء",
    schema: "المخطط",
    table: "الجدول",
    details: "التفاصيل",
    loading: "جاري تحميل سجلات التدقيق...",
    noLogs: "لم يتم العثور على سجلات تدقيق"
  }
};

export const AuditLogs = () => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AuditLog[];
    }
  });

  if (isLoading) {
    return <div>{t.loading}</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">{t.title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.timestamp}</TableHead>
            <TableHead>{t.action}</TableHead>
            <TableHead>{t.schema}</TableHead>
            <TableHead>{t.table}</TableHead>
            <TableHead>{t.details}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditLogs?.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {new Date(log.created_at).toLocaleString(language)}
              </TableCell>
              <TableCell className="uppercase">{log.action}</TableCell>
              <TableCell>{log.schema_name}</TableCell>
              <TableCell>{log.table_name}</TableCell>
              <TableCell className="max-w-md truncate">
                {JSON.stringify(log.query_details)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
