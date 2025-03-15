
/**
 * Authentication Service
 * Provides secure authentication methods with improved error handling and validation
 */
import { supabase } from './client-optimized';
import { toast } from 'sonner';

// Regular expressions for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

// Types for authentication
interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface LoginData {
  email: string;
  password: string;
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns Boolean indicating if email is valid
 */
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Boolean indicating if password meets security requirements
 */
function isStrongPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

/**
 * Sign up a new user with improved validation and error handling
 * @param data - User signup data
 * @returns Result object with user data or error
 */
export async function signUp(data: SignUpData) {
  try {
    // Input validation
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      throw new Error('All fields are required');
    }
    
    if (!isValidEmail(data.email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (!isStrongPassword(data.password)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, and numbers');
    }
    
    // Proceed with signup
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role || 'user'
        }
      }
    });
    
    if (error) throw error;
    
    toast.success('Successfully signed up! Please check your email for verification.');
    
    return {
      success: true,
      user: authData.user
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Format user-friendly error messages
    let errorMessage = 'Failed to sign up';
    
    if (error.message.includes('User already registered')) {
      errorMessage = 'An account with this email already exists';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Log in a user with improved validation and error handling
 * @param data - Login credentials
 * @returns Result object with session data or error
 */
export async function login(data: LoginData) {
  try {
    // Input validation
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }
    
    if (!isValidEmail(data.email)) {
      throw new Error('Please enter a valid email address');
    }
    
    // Proceed with login
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    
    if (error) throw error;
    
    toast.success('Successfully logged in!');
    
    return {
      success: true,
      session: authData.session,
      user: authData.user
    };
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Format user-friendly error messages
    let errorMessage = 'Failed to log in';
    
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Invalid email or password';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Please verify your email before logging in';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Log out the current user with improved error handling
 * @returns Result object indicating success or failure
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    toast.success('Successfully logged out!');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Logout error:', error);
    toast.error('Failed to log out');
    
    return {
      success: false,
      error: error.message || 'Failed to log out'
    };
  }
}

/**
 * Request password reset with improved validation and error handling
 * @param email - User's email address
 * @returns Result object indicating success or failure
 */
export async function resetPassword(email: string) {
  try {
    // Input validation
    if (!email) {
      throw new Error('Email is required');
    }
    
    if (!isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    toast.success('Password reset link sent to your email');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Password reset error:', error);
    toast.error(error.message || 'Failed to send password reset email');
    
    return {
      success: false,
      error: error.message || 'Failed to send password reset email'
    };
  }
}

/**
 * Update user password with validation and error handling
 * @param newPassword - New password
 * @returns Result object indicating success or failure
 */
export async function updatePassword(newPassword: string) {
  try {
    // Input validation
    if (!newPassword) {
      throw new Error('New password is required');
    }
    
    if (!isStrongPassword(newPassword)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, and numbers');
    }
    
    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    toast.success('Password updated successfully');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Update password error:', error);
    toast.error(error.message || 'Failed to update password');
    
    return {
      success: false,
      error: error.message || 'Failed to update password'
    };
  }
}

/**
 * Setup auth state change listener
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(callback: (session: any) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  
  return data.subscription.unsubscribe;
}

/**
 * Get current authenticated user with full profile data
 * @returns User data with profile information
 */
export async function getCurrentUserWithProfile() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!user) return null;
    
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      // Only throw if it's not the "no rows returned" error
      throw profileError;
    }
    
    return {
      ...user,
      profile: profile || null
    };
  } catch (error) {
    console.error('Error getting user with profile:', error);
    return null;
  }
}
