import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Save, Eye, Send, Image, Bold, Italic, Code, List, 
  Link2, Quote, Heading, AlertCircle, CheckCircle, Upload, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { mockCategories } from "@/lib/mockData";

export default function Write() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  
  // State management
  const [isDraft, setIsDraft] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;
    
    setIsSaving(true);
    try {
      // Simulate auto-save to localStorage and backend
      const draftData = {
        title,
        excerpt,
        content,
        category,
        tags,
        coverImage,
        lastSaved: new Date().toISOString(),
        authorId: user?.id
      };
      
      localStorage.setItem("aiblog_draft", JSON.stringify(draftData));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLastSaved(new Date());
      setError("");
    } catch (err) {
      setError("Failed to auto-save draft");
    } finally {
      setIsSaving(false);
    }
  }, [title, excerpt, content, category, tags, coverImage, user?.id]);

  // Auto-save every 5 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 5000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("aiblog_draft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || "");
        setExcerpt(draft.excerpt || "");
        setContent(draft.content || "");
        setCategory(draft.category || "");
        setTags(draft.tags || []);
        setCoverImage(draft.coverImage || "");
        setLastSaved(draft.lastSaved ? new Date(draft.lastSaved) : null);
      } catch (err) {
        console.error("Failed to load draft:", err);
      }
    }
  }, []);

  // Manual save
  const handleSave = async () => {
    await autoSave();
    setSuccess("Draft saved successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Submit for review
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !category) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess("Article submitted for review! You'll be notified when it's approved.");
      setIsDraft(false);
      
      // Clear draft from localStorage
      localStorage.removeItem("aiblog_draft");
      
      setTimeout(() => {
        navigate("/blogs");
      }, 2000);
    } catch (err) {
      setError("Failed to submit article");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Format selection helpers
  const formatText = (prefix: string, suffix: string = "") => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${prefix}${selectedText}${suffix}`;
    
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Markdown rendering (simplified)
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-brand-400">$1</code>')
      .replace(/\n/g, '<br>');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/blogs">
              <Button variant="outline" size="sm" className="glass-button text-white border-white/20 hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">Write Article</h1>
              {lastSaved && (
                <p className="text-xs text-gray-400">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isSaving && (
              <div className="flex items-center text-gray-400 text-sm">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="glass-button text-white border-white/20 hover:bg-white/10"
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
              className={`glass-button border-white/20 hover:bg-white/10 ${
                isPreview ? 'text-brand-400 border-brand-400/30' : 'text-white'
              }`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !content.trim() || !category}
              className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0 shadow-glow"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Editor */}
          <div className="lg:col-span-3">
            <div className="glass-card p-6 sm:p-8">
              {/* Messages */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              {/* Title */}
              <div className="mb-6">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article title..."
                  className="w-full text-3xl sm:text-4xl font-bold text-white bg-transparent border-none outline-none placeholder-gray-500 resize-none"
                />
              </div>

              {/* Excerpt */}
              <div className="mb-6">
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Write a compelling excerpt that summarizes your article..."
                  className="w-full text-lg text-gray-300 bg-transparent border-none outline-none placeholder-gray-500 resize-none h-20"
                />
              </div>

              {/* Formatting Toolbar */}
              {!isPreview && (
                <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText("**", "**")}
                      className="text-gray-400 hover:text-white hover:bg-white/10 p-2"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText("*", "*")}
                      className="text-gray-400 hover:text-white hover:bg-white/10 p-2"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText("`", "`")}
                      className="text-gray-400 hover:text-white hover:bg-white/10 p-2"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText("## ")}
                      className="text-gray-400 hover:text-white hover:bg-white/10 p-2"
                    >
                      <Heading className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText("- ")}
                      className="text-gray-400 hover:text-white hover:bg-white/10 p-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText("> ")}
                      className="text-gray-400 hover:text-white hover:bg-white/10 p-2"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => formatText("[link text](", ")")}
                      className="text-gray-400 hover:text-white hover:bg-white/10 p-2"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Content Editor/Preview */}
              <div className="min-h-[500px]">
                {isPreview ? (
                  <div 
                    className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                  />
                ) : (
                  <textarea
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your article... 

You can use Markdown formatting:
- **bold text**
- *italic text*
- `code`
- ## Headings
- [links](url)
- > Quotes

The content will auto-save every 5 seconds."
                    className="w-full h-[500px] text-gray-300 bg-transparent border-none outline-none placeholder-gray-500 resize-none leading-relaxed"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Article Settings */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Article Settings</h3>
              
              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a category</option>
                  {mockCategories.map((cat) => (
                    <option key={cat.name} value={cat.name} className="bg-gray-900">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags ({tags.length}/5)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand-500/20 text-brand-400 border border-brand-400/30"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    disabled={tags.length >= 5}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="bg-brand-500 hover:bg-brand-600 text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Cover Image */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {coverImage && (
                  <div className="mt-2">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={() => setCoverImage("")}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Writing Tips</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Use clear, descriptive headings</li>
                <li>• Keep paragraphs short and readable</li>
                <li>• Include code examples for tutorials</li>
                <li>• Add relevant tags for discoverability</li>
                <li>• Write a compelling excerpt</li>
                <li>• Use high-quality cover images</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
