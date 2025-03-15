
/**
 * Optimized Supabase Client
 * Provides a centralized, secure connection to Supabase services
 * with improved performance, security, and error handling
 */
import { createClient } from '@supabase/supabase-js';

// Supabase connection credentials
// In production, use environment variables for these values
const supabaseUrl = 'https://gwdbvsruaazcwwkzmmdr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZGJ2c3J1YWF6Y3d3a3ptbWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTMxMzMsImV4cCI6MjA1NDY4OTEzM30.02DIsfee8mN4T_EHLtEVaIuO0uoxBWX_S23eMhHmCCY';

// Define supported currencies with their symbols and localization settings
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

// Initialize Supabase client with improved configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'Inventory-Management-System'
    },
    fetch: fetch
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Initialize storage only once at application startup
(async () => {
  try {
    // Check if public bucket exists first before trying to create it
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error checking storage buckets:', listError);
      return;
    }
    
    const publicBucketExists = buckets?.some(bucket => bucket.name === 'public');
    
    // Only create the bucket if it doesn't exist
    if (!publicBucketExists) {
      try {
        const { data, error } = await supabase.storage.createBucket('public', {
          public: true,
          fileSizeLimit: 5 * 1024 * 1024,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        });
        
        if (!error) {
          console.log('Public storage bucket created successfully');
        } else {
          console.error('Error creating storage bucket:', error);
        }
      } catch (bucketError) {
        console.log('Note: Could not create public bucket, it might already exist or require permissions.');
      }
    } else {
      console.log('Public storage bucket already exists');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
})();

/**
 * Logout user and handle any errors
 * @returns Promise with success/error status
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error during logout:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to log out' 
    };
  }
};

/**
 * Get current user session with error handling
 * @returns Current session or null
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

/**
 * Get current user with error handling
 * @returns Current user or null
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Export utility functions from db-service directly
export * from './db-service';
