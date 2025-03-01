import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Dashboard, Index, Inventory, Orders, Products, Customers, Warehouses, UserManagement, Settings, NotFound } from "@/pages";
import { Sidebar } from "@/components/sidebar";
import { SiteHeader } from "@/components/site-header";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Shell } from "@/components/shell";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/toaster"

// Add the RecycleBin import
import RecycleBin from "./pages/RecycleBin";
import Items from "./pages/Items";

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex flex-1">
            <Sidebar className="w-64 border-r py-4" />
            <Shell className="ml-64 py-12">
              <Suspense fallback={<div>Loading...</div>}>
                {/* Update the Routes to include the RecycleBin route */}
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/inventory/items" element={<Items />} />
                  <Route path="/recycle-bin" element={<RecycleBin />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/warehouses" element={<Warehouses />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Shell>
          </main>
          <Toaster />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
