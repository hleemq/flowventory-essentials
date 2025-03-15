
/**
 * Improved Authentication Context
 * Provides secure authentication state management with
 * enhanced error handling and performance
 */
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import * as AuthService from '@/integrations/supabase/auth-service';
import { handleError } from '@/lib/error-handler';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userProfile: any | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Effect for setting up auth state listener
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setLoading(false);
      
      // If session exists, fetch user profile
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });
    
    // Check current session
    AuthService.getCurrentUserWithProfile().then((userData) => {
      setUser(userData);
      setIsAuthenticated(!!userData);
      setUserProfile(userData?.profile || null);
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await AuthService.getCurrentUserWithProfile();
      
      if (error) throw error;
      
      setUserProfile(data?.profile || null);
    } catch (error) {
      handleError(error, { context: 'fetchUserProfile', userId });
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    try {
      setLoading(true);
      const userData = await AuthService.getCurrentUserWithProfile();
      
      if (userData) {
        setUser(userData);
        setUserProfile(userData.profile);
        setIsAuthenticated(true);
      }
    } catch (error) {
      handleError(error, { context: 'refreshUserData' });
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await AuthService.login({ email, password });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      navigate('/dashboard');
    } catch (error) {
      handleError(error, { context: 'login', email });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      const result = await AuthService.signUp({
        email,
        password,
        firstName,
        lastName
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      navigate('/dashboard');
    } catch (error) {
      handleError(error, { context: 'signup', email });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      const result = await AuthService.logout();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      navigate('/');
    } catch (error) {
      handleError(error, { context: 'logout' });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const result = await AuthService.resetPassword(email);
      
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      handleError(error, { context: 'resetPassword', email });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Update password function
  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      const result = await AuthService.updatePassword(newPassword);
      
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      handleError(error, { context: 'updatePassword' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isAuthenticated,
    user,
    userProfile,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    loading,
    refreshUserData
  }), [isAuthenticated, user, userProfile, loading]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
