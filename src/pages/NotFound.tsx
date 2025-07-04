
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="flex justify-center mb-6">
          <Shield className="h-16 w-16 text-amber-400" />
        </div>
        <h1 className="text-6xl font-bold mb-4 text-white">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-white">Battle Location Not Found</h2>
        <p className="text-gray-300 mb-8">
          This path leads nowhere, warrior. The page you're looking for doesn't exist in our arena.
        </p>
        <div className="space-y-3">
          <Link to="/" className="block">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              <Home className="mr-2 h-4 w-4" />
              Return to War Room
            </Button>
          </Link>
          <Link to="/landing" className="block">
            <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
              Back to Landing
            </Button>
          </Link>
        </div>
        <p className="text-xs text-gray-500 mt-6">
          Requested path: {location.pathname}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
