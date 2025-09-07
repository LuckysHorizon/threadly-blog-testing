import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  BookOpen,
  Brain,
  Zap,
  Globe,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/BlogCard";
import { mockCategories } from "@/lib/mockData";
import { usePosts } from "@/contexts/PostsContext";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard } from "lucide-react";

export default function Index() {
  const [typedText, setTypedText] = useState("");
  const fullText = "The Future of AI Content";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const { posts } = usePosts();
  const { user, isAuthenticated } = useAuth();
  const featuredPosts = posts.filter((post) => post.featured);
  const latestPosts = posts.filter((post) => !post.featured).slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Hero Badge */}
            <div className="inline-flex items-center space-x-2 glass-nav mb-6 sm:mb-8 animate-float px-3 py-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-brand-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-300">
                Powered by Advanced AI Technology
              </span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="text-white block">Discover</span>
              <span className="text-gradient block min-h-[1.2em]">
                {typedText}
              </span>
              <span className="text-white block">Today</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
              Explore cutting-edge insights, tutorials, and breakthrough
              discoveries in artificial intelligence. Join thousands of
              researchers, developers, and AI enthusiasts shaping the future.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-12 sm:mb-16 px-4 sm:px-0">
              <Link to="/blogs">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0 shadow-glow px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                >
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Start Reading
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto glass-button px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white border-white/20 hover:bg-white/10"
              >
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Explore AI Tools
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl sm:max-w-3xl mx-auto px-4 sm:px-0">
              {[
                { icon: Users, label: "Active Readers", value: "50,000+" },
                {
                  icon: BookOpen,
                  label: "Articles Published",
                  value: "1,200+",
                },
                { icon: Globe, label: "Countries Reached", value: "120+" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-brand-500/20 to-purple-500/20 rounded-xl mb-2 sm:mb-3">
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Admin Greeting Section */}
      {isAuthenticated && user?.role === 'admin' && (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card p-6 sm:p-8 text-center animate-fade-in">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full mr-4">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Welcome Admin 👋
                </h2>
              </div>
              <p className="text-gray-300 mb-6 text-base sm:text-lg">
                Manage your Threadly platform and oversee content moderation
              </p>
              <Link to="/admin">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-glow px-6 py-3 text-base font-semibold"
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Articles Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Featured Articles
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Handpicked stories from our top contributors
              </p>
            </div>

            <Button
              variant="outline"
              className="glass-button text-white border-white/20 hover:bg-white/10 self-start sm:self-auto px-4 py-2 text-sm"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <BlogCard key={post.id} post={post} variant="featured" />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Explore by Category
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Dive deep into specific areas of AI and machine learning with our
              curated collections
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {mockCategories.map((category, index) => (
              <Link
                key={index}
                to={`/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group glass-card p-4 sm:p-6 text-center hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r ${category.color} mx-auto mb-2 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-brand-400 transition-colors duration-300 text-xs sm:text-sm lg:text-base leading-tight">
                  {category.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  {category.count} articles
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Latest Articles
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Stay updated with the newest insights and discoveries
              </p>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                className="glass-button text-white border-white/20 hover:bg-white/10 px-3 py-2 text-sm"
              >
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
              <Button
                variant="outline"
                className="glass-button text-white border-white/20 hover:bg-white/10 px-3 py-2 text-sm"
              >
                <TrendingUp className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Trending</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12 px-4 sm:px-0">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0 shadow-glow px-6 sm:px-8 py-3 text-base sm:text-lg"
            >
              Load More Articles
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card text-center p-6 sm:p-8 lg:p-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-brand-500 to-purple-500 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">
              Stay Ahead of the AI Revolution
            </h2>

            <p className="text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
              Get weekly insights, breaking news, and exclusive content
              delivered directly to your inbox. Join 25,000+ AI enthusiasts who
              trust our newsletter.
            </p>

            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-center sm:space-y-0 sm:space-x-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-xl text-sm sm:text-base"
              />
              <Button className="w-full sm:w-auto bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0 px-6 py-3 whitespace-nowrap text-sm sm:text-base">
                Subscribe
              </Button>
            </div>

            <p className="text-xs text-gray-400 mt-3 sm:mt-4">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
