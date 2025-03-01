
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Warehouse } from "../types";

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*');
      
      if (error) throw error;
      console.log("Fetched warehouses:", data);
      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error("Failed to fetch warehouses");
    }
  };

  return { warehouses, fetchWarehouses };
};
