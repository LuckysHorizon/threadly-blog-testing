import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BlogPost } from "@/lib/mockData";
import { mockBlogPosts } from "@/lib/mockData";

interface PostsContextValue {
  posts: BlogPost[];
  addPost: (post: Omit<BlogPost, "id"> & { id?: string }) => string;
  updatePost: (id: string, changes: Partial<BlogPost>) => void;
  deletePost: (id: string) => void;
  reloadFromStorage: () => void;
}

const PostsContext = createContext<PostsContextValue | undefined>(undefined);

const STORAGE_KEY = "aiblog_posts";

export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return mockBlogPosts;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {}
  }, [posts]);

  const addPost: PostsContextValue["addPost"] = (post) => {
    const id = post.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newPost: BlogPost = { ...post, id } as BlogPost;
    setPosts((prev) => [newPost, ...prev]);
    return id;
  };

  const updatePost: PostsContextValue["updatePost"] = (id, changes) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  };

  const deletePost: PostsContextValue["deletePost"] = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const reloadFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPosts(JSON.parse(raw));
    } catch {}
  };

  const value = useMemo(
    () => ({ posts, addPost, updatePost, deletePost, reloadFromStorage }),
    [posts]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};

export const usePosts = () => {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used within PostsProvider");
  return ctx;
};
