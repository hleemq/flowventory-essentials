import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Notifications from './components/Notifications';
import UserManagement from "@/pages/UserManagement";

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/items" element={<Items />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/user-management" element={<UserManagement />} />
                </Routes>
                <Notifications />
              </AppLayout>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
