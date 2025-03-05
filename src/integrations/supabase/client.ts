
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwdbvsruaazcwwkzmmdr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZGJ2c3J1YWF6Y3d3a3ptbWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTMxMzMsImV4cCI6MjA1NDY4OTEzM30.02DIsfee8mN4T_EHLtEVaIuO0uoxBWX_S23eMhHmCCY';

// Support for multi-currency and internationalization
export const supportedCurrencies = {
  MAD: {
    symbol: 'MAD',
    name: 'Moroccan Dirham'
  },
  EUR: {
    symbol: '€',
    name: 'Euro'
  },
  USD: {
    symbol: '$',
    name: 'US Dollar'
  }
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

// Initialize storage bucket if not exists
(async () => {
  try {
    // Check if the 'public' bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error checking storage buckets:', bucketError);
      return;
    }
    
    const publicBucketExists = buckets.some(bucket => bucket.name === 'public');
    
    if (!publicBucketExists) {
      // Create the 'public' bucket with public access
      const { error: createError } = await supabase.storage.createBucket('public', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB size limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
      
      if (createError) {
        console.error('Error creating public bucket:', createError);
      } else {
        console.log('Public storage bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
})();
