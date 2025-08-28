import { ReactNode } from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div
          className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-8 left-20 w-72 h-72 bg-brand-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative pt-24">{children}</main>

      {/* Footer */}
      <footer className="relative mt-20 border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-brand-500 to-purple-500 p-2 rounded-xl">
                  <svg
                    className="h-6 w-6 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gradient">AI Blog</span>
              </div>
              <p className="text-gray-400 max-w-md mb-4">
                The future of content creation powered by artificial
                intelligence. Discover, create, and share insights that matter.
              </p>
              <div className="flex items-center space-x-1 px-3 py-2 rounded-full bg-gradient-to-r from-brand-500/10 to-purple-500/10 border border-brand-400/20 w-fit">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300">
                  AI-Powered Platform
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {["Home", "Blogs", "Categories", "Authors", "About"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-brand-400 transition-colors duration-300"
                      >
                        {link}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {[
                  "API Docs",
                  "Write for Us",
                  "Privacy Policy",
                  "Terms of Service",
                  "Support",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-brand-400 transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AI Blog. All rights reserved. Built with ❤️ and AI.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-500 text-sm">Follow us:</span>
              {["Twitter", "GitHub", "LinkedIn"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-gray-400 hover:text-brand-400 transition-colors duration-300 text-sm"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
