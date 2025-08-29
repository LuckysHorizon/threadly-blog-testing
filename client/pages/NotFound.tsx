import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-brand-500 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Stars */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.4) 50%, transparent 51%), radial-gradient(2px 2px at 200px 120px, rgba(255,255,255,0.4) 50%, transparent 51%), radial-gradient(2px 2px at 340px 80px, rgba(255,255,255,0.4) 50%, transparent 51%)" }} />

      <div className="relative text-center px-6">
        <div className="mb-8">
          <span className="inline-block text-7xl sm:text-8xl font-extrabold text-white tracking-wider drop-shadow-[0_0_20px_rgba(168,85,247,0.35)] animate-bounce">4</span>
          <span className="inline-block text-7xl sm:text-8xl font-extrabold text-brand-400 animate-pulse mx-2">0</span>
          <span className="inline-block text-7xl sm:text-8xl font-extrabold text-white tracking-wider drop-shadow-[0_0_20px_rgba(168,85,247,0.35)] animate-bounce" style={{ animationDelay: "0.2s" }}>4</span>
        </div>
        <p className="text-gray-300 text-lg sm:text-xl max-w-xl mx-auto mb-8">Oops! The page you’re looking for doesn’t exist or has moved.</p>
        <Link to="/" className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-glow hover:from-brand-600 hover:to-purple-700 transition">Go Home</Link>

        {/* Floating ghost */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 sm:-top-16 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl shadow-glass-lg animate-[float_3s_ease-in-out_infinite]" />
      </div>

      <style>
        {`@keyframes float { 0%,100%{ transform: translate(-50%,0) } 50%{ transform: translate(-50%,-10px) } }`}
      </style>
    </div>
  );
};

export default NotFound;
