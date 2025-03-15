# Inventory Management System

## Project Overview

A modern inventory management application built with React, TypeScript, and Supabase. This application allows businesses to manage their inventory, track products, handle warehouses, and monitor stock levels.

## Features

- **Multi-language Support**: Full support for English, French, and Arabic with RTL layout
- **Multi-currency Support**: Handle prices in MAD, EUR, and USD
- **Inventory Management**: Track items, stock levels, and product details
- **Warehouse Management**: Organize inventory across multiple locations
- **User Management**: Control access with role-based permissions
- **Order Processing**: Track and manage customer orders
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 16+ installed 
- npm or yarn package manager

### Installation

1. Clone the repository:
```sh
# Clone the repository using the project's Git URL
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## Environment Setup

The application uses Supabase for backend services. A development Supabase project is already configured, but for production, you should set up your own Supabase instance.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (auth, language, etc.)
├── hooks/          # Custom React hooks
├── integrations/   # External service integrations (Supabase)
├── lib/            # Utility functions
├── pages/          # Application pages/routes
├── sql/            # SQL migrations and queries
└── types/          # TypeScript type definitions
```

## Multi-language Support

The application supports English, French, and Arabic languages. Each component includes translations for all supported languages.

```typescript
// Example of translation object structure
const translations = {
  en: {
    title: "Products",
    // other translations
  },
  fr: {
    title: "Produits",
    // other translations
  },
  ar: {
    title: "المنتجات",
    // other translations
  }
};
```

## Multi-currency Support

The application supports multiple currencies (MAD, EUR, USD) with proper formatting based on the selected language.

```typescript
// Currency formatting example
import { formatCurrency } from '@/integrations/supabase/client';

// Format 100 as MAD in English
const formattedPrice = formatCurrency(100, 'MAD', 'en');
```

## Deployment

To deploy this application to production:

1. Visit your Lovable project at: https://lovable.dev/projects/c57bc873-899e-46de-8c65-cda209eaaa44
2. Click on Share -> Publish

## Custom Domain Setup

For custom domain setup, deploy to Netlify following the instructions in the [Custom domains documentation](https://docs.lovable.dev/tips-tricks/custom-domain/).

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend services powered by [Supabase](https://supabase.io/)
