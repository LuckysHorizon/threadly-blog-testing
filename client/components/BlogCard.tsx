import { Clock, User, ArrowRight, Eye, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  readTime: string;
  category: string;
  coverImage: string;
  tags: string[];
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
  featured?: boolean;
}

interface BlogCardProps {
  post: BlogPost;
  variant?: "default" | "featured" | "compact";
}

export default function BlogCard({ post, variant = "default" }: BlogCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (variant === "featured") {
    return (
      <article className="group relative glass-card overflow-hidden hover:shadow-glass-lg transition-all duration-500 hover:-translate-y-1">
        {/* Cover Image */}
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="glass-button text-xs font-medium text-white px-3 py-1">
              {post.category}
            </span>
          </div>

          {/* Featured Badge */}
          {post.featured && (
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                ✨ Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-400 transition-colors duration-300 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-300 mb-4 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Author & Meta */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-8 h-8 rounded-full border border-white/20"
              />
              <div>
                <p className="text-white text-sm font-medium">{post.author}</p>
                <div className="flex items-center text-gray-400 text-xs space-x-2">
                  <span>{post.publishedAt}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-gray-400 text-sm">
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {formatNumber(post.stats.views)}
              </span>
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {formatNumber(post.stats.likes)}
              </span>
              <span className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                {formatNumber(post.stats.comments)}
              </span>
            </div>

            <Button
              size="sm"
              className="glass-button group-hover:bg-brand-500 group-hover:text-white transition-all duration-300"
            >
              Read More
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group glass-card p-4 hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex space-x-4">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-20 h-20 rounded-xl object-cover"
          />
          
          <div className="flex-1 min-w-0">
            <span className="text-xs text-brand-400 font-medium">{post.category}</span>
            <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2 group-hover:text-brand-400 transition-colors duration-300">
              {post.title}
            </h4>
            <div className="flex items-center text-xs text-gray-400 space-x-2">
              <span>{post.author}</span>
              <span>•</span>
              <span>{post.publishedAt}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article className="group glass-card overflow-hidden hover:shadow-glass-lg transition-all duration-500 hover:-translate-y-1">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        
        <div className="absolute top-3 left-3">
          <span className="glass-button text-xs font-medium text-white px-2 py-1">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors duration-300 line-clamp-2">
          {post.title}
        </h3>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Author & Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="w-6 h-6 rounded-full border border-white/20"
            />
            <div>
              <p className="text-white text-xs font-medium">{post.author}</p>
              <div className="flex items-center text-gray-400 text-xs space-x-1">
                <span>{post.publishedAt}</span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-gray-400 text-xs">
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {formatNumber(post.stats.views)}
            </span>
            <span className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              {formatNumber(post.stats.likes)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
