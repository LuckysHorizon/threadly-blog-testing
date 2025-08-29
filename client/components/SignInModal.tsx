import { useState } from "react";
import {
  X,
  Mail,
  Lock,
  Github,
  Chrome,
  Eye,
  EyeOff,
  User,
  AtSign,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "signin" | "signup" | "forgot";

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signIn, signUp, signInWithProvider, isLoading } = useAuth();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setUsername("");
    setError("");
    setSuccess("");
    setShowPassword(false);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (mode === "signin") {
        await signIn(email, password);
        setSuccess("Successfully signed in!");
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else if (mode === "signup") {
        if (!name.trim()) {
          setError("Full name is required");
          return;
        }
        if (!username.trim()) {
          setError("Username is required");
          return;
        }
        if (username.length < 3) {
          setError("Username must be at least 3 characters");
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }

        await signUp({ email, password, name, username });
        setSuccess("Account created successfully! Welcome to Threadly!");
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setError("");
    try {
      await signInWithProvider(provider);
      setSuccess(`Successfully signed in with ${provider}!`);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
    setMode("signin");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="glass-card p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {mode === "signin" && "Welcome Back"}
              {mode === "signup" && "Join Threadly"}
              {mode === "forgot" && "Reset Password"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Demo Credentials - Only show in signin mode */}
          {mode === "signin" && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-brand-500/10 to-purple-500/10 border border-brand-400/20">
              <p className="text-sm text-brand-300 font-medium mb-2">
                Demo Credentials:
              </p>
              <div className="text-xs text-gray-300 space-y-1">
                <p>
                  User: <span className="text-brand-400">user@aiblog.com</span>{" "}
                  / password123
                </p>
              </div>
            </div>
          )}

          {/* Social Sign In */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full glass-button text-white border-white/20 hover:bg-white/10"
              onClick={() => handleSocialSignIn("google")}
              disabled={isLoading}
            >
              <Chrome className="h-5 w-5 mr-3" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full glass-button text-white border-white/20 hover:bg-white/10"
              onClick={() => handleSocialSignIn("github")}
              disabled={isLoading}
            >
              <Github className="h-5 w-5 mr-3" />
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-gray-400">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name - Only in signup */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-xl"
                    placeholder="Enter your full name"
                    required={mode === "signup"}
                  />
                </div>
              </div>
            )}

            {/* Username - Only in signup */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      )
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-xl"
                    placeholder="Choose a username"
                    required={mode === "signup"}
                    minLength={3}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Only lowercase letters, numbers, and underscores allowed
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-xl"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password - Not shown in forgot mode */}
            {mode !== "forgot" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password {mode === "signup" && "(min. 6 characters)"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-xl"
                    placeholder="Enter your password"
                    required={true}
                    minLength={mode === "signup" ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0 shadow-glow py-3 font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>
                    {mode === "signin" && "Signing In..."}
                    {mode === "signup" && "Creating Account..."}
                    {mode === "forgot" && "Sending Reset Link..."}
                  </span>
                </div>
              ) : (
                <>
                  {mode === "signin" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "forgot" && "Send Reset Link"}
                </>
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {mode === "signin" && (
              <>
                <p className="text-gray-400 text-sm">
                  Don't have an account?{" "}
                  <button
                    onClick={() => handleModeChange("signup")}
                    className="text-brand-400 hover:text-brand-300 font-medium"
                  >
                    Sign Up
                  </button>
                </p>
                <p className="text-gray-400 text-sm">
                  <button
                    onClick={() => handleModeChange("forgot")}
                    className="text-brand-400 hover:text-brand-300 font-medium"
                  >
                    Forgot Password?
                  </button>
                </p>
              </>
            )}

            {mode === "signup" && (
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => handleModeChange("signin")}
                  className="text-brand-400 hover:text-brand-300 font-medium"
                >
                  Sign In
                </button>
              </p>
            )}

            {mode === "forgot" && (
              <p className="text-gray-400 text-sm">
                Remember your password?{" "}
                <button
                  onClick={() => handleModeChange("signin")}
                  className="text-brand-400 hover:text-brand-300 font-medium"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{" "}
              <a href="#" className="text-brand-400 hover:text-brand-300">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-brand-400 hover:text-brand-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
