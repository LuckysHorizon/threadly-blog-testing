import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase, signUpWithEmail, signInWithEmail, signInWithProvider as supabaseSignInWithProvider, signOut as supabaseSignOut } from "../lib/supabase";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: "admin" | "user";
  bio?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  joinedAt: string;
  articlesCount: number;
  followersCount: number;
  provider?: string;
}

interface SignUpData {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signInWithProvider: (provider: "google" | "github") => Promise<void>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to convert Supabase user to our User interface
const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
  const userMetadata = supabaseUser.user_metadata || {};
  const appMetadata = supabaseUser.app_metadata || {};
  
  return {
    id: supabaseUser.id,
    name: userMetadata.name || userMetadata.full_name || 'User',
    username: userMetadata.username || userMetadata.preferred_username || supabaseUser.email?.split('@')[0] || 'user',
    email: supabaseUser.email || '',
    avatar: userMetadata.avatar_url || userMetadata.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
    role: appMetadata.role === 'admin' ? 'admin' : 'user',
    bio: userMetadata.bio || '',
    socialLinks: {
      twitter: userMetadata.twitter,
      github: userMetadata.github,
      linkedin: userMetadata.linkedin,
    },
    joinedAt: supabaseUser.created_at ? new Date(supabaseUser.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    articlesCount: 0,
    followersCount: 0,
    provider: supabaseUser.app_metadata?.provider || 'email',
  };
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session?.user) {
          setUser(convertSupabaseUser(session.user));
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(convertSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      // User state will be updated by the auth state change listener
    } catch (error) {
      throw error as Error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      if (!data.name || !data.username) {
        throw new Error("Name and username are required");
      }

      await signUpWithEmail(data.email, data.password, {
        name: data.name,
        username: data.username,
      });
      // User state will be updated by the auth state change listener
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithProvider = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      await supabaseSignInWithProvider(provider);
      // User will be redirected to OAuth provider, then to callback page
    } catch (error) {
      throw new Error(`Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          username: updates.username,
          bio: updates.bio,
          twitter: updates.socialLinks?.twitter,
          github: updates.socialLinks?.github,
          linkedin: updates.socialLinks?.linkedin,
        }
      });

      if (error) throw error;
      
      // User state will be updated by the auth state change listener
    } catch (error) {
      throw new Error("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabaseSignOut();
      // User state will be updated by the auth state change listener
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
