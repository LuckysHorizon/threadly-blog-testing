import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: ReactNode;
  suggestedAction?: string;
}

export default function PlaceholderPage({
  title,
  description,
  icon = <Construction className="h-12 w-12 text-brand-400" />,
  suggestedAction = "Continue exploring our homepage for now, or let us know what you'd like to see on this page!",
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/">
            <Button
              variant="outline"
              className="glass-button text-white border-white/20 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Placeholder Content */}
        <div className="text-center">
          <div className="glass-card p-12 max-w-2xl mx-auto">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-brand-500/20 to-purple-500/20 rounded-2xl mb-6">
              {icon}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>

            {/* Description */}
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {description}
            </p>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center space-x-2 glass-nav mb-8">
              <Sparkles className="h-4 w-4 text-brand-400 animate-pulse" />
              <span className="text-sm font-medium text-gray-300">
                Coming Soon
              </span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>

            {/* Suggested Action */}
            <p className="text-gray-400 mb-8">{suggestedAction}</p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white border-0 shadow-glow px-8 py-3"
                >
                  Explore Homepage
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="glass-button px-8 py-3 text-white border-white/20 hover:bg-white/10"
              >
                Request Feature
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              This page is under development. Check back soon for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
