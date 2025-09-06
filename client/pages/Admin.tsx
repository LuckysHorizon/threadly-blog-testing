import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  FileText,
  MessageCircle,
  TrendingUp,
  Eye,
  Heart,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Clock,
  Crown,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { mockAuthors, getAuthorById, Author, BlogPost } from "@/lib/mockData";
import { usePosts } from "@/contexts/PostsContext";
import { useComments } from "@/contexts/CommentsContext";

type Tab = "overview" | "blogs" | "comments" | "users" | "analytics";

interface AdminStats {
  totalUsers: number;
  totalBlogs: number;
  pendingBlogs: number;
  publishedBlogs: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  newUsersThisMonth: number;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  blogId: string;
  blogTitle: string;
  createdAt: string;
  status: "approved" | "pending" | "rejected";
}

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { posts: blogs, updatePost, deletePost } = usePosts();
  const { comments, moderateComment, deleteComment } = useComments();
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

  const renderMarkdown = (text: string) =>
    text
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1<\/h3>',
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-bold text-white mt-5 mb-3">$1<\/h2>',
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1<\/h1>',
      )
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-bold text-white">$1<\/strong>',
      )
      .replace(/\*(.*?)\*/g, '<em class="italic">$1<\/em>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-800 px-1 py-0.5 rounded text-brand-400">$1<\/code>',
      )
      .replace(/\n/g, "<br>");

  // Simple admin check using AuthContext
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Mock admin stats
  const adminStats: AdminStats = {
    totalUsers: mockAuthors.length,
    totalBlogs: blogs.length,
    pendingBlogs: blogs.filter((p) => p.status === "pending").length,
    publishedBlogs: blogs.filter((p) => p.status === "published").length,
    totalViews: blogs.reduce((sum, post) => sum + post.stats.views, 0),
    totalLikes: blogs.reduce((sum, post) => sum + post.stats.likes, 0),
    totalComments: blogs.reduce((sum, post) => sum + post.stats.comments, 0),
    newUsersThisMonth: 12,
  };

  // Mock comments data
  const mockComments: Comment[] = [
    {
      id: "1",
      content:
        "Great article! Really helped me understand the concepts better.",
      authorId: "user-1",
      blogId: "1",
      blogTitle: "The Future of Artificial Intelligence",
      createdAt: "2 hours ago",
      status: "approved",
    },
    {
      id: "2",
      content: "This is spam content that should be moderated...",
      authorId: "user-2",
      blogId: "2",
      blogTitle: "Machine Learning Algorithms Explained",
      createdAt: "5 hours ago",
      status: "pending",
    },
    {
      id: "3",
      content: "Inappropriate comment that was flagged by users.",
      authorId: "user-3",
      blogId: "3",
      blogTitle: "ChatGPT vs Claude vs Gemini",
      createdAt: "1 day ago",
      status: "rejected",
    },
  ];

  // Handle blog actions
  const handleBlogAction = async (
    blogId: string,
    action: "approve" | "reject" | "delete",
  ) => {
    if (action === "delete") {
      deletePost(blogId);
      return;
    }
    updatePost(blogId, {
      status: action === "approve" ? "published" : "draft",
    });
  };

  // Handle comment actions
  const handleCommentAction = async (
    commentId: string,
    action: "approve" | "reject" | "delete",
  ) => {
    if (action === "delete") {
      deleteComment(commentId);
      return;
    }
    moderateComment(commentId, action === "approve" ? "approved" : "rejected");
  };

  // Handle user actions
  const handleUserAction = async (
    userId: string,
    action: "promote" | "demote" | "block" | "unblock",
  ) => {
    // Simulate API call
    console.log(`${action} user ${userId}`);
    // In real app, this would update the database
  };

  // Filter data based on search and status
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || blog.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredComments = comments.filter((comment) => {
    const q = searchQuery.toLowerCase();
    const post = blogs.find((b) => b.id === comment.blogId);
    const blogTitle = post?.title?.toLowerCase() ?? "";
    const matchesSearch =
      comment.content.toLowerCase().includes(q) || blogTitle.includes(q);
    const matchesStatus =
      filterStatus === "all" || comment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = mockAuthors.filter((author) => {
    const matchesSearch =
      author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, redirect to home
  if (!isAuthenticated || !isAdmin) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-nav border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-xl">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <p className="text-gray-400 text-sm">
                  Manage your Threadly platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Welcome back,</span>
              <span className="font-medium text-white">{user?.name ?? 'Admin'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide">
            {[
              { id: "overview", label: "Overview", icon: BarChart3, shortLabel: "Overview" },
              { id: "blogs", label: "Blog Posts", icon: FileText, shortLabel: "Blogs" },
              { id: "comments", label: "Comments", icon: MessageCircle, shortLabel: "Comments" },
              { id: "users", label: "Users", icon: Users, shortLabel: "Users" },
              { id: "analytics", label: "Analytics", icon: TrendingUp, shortLabel: "Analytics" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 whitespace-nowrap transition-all duration-200 rounded-t-lg ${
                  activeTab === tab.id
                    ? "border-brand-500 text-brand-400 bg-white/5"
                    : "border-transparent text-gray-400 hover:text-white hover:border-gray-300 hover:bg-white/5"
                }`}
              >
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">{tab.label}</span>
                <span className="text-xs sm:text-sm font-medium xs:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Users",
                  value: adminStats.totalUsers,
                  icon: Users,
                  color: "blue",
                },
                {
                  label: "Published Blogs",
                  value: adminStats.publishedBlogs,
                  icon: FileText,
                  color: "green",
                },
                {
                  label: "Pending Approval",
                  value: adminStats.pendingBlogs,
                  icon: Clock,
                  color: "yellow",
                },
                {
                  label: "Total Views",
                  value: adminStats.totalViews.toLocaleString(),
                  icon: Eye,
                  color: "purple",
                },
              ].map((stat, index) => (
                <div key={index} className="glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${
                        stat.color === "blue"
                          ? "from-blue-500/20 to-cyan-500/20"
                          : stat.color === "green"
                            ? "from-green-500/20 to-emerald-500/20"
                            : stat.color === "yellow"
                              ? "from-yellow-500/20 to-orange-500/20"
                              : "from-purple-500/20 to-pink-500/20"
                      }`}
                    >
                      <stat.icon
                        className={`h-6 w-6 ${
                          stat.color === "blue"
                            ? "text-blue-400"
                            : stat.color === "green"
                              ? "text-green-400"
                              : stat.color === "yellow"
                                ? "text-yellow-400"
                                : "text-purple-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pending Approvals */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                  Pending Approvals
                </h3>
                <div className="space-y-3">
                  {blogs
                    .filter((p) => p.status === "pending")
                    .map((post) => {
                      const author = getAuthorById(post.authorId);
                      return (
                        <div
                          key={post.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                        >
                          <div>
                            <p className="text-white text-sm font-medium truncate">
                              {post.title}
                            </p>
                            <p className="text-gray-400 text-xs">
                              by {author?.name}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => setPreviewPost(post)}
                              className="glass-button text-white px-3 py-1 text-xs"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleBlogAction(post.id, "approve")
                              }
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleBlogAction(post.id, "reject")
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Platform Health
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Engagement Rate</span>
                    <span className="text-green-400 font-medium">↑ 12.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">New Users (30d)</span>
                    <span className="text-blue-400 font-medium">
                      {adminStats.newUsersThisMonth}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Content Quality Score</span>
                    <span className="text-green-400 font-medium">94/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Server Uptime</span>
                    <span className="text-green-400 font-medium">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="glass-card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search blogs..."
                      className="pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="all" className="bg-gray-900">
                      All Status
                    </option>
                    <option value="published" className="bg-gray-900">
                      Published
                    </option>
                    <option value="pending" className="bg-gray-900">
                      Pending
                    </option>
                    <option value="draft" className="bg-gray-900">
                      Draft
                    </option>
                  </select>
                </div>
                <p className="text-gray-400 text-sm">
                  {filteredBlogs.length} blog posts
                </p>
              </div>
            </div>

            {/* Blogs List */}
            <div className="glass-card">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Title
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Author
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Status
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Views
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Published
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlogs.map((blog) => {
                      const author = getAuthorById(blog.authorId);
                      return (
                        <tr
                          key={blog.id}
                          className="border-b border-white/5 hover:bg-white/5"
                        >
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium truncate max-w-xs">
                                {blog.title}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {blog.category}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <img
                                src={author?.avatar}
                                alt={author?.name}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-white text-sm">
                                {author?.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                blog.status === "published"
                                  ? "bg-green-500/20 text-green-400"
                                  : blog.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {blog.status}
                            </span>
                          </td>
                          <td className="p-4 text-white text-sm">
                            {blog.stats.views.toLocaleString()}
                          </td>
                          <td className="p-4 text-gray-400 text-sm">
                            {blog.publishedAt}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                onClick={() => setPreviewPost(blog)}
                                className="glass-button text-gray-300 hover:text-white px-2 py-1"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {blog.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleBlogAction(blog.id, "approve")
                                    }
                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleBlogAction(blog.id, "reject")
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1"
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                className="glass-button text-gray-400 hover:text-white px-2 py-1"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleBlogAction(blog.id, "delete")
                                }
                                className="glass-button text-red-400 hover:text-red-300 px-2 py-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredBlogs.map((blog) => {
                  const author = getAuthorById(blog.authorId);
                  return (
                    <div
                      key={blog.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">
                            {blog.title}
                          </h4>
                          <p className="text-gray-400 text-xs mb-2">
                            {blog.category}
                          </p>
                          <div className="flex items-center space-x-2 mb-2">
                            <img
                              src={author?.avatar}
                              alt={author?.name}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="text-white text-xs">
                              {author?.name}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            blog.status === "published"
                              ? "bg-green-500/20 text-green-400"
                              : blog.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {blog.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span>{blog.stats.views.toLocaleString()} views</span>
                        <span>{blog.publishedAt}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => setPreviewPost(blog)}
                          className="glass-button text-gray-300 hover:text-white px-3 py-1 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {blog.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleBlogAction(blog.id, "approve")
                              }
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleBlogAction(blog.id, "reject")
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          onClick={() =>
                            handleBlogAction(blog.id, "delete")
                          }
                          className="glass-button text-red-400 hover:text-red-300 px-3 py-1 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            {/* Comments List */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Comment Moderation
              </h3>
              <div className="space-y-4">
                {filteredComments.map((comment) => {
                  const author = getAuthorById(comment.authorId);
                  return (
                    <div
                      key={comment.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <img
                              src={author?.avatar}
                              alt={author?.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-white text-sm font-medium">
                              {author?.name}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {comment.createdAt}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                comment.status === "approved"
                                  ? "bg-green-500/20 text-green-400"
                                  : comment.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {comment.status}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">
                            {comment.content}
                          </p>
                          <p className="text-gray-400 text-xs">
                            On:{" "}
                            <span className="text-brand-400">
                              {blogs.find((b) => b.id === comment.blogId)
                                ?.title ?? "Unknown"}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {comment.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleCommentAction(comment.id, "approve")
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleCommentAction(comment.id, "reject")
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1"
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            onClick={() =>
                              handleCommentAction(comment.id, "delete")
                            }
                            className="glass-button text-red-400 hover:text-red-300 px-2 py-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Users List */}
            <div className="glass-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-gray-400 font-medium">
                        User
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Role
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Articles
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Followers
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Joined
                      </th>
                      <th className="text-left p-4 text-gray-400 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((author) => (
                      <tr
                        key={author.id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={author.avatar}
                              alt={author.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="text-white font-medium">
                                {author.name}
                              </p>
                              <p className="text-gray-400 text-sm">
                                @{author.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              author.role === "admin"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {author.role}
                          </span>
                        </td>
                        <td className="p-4 text-white text-sm">
                          {author.articlesCount}
                        </td>
                        <td className="p-4 text-white text-sm">
                          {author.followersCount.toLocaleString()}
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {author.joinedAt}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUserAction(
                                  author.id,
                                  author.role === "admin"
                                    ? "demote"
                                    : "promote",
                                )
                              }
                              className="glass-button text-gray-400 hover:text-white px-2 py-1"
                            >
                              {author.role === "admin" ? "Demote" : "Promote"}
                            </Button>
                            <Button
                              size="sm"
                              className="glass-button text-red-400 hover:text-red-300 px-2 py-1"
                            >
                              Block
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Metrics */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Engagement Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Views</span>
                    <span className="text-white font-medium">
                      {adminStats.totalViews.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Likes</span>
                    <span className="text-white font-medium">
                      {adminStats.totalLikes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Comments</span>
                    <span className="text-white font-medium">
                      {adminStats.totalComments.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Avg. Read Time</span>
                    <span className="text-white font-medium">8.5 min</span>
                  </div>
                </div>
              </div>

              {/* Top Performing Content */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Top Performing Articles
                </h3>
                <div className="space-y-3">
                  {blogs
                    .filter((p) => p.status === "published")
                    .sort((a, b) => b.stats.views - a.stats.views)
                    .slice(0, 5)
                    .map((post, index) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400 text-sm">
                            #{index + 1}
                          </span>
                          <span className="text-white text-sm truncate max-w-xs">
                            {post.title}
                          </span>
                        </div>
                        <span className="text-brand-400 text-sm">
                          {post.stats.views.toLocaleString()} views
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Preview Modal */}
        {previewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPreviewPost(null)}
            />
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {previewPost.title}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Category: {previewPost.category} • Status:{" "}
                    {previewPost.status}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewPost(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              {previewPost.coverImage && (
                <img
                  src={previewPost.coverImage}
                  alt="cover"
                  className="w-full h-56 object-cover rounded-xl mb-4"
                />
              )}
              {previewPost.excerpt && (
                <p className="text-gray-300 mb-4">{previewPost.excerpt}</p>
              )}
              <div
                className="prose prose-invert max-w-none text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(previewPost.content),
                }}
              />
              {previewPost.status === "pending" && (
                <div className="mt-6 flex items-center justify-end space-x-2">
                  <Button
                    onClick={() => {
                      handleBlogAction(previewPost.id, "reject");
                      setPreviewPost(null);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      handleBlogAction(previewPost.id, "approve");
                      setPreviewPost(null);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
