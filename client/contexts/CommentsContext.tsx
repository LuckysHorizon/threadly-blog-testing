import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CommentItem {
  id: string;
  content: string;
  authorId: string;
  blogId: string;
  createdAt: string;
  status: "approved" | "pending" | "rejected";
}

interface CommentsContextValue {
  comments: CommentItem[];
  getByBlogId: (blogId: string) => CommentItem[];
  addComment: (input: Omit<CommentItem, "id" | "createdAt" | "status"> & { status?: CommentItem["status"] }) => CommentItem;
  moderateComment: (id: string, status: CommentItem["status"]) => void;
  deleteComment: (id: string) => void;
}

const STORAGE_KEY = "aiblog_comments";
const CommentsContext = createContext<CommentsContextValue | undefined>(undefined);

export const CommentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch {}
  }, [comments]);

  const getByBlogId = (blogId: string) => comments.filter((c) => c.blogId === blogId);

  const addComment: CommentsContextValue["addComment"] = ({ blogId, authorId, content, status }) => {
    const item: CommentItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      blogId,
      authorId,
      content,
      createdAt: new Date().toISOString(),
      status: status ?? "pending",
    };
    setComments((prev) => [item, ...prev]);
    return item;
  };

  const moderateComment: CommentsContextValue["moderateComment"] = (id, status) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const deleteComment: CommentsContextValue["deleteComment"] = (id) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const value = useMemo(
    () => ({ comments, getByBlogId, addComment, moderateComment, deleteComment }),
    [comments]
  );

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>;
};

export const useComments = () => {
  const ctx = useContext(CommentsContext);
  if (!ctx) throw new Error("useComments must be used within CommentsProvider");
  return ctx;
};
