import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { apiFetch } from '../lib/api';

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          return;
        }

        if (data.session) {
          // Get user role from server to ensure accuracy
          try {
            const response = await apiFetch('/api/auth/me');
            
            if (response.ok) {
              const userData = await response.json();
              const userRole = userData.data?.role;
              
              if (userRole === 'ADMIN') {
                navigate('/admin');
              } else {
                navigate('/');
              }
            } else {
              // Fallback to client-side role check
              const role = data.session.user.app_metadata?.role;
              if (role === 'ADMIN') {
                navigate('/admin');
              } else {
                navigate('/');
              }
            }
          } catch (serverError) {
            console.warn('Server role check failed, using client-side fallback:', serverError);
            // Fallback to client-side role check
            const role = data.session.user.app_metadata?.role;
            if (role === 'ADMIN') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          }
        } else {
          // No session, redirect to login
          navigate('/');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Auth callback error:', err);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
