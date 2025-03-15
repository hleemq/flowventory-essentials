
/**
 * Utility functions for formatting data consistently across the application
 * Supports multiple currencies (MAD, EUR, USD) and languages (ar, fr, en)
 */

export type SupportedCurrency = "MAD" | "EUR" | "USD";
export type SupportedLanguage = "ar" | "fr" | "en";

interface CurrencyConfig {
  locale: string;
  options: Intl.NumberFormatOptions;
}

const currencyConfigs: Record<SupportedCurrency, CurrencyConfig> = {
  MAD: {
    locale: "ar-MA",
    options: { style: "currency", currency: "MAD" }
  },
  EUR: {
    locale: "fr-FR",
    options: { style: "currency", currency: "EUR" }
  },
  USD: {
    locale: "en-US",
    options: { style: "currency", currency: "USD" }
  }
};

/**
 * Format a number as currency based on the provided currency code and language
 * @param amount The amount to format
 * @param currency The currency code (MAD, EUR, USD)
 * @param language The language code (ar, fr, en)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  currency: SupportedCurrency = "MAD", 
  language: SupportedLanguage = "en"
): string {
  const config = currencyConfigs[currency];
  
  // Determine locale based on language and currency
  let locale = config.locale;
  if (language === "ar") {
    locale = "ar-MA";
  } else if (language === "fr") {
    locale = "fr-FR";
  } else if (language === "en") {
    locale = "en-US";
  }

  return new Intl.NumberFormat(locale, config.options).format(amount);
}

/**
 * Format a date based on the provided language
 * @param date The date to format
 * @param language The language code (ar, fr, en)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string, 
  language: SupportedLanguage = "en"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  let locale = "en-US";
  if (language === "ar") {
    locale = "ar-MA";
  } else if (language === "fr") {
    locale = "fr-FR";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(dateObj);
}
