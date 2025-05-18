
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center starfield">
      <div className="tech-panel p-8 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-20 w-20 text-space-warning" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-white">Error 404</h1>
        <p className="text-xl text-gray-300 mb-6">Navigation system failure. Sector not found.</p>
        <div className="tech-progress-bar mb-8"></div>
        <Link to="/">
          <Button className="bg-space-accent hover:bg-space-accent/80 text-black">
            Return to Mission Control
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
