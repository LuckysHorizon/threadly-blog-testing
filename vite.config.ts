import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      // Direct API implementation for development
      server.middlewares.use("/api", async (req, res, next) => {
        // Set CORS headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        if (req.method === "OPTIONS") {
          res.statusCode = 200;
          res.end();
          return;
        }
        
        try {
          if (req.url === "/ping") {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, message: "pong" }));
          } else if (req.url === "/auth/me") {
            // Mock auth endpoint for development
            const authHeader = req.headers.authorization;
            const bearer = authHeader && authHeader.split(' ')[1];
            
            if (!bearer) {
              res.setHeader("Content-Type", "application/json");
              res.statusCode = 401;
              res.end(JSON.stringify({ success: false, error: "No authorization token provided" }));
              return;
            }
            
            // Mock user data for development
            const mockUser = {
              id: "mock-user-id",
              email: "admin@threadly.com",
              name: "Admin User",
              username: "admin",
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
              role: "ADMIN",
              bio: "Administrator",
              provider: "EMAIL",
              twitter: "",
              github: "",
              linkedin: "",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              articlesCount: 0,
              followersCount: 0,
              totalViews: 0,
              totalLikes: 0,
            };
            
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, data: mockUser }));
          } else if (req.url === "/admin/stats") {
            // Mock admin stats for development
            const mockStats = {
              totalUsers: 1,
              totalBlogs: 0,
              pendingBlogs: 0,
              publishedBlogs: 0,
              totalViews: 0,
              totalLikes: 0,
              totalComments: 0,
              trendingBlogs: [],
              topAuthors: [],
            };
            
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, data: mockStats }));
          } else if (req.url === "/admin/users") {
            // Mock users data for development
            const mockUsers = {
              data: [{
                id: "mock-user-id",
                email: "admin@threadly.com",
                name: "Admin User",
                username: "admin",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
                role: "ADMIN",
                bio: "Administrator",
                provider: "EMAIL",
                twitter: "",
                github: "",
                linkedin: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                articlesCount: 0,
                followersCount: 0,
                totalViews: 0,
                totalLikes: 0,
              }],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
              }
            };
            
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, data: mockUsers }));
          } else if (req.url === "/admin/blogs/pending") {
            // Mock pending blogs for development
            const mockBlogs = {
              data: [],
              pagination: {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
              }
            };
            
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, data: mockBlogs }));
          } else {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 404;
            res.end(JSON.stringify({ success: false, error: "API endpoint not found" }));
          }
        } catch (error) {
          console.error("API error:", error);
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: "Internal server error" }));
        }
      });
    },
  };
}
