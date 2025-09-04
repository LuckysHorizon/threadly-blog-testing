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

async function fetchServerMe(accessToken: string): Promise<Partial<User> & { role?: string }> {
  const resp = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });
  if (!resp.ok) throw new Error('Failed to fetch user from server');
  const json = await resp.json();
  return json?.data || {};
}

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
          let nextUser = convertSupabaseUser(session.user);
          try {
            if (session.access_token) {
              const serverUser = await fetchServerMe(session.access_token);
              if (serverUser.role) {
                const roleNorm = serverUser.role.toString().toUpperCase() === 'ADMIN' ? 'admin' : 'user';
                nextUser = { ...nextUser, role: roleNorm };
              }
              if (serverUser.name) nextUser.name = serverUser.name as string;
              if (serverUser.avatar) nextUser.avatar = serverUser.avatar as string;
              if (serverUser.username) nextUser.username = serverUser.username as string;
            }
          } catch (e) {
            console.warn('Server role sync failed:', e);
          }
          setUser(nextUser);
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
          let nextUser = convertSupabaseUser(session.user);
          try {
            if (session.access_token) {
              const serverUser = await fetchServerMe(session.access_token);
              if (serverUser.role) {
                const roleNorm = serverUser.role.toString().toUpperCase() === 'ADMIN' ? 'admin' : 'user';
                nextUser = { ...nextUser, role: roleNorm };
              }
              if (serverUser.name) nextUser.name = serverUser.name as string;
              if (serverUser.avatar) nextUser.avatar = serverUser.avatar as string;
              if (serverUser.username) nextUser.username = serverUser.username as string;
            }
          } catch (e) {
            console.warn('Server role sync failed:', e);
          }
          setUser(nextUser);
          if (nextUser.role === 'admin') {
            try { window.location.replace('/admin'); } catch {}
          }
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
      // Env-based hardcoded admin login (requested)
      const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';
      const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';
      const ADMIN_NAME = import.meta.env.VITE_ADMIN_NAME || 'Administrator';
      const ADMIN_AVATAR =
        import.meta.env.VITE_ADMIN_AVATAR ||
        'https://api.dicebear.com/7.x/avataaars/svg?seed=admin';

      if (ADMIN_EMAIL && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser: User = {
          id: 'admin-local',
          name: ADMIN_NAME,
          username: 'admin',
          email: ADMIN_EMAIL,
          avatar: ADMIN_AVATAR,
          role: 'admin',
          bio: 'Administrator',
          socialLinks: {},
          joinedAt: new Date().toISOString().split('T')[0],
          articlesCount: 0,
          followersCount: 0,
          provider: 'email',
        };
        setUser(adminUser);
        localStorage.setItem('aiblog_user', JSON.stringify(adminUser));
        // Optional redirect
        try { window.location.replace('/admin'); } catch {}
        return;
      }

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
