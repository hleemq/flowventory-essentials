
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

// Create a helper function to format currency values
export const formatCurrency = (value: number, currency = 'MAD') => {
  const curr = supportedCurrencies[currency as keyof typeof supportedCurrencies];
  if (curr.symbol === 'MAD') {
    return `${value} ${curr.symbol}`;
  } else {
    return `${curr.symbol} ${value}`;
  }
};

export const supabase = createClient(supabaseUrl, supabaseKey);
