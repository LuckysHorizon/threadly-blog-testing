import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

// Mock user database
const mockUsers = [
  {
    id: "admin-1",
    name: "Sarah Chen",
    username: "sarahchen",
    email: "admin@aiblog.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=100&h=100&fit=crop&crop=face",
    role: "admin" as const,
    bio: "AI Researcher at Stanford University, specializing in machine learning and neural networks.",
    socialLinks: {
      twitter: "https://twitter.com/sarahchen",
      github: "https://github.com/sarahchen",
    },
    joinedAt: "2023-01-15",
    articlesCount: 12,
    followersCount: 15400,
  },
  {
    id: "user-1",
    name: "Alex Rodriguez",
    username: "alexrod",
    email: "user@aiblog.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    role: "user" as const,
    bio: "Senior Data Scientist passionate about AI and machine learning.",
    socialLinks: {
      linkedin: "https://linkedin.com/in/alexrodriguez",
    },
    joinedAt: "2023-03-20",
    articlesCount: 5,
    followersCount: 890,
  },
];

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("aiblog_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("aiblog_user");
      }
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find user in mock database
      const foundUser = mockUsers.find((u) => u.email === email);

      if (!foundUser) {
        throw new Error("User not found");
      }

      // In a real app, password would be verified here
      if (password !== "password123") {
        throw new Error("Invalid password");
      }

      setUser(foundUser);
      localStorage.setItem("aiblog_user", JSON.stringify(foundUser));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check if user already exists
      const existingUser = mockUsers.find((u) => u.email === data.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Generate username if not provided
      const username = data.username || data.email.split("@")[0];

      // Check if username is taken
      const usernameExists = mockUsers.find((u) => u.username === username);
      if (usernameExists) {
        throw new Error("Username is already taken");
      }

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name || data.email.split("@")[0],
        username: username,
        email: data.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        role: "user",
        bio: "",
        socialLinks: {},
        joinedAt: new Date().toISOString().split("T")[0],
        articlesCount: 0,
        followersCount: 0,
      };

      // Add to mock database (in real app, this would be saved to backend)
      mockUsers.push(newUser);

      setUser(newUser);
      localStorage.setItem("aiblog_user", JSON.stringify(newUser));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithProvider = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      // Simulate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mock OAuth response
      const mockOAuthUser = {
        google: {
          id: `google-${Date.now()}`,
          name: "Google User",
          username: "googleuser",
          email: "user@gmail.com",
          avatar: "https://lh3.googleusercontent.com/a/default-user",
          provider: "google",
        },
        github: {
          id: `github-${Date.now()}`,
          name: "GitHub User",
          username: "githubuser",
          email: "user@github.com",
          avatar: "https://avatars.githubusercontent.com/u/1?v=4",
          provider: "github",
        },
      }[provider];

      const newUser: User = {
        ...mockOAuthUser,
        role: "user",
        bio: "",
        socialLinks: {},
        joinedAt: new Date().toISOString().split("T")[0],
        articlesCount: 0,
        followersCount: 0,
      };

      setUser(newUser);
      localStorage.setItem("aiblog_user", JSON.stringify(newUser));
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("aiblog_user", JSON.stringify(updatedUser));
    } catch (error) {
      throw new Error("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("aiblog_user");
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
