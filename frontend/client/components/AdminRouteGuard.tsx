import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait for auth to finish loading
      if (isLoading) {
        return;
      }

      // If not authenticated, redirect to home
      if (!isAuthenticated) {
        navigate('/', { replace: true });
        return;
      }

      // If user exists but is not admin, redirect to home
      if (user && user.role !== 'admin') {
        navigate('/', { replace: true });
        return;
      }

      // If we get here, user is authenticated and is admin
      setIsChecking(false);
    };

    checkAdminAccess();
  }, [user, isLoading, isAuthenticated, navigate]);

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated or not admin, don't render children
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  // User is authenticated and is admin, render the protected content
  return <>{children}</>;
}
