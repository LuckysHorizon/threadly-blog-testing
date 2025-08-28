// Mock data for the AI Blog Website

export interface Author {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  role: "admin" | "user";
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  joinedAt: string;
  articlesCount: number;
  followersCount: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  authorId: string;
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
  status?: "published" | "draft" | "pending";
}

// Mock authors database
export const mockAuthors: Author[] = [
  {
    id: "admin-1",
    name: "Dr. Sarah Chen",
    username: "sarahchen",
    email: "admin@aiblog.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=100&h=100&fit=crop&crop=face",
    role: "admin",
    bio: "AI Researcher at Stanford University, specializing in machine learning and neural networks.",
    socialLinks: {
      twitter: "https://twitter.com/sarahchen",
      github: "https://github.com/sarahchen"
    },
    joinedAt: "2023-01-15",
    articlesCount: 12,
    followersCount: 15400
  },
  {
    id: "user-1",
    name: "Alex Rodriguez",
    username: "alexrod",
    email: "user@aiblog.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    role: "user",
    bio: "Senior Data Scientist at Google, expert in machine learning algorithms and data analysis.",
    socialLinks: {
      linkedin: "https://linkedin.com/in/alexrodriguez"
    },
    joinedAt: "2023-03-20",
    articlesCount: 8,
    followersCount: 9800
  },
  {
    id: "user-2",
    name: "Emma Thompson",
    username: "emmathompson",
    email: "emma@aiblog.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    role: "user",
    bio: "AI Product Manager at OpenAI, passionate about making AI accessible to everyone.",
    socialLinks: {
      twitter: "https://twitter.com/emmathompson"
    },
    joinedAt: "2023-02-10",
    articlesCount: 15,
    followersCount: 22100
  },
  {
    id: "user-3",
    name: "Michael Zhang",
    username: "michaelzhang",
    email: "michael@aiblog.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    role: "user",
    bio: "Machine Learning Engineer with expertise in PyTorch and deep learning frameworks.",
    socialLinks: {
      github: "https://github.com/michaelzhang"
    },
    joinedAt: "2023-04-05",
    articlesCount: 6,
    followersCount: 5200
  }
];

// Helper function to get author by ID
export const getAuthorById = (authorId: string): Author | undefined => {
  return mockAuthors.find(author => author.id === authorId);
};

export const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of Artificial Intelligence: Transforming Industries in 2024",
    excerpt: "Explore how AI is revolutionizing healthcare, finance, and education with cutting-edge applications and real-world implementations.",
    authorId: "admin-1",
    publishedAt: "2 days ago",
    readTime: "8 min read",
    category: "AI Technology",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    tags: ["AI", "Technology", "Future", "Innovation"],
    stats: {
      views: 15420,
      likes: 1240,
      comments: 89
    },
    featured: true,
    status: "published"
  },
  {
    id: "2",
    title: "Machine Learning Algorithms Explained: A Comprehensive Guide",
    excerpt: "Deep dive into the most important ML algorithms every data scientist should know, with practical examples and implementation tips.",
    authorId: "user-1",
    publishedAt: "4 days ago",
    readTime: "12 min read",
    category: "Machine Learning",
    coverImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop",
    tags: ["Machine Learning", "Algorithms", "Data Science"],
    stats: {
      views: 8930,
      likes: 720,
      comments: 45
    },
    featured: true,
    status: "published"
  },
  {
    id: "3",
    title: "ChatGPT vs Claude vs Gemini: The Ultimate AI Assistant Comparison",
    excerpt: "An in-depth analysis of the leading AI assistants, comparing their capabilities, strengths, and ideal use cases.",
    authorId: "user-2",
    publishedAt: "1 week ago",
    readTime: "10 min read",
    category: "AI Comparison",
    coverImage: "https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&h=400&fit=crop",
    tags: ["ChatGPT", "Claude", "Gemini", "AI Assistants"],
    stats: {
      views: 22100,
      likes: 1890,
      comments: 156
    },
    featured: true,
    status: "published"
  },
  {
    id: "4",
    title: "Building Your First Neural Network with PyTorch",
    excerpt: "Step-by-step tutorial for beginners to create and train their first neural network using PyTorch framework.",
    authorId: "user-3",
    publishedAt: "1 week ago",
    readTime: "15 min read",
    category: "Deep Learning",
    coverImage: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=400&fit=crop",
    tags: ["PyTorch", "Neural Networks", "Deep Learning", "Tutorial"],
    stats: {
      views: 12500,
      likes: 980,
      comments: 67
    },
    status: "published"
  },
  {
    id: "5",
    title: "AI Ethics: Navigating the Challenges of Responsible AI Development",
    excerpt: "Understanding the ethical implications of AI technology and frameworks for building responsible AI systems.",
    authorId: "admin-1",
    publishedAt: "2 weeks ago",
    readTime: "9 min read",
    category: "AI Ethics",
    coverImage: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=800&h=400&fit=crop",
    tags: ["AI Ethics", "Responsible AI", "Technology"],
    stats: {
      views: 7200,
      likes: 540,
      comments: 32
    },
    status: "published"
  },
  {
    id: "6",
    title: "Computer Vision in Healthcare: Revolutionizing Medical Diagnosis",
    excerpt: "How computer vision and AI are transforming medical imaging and improving diagnostic accuracy in healthcare.",
    authorId: "user-1",
    publishedAt: "2 weeks ago",
    readTime: "11 min read",
    category: "Healthcare AI",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop",
    tags: ["Computer Vision", "Healthcare", "Medical AI"],
    stats: {
      views: 9800,
      likes: 670,
      comments: 41
    },
    status: "published"
  },
  {
    id: "7",
    title: "Natural Language Processing: From BERT to GPT-4",
    excerpt: "The evolution of NLP models and their impact on how machines understand and generate human language.",
    authorId: "user-2",
    publishedAt: "3 weeks ago",
    readTime: "13 min read",
    category: "NLP",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    tags: ["NLP", "BERT", "GPT-4", "Language Models"],
    stats: {
      views: 14200,
      likes: 1100,
      comments: 78
    },
    status: "published"
  },
  {
    id: "8",
    title: "Quantum Computing Meets AI: The Next Frontier",
    excerpt: "Exploring the intersection of quantum computing and artificial intelligence, and what it means for the future.",
    authorId: "user-3",
    publishedAt: "1 month ago",
    readTime: "14 min read",
    category: "Quantum AI",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop",
    tags: ["Quantum Computing", "AI", "Future Technology"],
    stats: {
      views: 6700,
      likes: 420,
      comments: 28
    },
    status: "published"
  },
  // Draft posts (visible only to authors and admins)
  {
    id: "draft-1",
    title: "Advanced Reinforcement Learning Techniques",
    excerpt: "Exploring cutting-edge RL algorithms and their applications in robotics and game AI.",
    authorId: "user-1",
    publishedAt: "Draft",
    readTime: "16 min read",
    category: "Reinforcement Learning",
    coverImage: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=400&fit=crop",
    tags: ["Reinforcement Learning", "Robotics", "Game AI"],
    stats: {
      views: 0,
      likes: 0,
      comments: 0
    },
    status: "draft"
  },
  // Pending posts (waiting for admin approval)
  {
    id: "pending-1",
    title: "Edge AI: Bringing Intelligence to IoT Devices",
    excerpt: "How edge computing is revolutionizing AI deployment in Internet of Things applications.",
    authorId: "user-2",
    publishedAt: "Pending Review",
    readTime: "11 min read",
    category: "Edge Computing",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2d39?w=800&h=400&fit=crop",
    tags: ["Edge AI", "IoT", "Edge Computing"],
    stats: {
      views: 0,
      likes: 0,
      comments: 0
    },
    status: "pending"
  }
];

export const mockCategories = [
  {
    name: "AI Technology",
    count: 45,
    color: "from-purple-500 to-blue-500"
  },
  {
    name: "Machine Learning",
    count: 38,
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Deep Learning",
    count: 32,
    color: "from-cyan-500 to-teal-500"
  },
  {
    name: "NLP",
    count: 28,
    color: "from-teal-500 to-green-500"
  },
  {
    name: "Computer Vision",
    count: 24,
    color: "from-green-500 to-yellow-500"
  },
  {
    name: "AI Ethics",
    count: 19,
    color: "from-yellow-500 to-orange-500"
  },
  {
    name: "Healthcare AI",
    count: 16,
    color: "from-orange-500 to-red-500"
  },
  {
    name: "Quantum AI",
    count: 12,
    color: "from-red-500 to-pink-500"
  }
];

export const mockAuthors = [
  {
    name: "Dr. Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=100&h=100&fit=crop&crop=face",
    bio: "AI Researcher at Stanford University, specializing in machine learning and neural networks.",
    articles: 12,
    followers: 15400
  },
  {
    name: "Alex Rodriguez",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    bio: "Senior Data Scientist at Google, expert in machine learning algorithms and data analysis.",
    articles: 8,
    followers: 9800
  },
  {
    name: "Emma Thompson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    bio: "AI Product Manager at OpenAI, passionate about making AI accessible to everyone.",
    articles: 15,
    followers: 22100
  }
];
