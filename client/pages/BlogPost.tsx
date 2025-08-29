import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  User,
  ChevronRight,
  ThumbsUp,
  Reply,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/BlogCard";
import { getAuthorById } from "@/lib/mockData";
import { usePosts } from "@/contexts/PostsContext";
import { useComments } from "@/contexts/CommentsContext";
import { useAuth } from "@/contexts/AuthContext";

export default function BlogPost() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comment, setComment] = useState("");

  const { posts } = usePosts();
  const post = posts.find((p) => p.id === id) || posts[0];
  const author = getAuthorById(post.authorId);
  const relatedPosts = posts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  // If author not found, show error
  if (!author) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Author Not Found
          </h1>
          <p className="text-gray-400 mb-8">
            The author of this post could not be found.
          </p>
          <Link to="/blogs">
            <Button className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0">
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { comments, getByBlogId, addComment } = useComments();
  const blogComments = useMemo(() => getByBlogId(post.id), [comments, post.id, getByBlogId]);

  // Mock comments data (removed)
  const mockComments = [
    {
      id: "1",
      author: "Alice Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=50&h=50&fit=crop&crop=face",
      content:
        "This is an excellent breakdown of AI trends! The insights about machine learning applications are particularly valuable.",
      timestamp: "2 hours ago",
      likes: 12,
      replies: [
        {
          id: "1-1",
          author: "Bob Wilson",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
          content:
            "I completely agree. The healthcare applications mentioned are already showing real results.",
          timestamp: "1 hour ago",
          likes: 5,
        },
      ],
    },
    {
      id: "2",
      author: "Carlos Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      content:
        "Great article! I'd love to see more content about the ethical implications of these AI advancements.",
      timestamp: "4 hours ago",
      likes: 8,
      replies: [],
    },
  ];

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    navigator.share?.({
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/blogs">
            <Button
              variant="outline"
              className="glass-button text-white border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <article className="glass-card p-8 mb-8">
          {/* Category Badge */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="glass-button text-xs font-medium text-brand-400 px-3 py-1">
              {post.category}
            </span>
            {post.featured && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                ✨ Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Author and Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-12 h-12 rounded-full border-2 border-white/20"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-semibold">{author.name}</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      author.role === "admin"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {author.role}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">@{author.username}</p>
                <div className="flex items-center text-gray-400 text-sm space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {post.publishedAt}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Article Actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-4 text-gray-400 text-sm">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {post.stats.views.toLocaleString()}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.stats.comments}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  className={`glass-button ${isLiked ? "text-red-400 border-red-400/30" : "text-gray-300 border-white/20"} hover:bg-white/10`}
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                  />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmark}
                  className={`glass-button ${isBookmarked ? "text-yellow-400 border-yellow-400/30" : "text-gray-300 border-white/20"} hover:bg-white/10`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="glass-button text-gray-300 border-white/20 hover:bg-white/10"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden rounded-2xl mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              {post.excerpt}
            </p>

            {/* Mock article content */}
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>
                Artificial Intelligence continues to reshape our world at an
                unprecedented pace. From healthcare diagnostics to autonomous
                vehicles, AI applications are becoming increasingly
                sophisticated and integral to our daily lives. This
                comprehensive exploration delves into the latest developments
                and their far-reaching implications.
              </p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">
                The Current Landscape
              </h2>

              <p>
                The AI landscape in 2024 is characterized by several key trends
                that are driving innovation across industries. Machine learning
                models have become more efficient and accessible, while new
                architectures continue to push the boundaries of what's
                possible.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">
                Key Developments
              </h3>

              <ul className="space-y-2 text-gray-300">
                <li>
                  • Advanced neural network architectures with improved
                  efficiency
                </li>
                <li>• Enhanced natural language processing capabilities</li>
                <li>
                  • Breakthrough applications in computer vision and robotics
                </li>
                <li>
                  • Integration of AI in healthcare and scientific research
                </li>
              </ul>

              <blockquote className="border-l-4 border-brand-500 pl-6 my-8 italic text-gray-300">
                "The future of AI lies not just in technological advancement,
                but in our ability to harness these tools responsibly and
                ethically for the benefit of humanity."
              </blockquote>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">
                Looking Forward
              </h2>

              <p>
                As we look toward the future, the potential applications of AI
                continue to expand. From climate change solutions to space
                exploration, artificial intelligence is poised to play a crucial
                role in addressing some of humanity's greatest challenges.
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-white/10">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="glass-button text-xs font-medium text-brand-400 px-3 py-1"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Comments ({blogComments.length})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <div className="mb-8">
              <div className="flex items-start space-x-4">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full border border-white/20"
                />
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-xl resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">
                      Be respectful and constructive in your comments
                    </p>
                    <Button
                      disabled={!comment.trim()}
                      onClick={() => {
                        if (!user) return;
                        addComment({ blogId: post.id, authorId: user.id, content: comment });
                        setComment("");
                      }}
                      className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0"
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-gray-300 mb-4">
                Sign in to join the conversation
              </p>
              <Button className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0">
                Sign In
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {blogComments.map((c) => {
              const cAuthor = getAuthorById(c.authorId);
              return (
              <div key={c.id} className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={cAuthor?.avatar}
                    alt={cAuthor?.name}
                    className="w-10 h-10 rounded-full border border-white/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-white font-medium">{cAuthor?.name}</p>
                      <span className="text-gray-400 text-sm">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "approved" ? "bg-green-500/20 text-green-400" : c.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-3">{c.content}</p>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-gray-400 hover:text-brand-400 transition-colors duration-200">
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors duration-200">
                        <Reply className="h-4 w-4" />
                        <span className="text-sm">Reply</span>
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors duration-200">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );})}
          </div>
        </div>

        {/* Related Articles */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <BlogCard
                key={relatedPost.id}
                post={relatedPost}
                variant="compact"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
