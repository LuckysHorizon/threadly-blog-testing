import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase, signUpWithEmail, signInWithEmail, signInWithProvider as supabaseSignInWithProvider, signOut as supabaseSignOut } from "../lib/supabase";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { apiFetch } from "../lib/api";

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
  isInitializing: boolean;
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

// Helper: convert Supabase user; role will be overridden from server
const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
  const userMetadata = supabaseUser.user_metadata || {};

  return {
    id: supabaseUser.id,
    name: userMetadata.name || userMetadata.full_name || 'User',
    username: userMetadata.username || userMetadata.preferred_username || supabaseUser.email?.split('@')[0] || 'user',
    email: supabaseUser.email || '',
    avatar: userMetadata.avatar_url || userMetadata.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
    role: 'user',
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

async function fetchServerMe(): Promise<Partial<User> & { role?: string }> {
  const resp = await apiFetch('/api/auth/me');
  if (!resp.ok) throw new Error('Failed to fetch user from server');
  const json = await resp.json();
  return json?.data || {};
}

// Sync user with Prisma database, ensuring role consistency
async function syncUserWithPrisma(supabaseUser: SupabaseUser, accessToken: string): Promise<User> {
  try {
    // First, try to get the user from our server (which handles Prisma sync)
    const serverUser = await fetchServerMe();
    
    // Convert Supabase user to our User format
    const userMetadata = supabaseUser.user_metadata || {};
    const supabaseRole = supabaseUser.app_metadata?.role?.toString().toUpperCase();
    const isAdminEmail = supabaseUser.email === 'admin@threadly.com';
    
    // Determine the correct role
    const correctRole = (supabaseRole === 'ADMIN' || isAdminEmail) ? 'admin' : 'user';
    
    // If we have server data, use it and ensure role is correct
    if (serverUser && serverUser.id) {
      const normalizedRole = serverUser.role?.toString().toUpperCase() === 'ADMIN' ? 'admin' : 'user';
      
      return {
        id: serverUser.id as string,
        name: (serverUser.name as string) || userMetadata.name || userMetadata.full_name || 'User',
        username: (serverUser.username as string) || userMetadata.username || userMetadata.preferred_username || supabaseUser.email?.split('@')[0] || 'user',
        email: supabaseUser.email || '',
        avatar: (serverUser.avatar as string) || userMetadata.avatar_url || userMetadata.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
        role: correctRole, // Always use the correct role from Supabase
        bio: (serverUser.bio as string) || userMetadata.bio || '',
        socialLinks: {
          twitter: (serverUser.twitter as string) || userMetadata.twitter,
          github: (serverUser.github as string) || userMetadata.github,
          linkedin: (serverUser.linkedin as string) || userMetadata.linkedin,
        },
        joinedAt: serverUser.createdAt ? new Date(serverUser.createdAt as string).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        articlesCount: (serverUser.articlesCount as number) || 0,
        followersCount: (serverUser.followersCount as number) || 0,
        provider: supabaseUser.app_metadata?.provider || 'email',
      };
    }
    
    // If no server data, create a basic user object (server will handle Prisma creation)
    return {
      id: supabaseUser.id,
      name: userMetadata.name || userMetadata.full_name || 'User',
      username: userMetadata.username || userMetadata.preferred_username || supabaseUser.email?.split('@')[0] || 'user',
      email: supabaseUser.email || '',
      avatar: userMetadata.avatar_url || userMetadata.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
      role: correctRole,
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
  } catch (error) {
    console.warn('Failed to sync with Prisma, using Supabase data only:', error);
    
    // Fallback to basic Supabase data
    const userMetadata = supabaseUser.user_metadata || {};
    const supabaseRole = supabaseUser.app_metadata?.role?.toString().toUpperCase();
    const isAdminEmail = supabaseUser.email === 'admin@threadly.com';
    const correctRole = (supabaseRole === 'ADMIN' || isAdminEmail) ? 'admin' : 'user';
    
    return {
      id: supabaseUser.id,
      name: userMetadata.name || userMetadata.full_name || 'User',
      username: userMetadata.username || userMetadata.preferred_username || supabaseUser.email?.split('@')[0] || 'user',
      email: supabaseUser.email || '',
      avatar: userMetadata.avatar_url || userMetadata.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.id}`,
      role: correctRole,
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
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

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
          try {
            if (session.access_token) {
              const nextUser = await syncUserWithPrisma(session.user, session.access_token);
              setUser(nextUser);
              if (process.env.NODE_ENV === 'development') {
                console.log('🔐 Initial session restored:', nextUser.email, nextUser.role);
              }
            } else {
              // Fallback if no access token
              const nextUser = convertSupabaseUser(session.user);
              setUser(nextUser);
            }
          } catch (e) {
            console.warn('User sync failed:', e);
            // Fallback to basic conversion
            const nextUser = convertSupabaseUser(session.user);
            setUser(nextUser);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Auth state changed:', event, session?.user?.email);
        }
        
        if (session?.user) {
          try {
            if (session.access_token) {
              const nextUser = await syncUserWithPrisma(session.user, session.access_token);
              setUser(nextUser);
              
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ User signed in:', nextUser.email, nextUser.role);
              }
              
              // Handle redirects based on authentication event and user role
              if (event === 'SIGNED_IN') {
                // Only redirect on explicit sign in, not on initial load or token refresh
                const currentPath = window.location.pathname;
                if (nextUser.role === 'admin') {
                  // Don't auto-redirect admin users - let them choose where to go
                  // They can use the Dashboard button in nav or admin greeting
                } else if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
                  // If user is not admin but on admin page, redirect to home
                  window.location.href = '/';
                }
              }
            } else {
              // Fallback if no access token
              const nextUser = convertSupabaseUser(session.user);
              setUser(nextUser);
            }
          } catch (e) {
            console.warn('User sync failed:', e);
            // Fallback to basic conversion
            const nextUser = convertSupabaseUser(session.user);
            setUser(nextUser);
          }
        } else {
          setUser(null);
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ User signed out');
          }
          // If user signs out and is on admin page, redirect to home
          const currentPath = window.location.pathname;
          if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
            window.location.href = '/';
          }
        }
        setIsInitializing(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Always authenticate through Supabase
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
    isInitializing,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
