import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  SortDesc,
  Grid,
  List,
  Tag,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/BlogCard";
import { mockCategories, getAuthorById } from "@/lib/mockData";
import { usePosts } from "@/contexts/PostsContext";

type SortOption = "latest" | "popular" | "trending" | "oldest";
type ViewMode = "grid" | "list";

export default function Blogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const { posts } = usePosts();

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((post) => {
        const author = getAuthorById(post.authorId);
        const authorName = author?.name?.toLowerCase() ?? "";
        const authorUsername = author?.username?.toLowerCase() ?? "";
        return (
          post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          authorName.includes(q) ||
          authorUsername.includes(q) ||
          post.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      });
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    // Sort posts
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.stats.views - a.stats.views;
        case "trending":
          return b.stats.likes - a.stats.likes;
        case "oldest":
          return (
            new Date(a.publishedAt).getTime() -
            new Date(b.publishedAt).getTime()
          );
        case "latest":
        default:
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          );
      }
    });

    return sorted;
  }, [posts, searchQuery, selectedCategory, sortBy]);

  const sortOptions = [
    { value: "latest", label: "Latest", icon: Clock },
    { value: "popular", label: "Most Popular", icon: TrendingUp },
    { value: "trending", label: "Trending", icon: TrendingUp },
    { value: "oldest", label: "Oldest", icon: Clock },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Threadly <span className="text-gradient">Articles</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover cutting-edge insights, tutorials, and research in
            artificial intelligence
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles, authors, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-xl"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-brand-500 backdrop-blur-xl"
                >
                  {sortOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-gray-900"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <SortDesc className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center glass-nav p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-white/10 text-brand-400" : "text-gray-400 hover:text-white"}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-white/10 text-brand-400" : "text-gray-400 hover:text-white"}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="glass-button text-white border-white/20 hover:bg-white/10"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="space-y-4">
                {/* Categories */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                      className={`${
                        selectedCategory === null
                          ? "bg-brand-500 text-white border-brand-500"
                          : "glass-button text-gray-300 border-white/20 hover:bg-white/10"
                      }`}
                    >
                      All Categories
                    </Button>
                    {mockCategories.map((category) => (
                      <Button
                        key={category.name}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCategory(category.name)}
                        className={`${
                          selectedCategory === category.name
                            ? "bg-brand-500 text-white border-brand-500"
                            : "glass-button text-gray-300 border-white/20 hover:bg-white/10"
                        }`}
                      >
                        {category.name} ({category.count})
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-400">
            {filteredAndSortedPosts.length} article
            {filteredAndSortedPosts.length !== 1 ? "s" : ""} found
            {selectedCategory && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand-500/20 text-brand-400">
                {selectedCategory}
              </span>
            )}
          </p>

          {/* Active Filters */}
          {(searchQuery || selectedCategory) && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/10 text-white">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/10 text-white">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Articles Grid/List */}
        {filteredAndSortedPosts.length > 0 ? (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-6"
            }`}
          >
            {filteredAndSortedPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                variant={viewMode === "list" ? "compact" : "default"}
              />
            ))}
          </div>
        ) : (
          // No Results
          <div className="text-center py-20">
            <div className="glass-card p-12 max-w-md mx-auto">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No articles found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search criteria or browse all categories
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredAndSortedPosts.length > 0 && (
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0 shadow-glow px-8 py-3"
            >
              Load More Articles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
