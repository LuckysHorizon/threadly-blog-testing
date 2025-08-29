import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  User,
  LogIn,
  Sparkles,
  LogOut,
  Settings,
  Edit,
  PlusCircle,
} from "lucide-react";
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
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Blogs", href: "/blogs" },
    { name: "Categories", href: "/categories" },
    { name: "Authors", href: "/authors" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <nav
        className={`fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          isScrolled ? "glass-nav shadow-glass-lg" : "glass-nav"
        }`}
        style={{
          width: "calc(100% - 1rem)",
          maxWidth: "1200px",
          // Ensure proper spacing on mobile
          margin: "0 0.5rem",
        }}
      >
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 group flex-shrink-0"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-purple-400 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative p-0.5 sm:p-1 rounded-xl bg-white/5 border border-white/10">
                <img
                  src={
                    "https://cdn.builder.io/api/v1/image/assets%2F945110ca98a745c1b72f359aa559f018%2F0cb2dab15ff946b9ac7237fb5eb05818?format=webp&width=128"
                  }
                  alt="Threadly logo"
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg object-contain"
                />
              </div>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gradient">
              Threadly
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 ${
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search Button - Desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center space-x-2 glass-button text-gray-300 hover:text-white px-3 py-2"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm hidden lg:inline">Search</span>
            </Button>

            {/* Write Button - For authenticated users */}
            {isAuthenticated && (
              <Link to="/write">
                <Button
                  size="sm"
                  className="hidden sm:flex bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-glow px-3 py-2"
                >
                  <Edit className="h-4 w-4 mr-1.5" />
                  <span className="hidden lg:inline">Write</span>
                </Button>
              </Link>
            )}

            {/* AI Features Indicator - Only on larger screens */}
            <div className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-brand-500/20 to-purple-500/20 border border-brand-400/30">
              <Sparkles className="h-3 w-3 text-brand-400 animate-pulse" />
              <span className="text-xs text-brand-300 font-medium">
                AI Powered
              </span>
            </div>

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="glass-button text-gray-300 hover:text-white flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-2"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/20"
                  />
                  <span className="hidden sm:inline text-sm max-w-20 lg:max-w-none truncate">
                    {user.name}
                  </span>
                </Button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-52 glass-card py-2 z-50 shadow-glass-lg">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-white text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {user.email}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                          user.role === "admin"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/write"
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200 sm:hidden"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Edit className="h-4 w-4 mr-3" />
                      Write Article
                    </Link>

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

                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Sparkles className="h-4 w-4 mr-3" />
                        Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-white/10 mt-2 pt-2">
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
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="glass-button text-gray-300 hover:text-white px-2 sm:px-3 py-2"
                  onClick={() => setIsSignInModalOpen(true)}
                >
                  <LogIn className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline text-sm">Sign In</span>
                </Button>

                <Button
                  size="sm"
                  className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0 shadow-glow px-2 sm:px-3 py-2"
                  onClick={() => setIsSignInModalOpen(true)}
                >
                  <User className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline text-sm">Get Started</span>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden glass-button p-2"
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
          <div className="lg:hidden border-t border-white/10 mt-2">
            <div className="px-3 sm:px-6 py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
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
                className="w-full justify-start px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4 mr-3" />
                Search Articles
              </Button>

              {/* Mobile Write Button - Only for authenticated users */}
              {isAuthenticated && (
                <Link to="/write" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 mt-3">
                    <PlusCircle className="h-4 w-4 mr-3" />
                    Write New Article
                  </Button>
                </Link>
              )}

              {/* Mobile Auth Buttons - Only for non-authenticated users */}
              {!isAuthenticated && (
                <div className="pt-3 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full glass-button text-white border-white/20 hover:bg-white/10"
                    onClick={() => {
                      setIsSignInModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0"
                    onClick={() => {
                      setIsSignInModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
}
