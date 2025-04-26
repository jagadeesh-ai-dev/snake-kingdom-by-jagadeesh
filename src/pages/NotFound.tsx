
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-40 h-40 bg-gradient-to-br from-purple-800 to-indigo-900 rounded-lg flex items-center justify-center">
            <h1 className="text-6xl font-bold text-white">404</h1>
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-snake-text">Page Not Found</h2>
        <p className="text-lg mb-8 text-gray-400 max-w-md mx-auto">
          Oops! The page you're looking for seems to have slithered away.
        </p>
        <Link to="/">
          <Button className="bg-snake-primary hover:bg-purple-600 flex items-center gap-2 px-6 py-5">
            <Home size={18} />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
