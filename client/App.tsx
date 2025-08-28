import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import Write from "./pages/Write";
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
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/write" element={<Write />} />
            <Route
              path="/categories"
              element={
                <PlaceholderPage
                  title="AI Categories"
                  description="Explore our comprehensive collection of AI categories and topics. From machine learning to natural language processing, find exactly what you're looking for."
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
                  title="About AI Blog"
                  description="Learn more about our mission to democratize AI knowledge and connect the global AI community through high-quality content and insights."
                  icon={<Info className="h-12 w-12 text-brand-400" />}
                  suggestedAction="We're crafting our story and mission statement. For now, explore our latest AI insights and discoveries!"
                />
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
