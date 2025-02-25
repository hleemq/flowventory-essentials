
export type AuditLog = {
  id: string;
  user_id: string;
  organization_id: string;
  schema_name: string;
  action: string;
  table_name: string;
  query_details: {
    query: string;
    new_data: any;
    old_data: any;
  };
  created_at: string;
};

export type OrganizationSummary = {
  organization_id: string;
  organization_name: string;
  total_users: number;
  total_items: number;
  total_orders: number;
  last_order_date: string | null;
};
