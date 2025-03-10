
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwdbvsruaazcwwkzmmdr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZGJ2c3J1YWF6Y3d3a3ptbWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTMxMzMsImV4cCI6MjA1NDY4OTEzM30.02DIsfee8mN4T_EHLtEVaIuO0uoxBWX_S23eMhHmCCY';

// Support for multi-currency and internationalization
export const supportedCurrencies = {
  MAD: {
    symbol: 'MAD',
    name: 'Moroccan Dirham',
    locales: {
      en: 'en-MA',
      fr: 'fr-MA',
      ar: 'ar-MA'
    }
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    locales: {
      en: 'en-FR',
      fr: 'fr-FR',
      ar: 'ar-FR'
    }
  },
  USD: {
    symbol: '$',
    name: 'US Dollar',
    locales: {
      en: 'en-US',
      fr: 'fr-US',
      ar: 'ar-US'
    }
  }
};

// Helper function to format currency values
export const formatCurrency = (value: number, currencyCode: keyof typeof supportedCurrencies = 'MAD', language = 'en') => {
  const currency = supportedCurrencies[currencyCode] || supportedCurrencies.MAD;
  const locale = currency.locales[language as keyof typeof currency.locales] || 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode === 'MAD' ? 'MAD' : currencyCode,
    currencyDisplay: 'symbol'
  }).format(value);
};

// Create Supabase client with storage
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true
  },
  global: {
    fetch: fetch
  }
});

// Improved fetch organizations function with better error handling
export const fetchOrganizations = async () => {
  try {
    console.log("Fetching organizations...");
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching organizations:", error);
      throw error;
    }

    console.log("Successfully fetched organizations:", data);
    return data || [];
  } catch (error) {
    console.error("Error in fetchOrganizations:", error);
    throw error;
  }
};

// Helper for running custom SQL queries (since raw method is not available)
export const executeRawQuery = async (query: string, params?: any[]) => {
  try {
    // Use rpc function to execute raw SQL safely
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: query,
      params: params || []
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error executing raw query:', error);
    return { data: null, error };
  }
};

// Initialize storage bucket if not exists
(async () => {
  try {
    // Try to create a 'public' bucket (this may fail due to permissions, which is normal)
    try {
      const { data, error } = await supabase.storage.createBucket('public', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB size limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
      
      if (!error) {
        console.log('Public storage bucket created successfully');
      }
    } catch (bucketError) {
      // Bucket might already exist or we don't have permissions to create it
      console.log('Note: Could not create public bucket, it might already exist.');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
})();
