
import { createClient } from '@supabase/supabase-js';

// Supabase connection credentials
// Note: In production, these should ideally be in environment variables
const supabaseUrl = 'https://gwdbvsruaazcwwkzmmdr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZGJ2c3J1YWF6Y3d3a3ptbWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTMxMzMsImV4cCI6MjA1NDY4OTEzM30.02DIsfee8mN4T_EHLtEVaIuO0uoxBWX_S23eMhHmCCY';

// Define supported currencies with their symbols and localization settings
// This allows the app to properly format monetary values based on user preferences
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

/**
 * Formats a numeric value into the specified currency and language format
 * 
 * @param value - The numeric value to format
 * @param currencyCode - Currency code (MAD, EUR, USD)
 * @param language - Language code for localization (en, fr, ar)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currencyCode: keyof typeof supportedCurrencies = 'MAD', language = 'en') => {
  // Get currency configuration or default to MAD if not supported
  const currency = supportedCurrencies[currencyCode] || supportedCurrencies.MAD;
  
  // Get locale based on language or default to en-US
  const locale = currency.locales[language as keyof typeof currency.locales] || 'en-US';
  
  // Use Intl.NumberFormat for standardized currency formatting
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode === 'MAD' ? 'MAD' : currencyCode,
    currencyDisplay: 'symbol'
  }).format(value);
};

// Initialize Supabase client with persistent authentication
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true  // Keep user logged in between page refreshes
  },
  global: {
    fetch: fetch  // Use the browser's fetch implementation
  }
});

/**
 * Fetches organizations with improved error handling
 * 
 * @returns Promise resolving to array of organizations
 */
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
    throw error;  // Re-throw to allow handling at call site
  }
};

/**
 * Execute raw SQL queries safely through RPC
 * Used because Supabase JS client doesn't expose raw query method directly
 * 
 * @param query - SQL query string
 * @param params - Array of parameters for the query
 * @returns Query result or error
 */
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

// Self-executing function to initialize storage buckets when client is loaded
(async () => {
  try {
    // Try to create a 'public' bucket for storing images and files
    try {
      const { data, error } = await supabase.storage.createBucket('public', {
        public: true,  // Allow public access to files
        fileSizeLimit: 5 * 1024 * 1024, // 5MB size limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] // Restrict file types
      });
      
      if (!error) {
        console.log('Public storage bucket created successfully');
      }
    } catch (bucketError) {
      // Bucket might already exist or we don't have permissions to create it
      // This is a normal condition if the bucket already exists
      console.log('Note: Could not create public bucket, it might already exist.');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
})();
