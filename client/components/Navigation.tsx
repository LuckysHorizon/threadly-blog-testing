import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, User, LogIn, Brain, Sparkles, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SignInModal from "./SignInModal";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Blogs", href: "/blogs" },
    { name: "Categories", href: "/categories" },
    { name: "Authors", href: "/authors" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        isScrolled ? "glass-nav shadow-glass-lg" : "glass-nav"
      }`}
      style={{ width: "calc(100% - 2rem)", maxWidth: "1200px" }}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-purple-400 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-r from-brand-500 to-purple-500 p-2 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-gradient">AI Blog</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 ${
                location.pathname === item.href
                  ? "text-brand-400 bg-white/5"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex items-center space-x-2 glass-button text-gray-300 hover:text-white"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Search</span>
          </Button>

          {/* AI Features Indicator */}
          <div className="hidden lg:flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r from-brand-500/20 to-purple-500/20 border border-brand-400/30">
            <Sparkles className="h-3 w-3 text-brand-400 animate-pulse" />
            <span className="text-xs text-brand-300 font-medium">AI Powered</span>
          </div>

          {/* Auth Section */}
          {isAuthenticated && user ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="glass-button text-gray-300 hover:text-white flex items-center space-x-2"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-white/20"
                />
                <span className="hidden sm:inline">{user.name}</span>
              </Button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-card py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                      user.role === 'admin'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Brain className="h-4 w-4 mr-3" />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      signOut();
                      setIsUserMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="glass-button text-gray-300 hover:text-white"
                onClick={() => setIsSignInModalOpen(true)}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>

              <Button
                size="sm"
                className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0 shadow-glow"
                onClick={() => setIsSignInModalOpen(true)}
              >
                <User className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden glass-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-300" />
            ) : (
              <Menu className="h-5 w-5 text-gray-300" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10">
          <div className="flex flex-col space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === item.href
                    ? "text-brand-400 bg-white/5"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Search */}
            <Button
              variant="ghost"
              className="justify-start px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5"
            >
              <Search className="h-4 w-4 mr-3" />
              Search
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
