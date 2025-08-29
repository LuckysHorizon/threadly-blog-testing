import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PostsProvider } from "./contexts/PostsContext";
import { CommentsProvider } from "./contexts/CommentsContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import Write from "./pages/Write";
import Admin from "./pages/Admin";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import { BookOpen, Users, FolderOpen, Info } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PostsProvider>
            <CommentsProvider>
              <Layout>
                <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/write" element={<Write />} />
              <Route path="/admin" element={<Admin />} />
              <Route
                path="/categories"
                element={
                  <PlaceholderPage
                    title="Threadly Categories"
                    description="Explore our comprehensive collection of categories and topics at Threadly. From machine learning to natural language processing, find exactly what you're looking for."
                    icon={<FolderOpen className="h-12 w-12 text-brand-400" />}
                    suggestedAction="We're building an advanced categorization system with filtering and sorting. Check out our featured articles on the homepage!"
                  />
                }
              />
              <Route
                path="/authors"
                element={
                  <PlaceholderPage
                    title="Expert Authors"
                    description="Meet the brilliant minds behind our AI content. Discover profiles, expertise areas, and featured articles from our contributing authors."
                    icon={<Users className="h-12 w-12 text-brand-400" />}
                    suggestedAction="Our author profiles and expert showcase is coming soon. Meanwhile, check out the amazing content they've created!"
                  />
                }
              />
              <Route
                path="/about"
                element={
                  <PlaceholderPage
                    title="About Threadly"
                    description="Learn more about Threadly's mission to democratize knowledge and connect the global community through high-quality content and insights."
                    icon={<Info className="h-12 w-12 text-brand-400" />}
                    suggestedAction="We're crafting our story and mission statement. For now, explore our latest insights and discoveries!"
                  />
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </CommentsProvider>
          </PostsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
