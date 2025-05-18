
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-space-panel bg-opacity-90 border-b border-space-grid sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center h-14 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-space-accent" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-space-accent bg-clip-text text-transparent">
            Project AuroGuard
          </h1>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm hover:text-space-accent transition-colors">Dashboard</Link>
          <Link to="/simulation" className="text-sm hover:text-space-accent transition-colors">Simulation</Link>
          <button className="tech-button bg-space-panel text-sm flex items-center gap-1">
            <span className="indicator-dot bg-space-success"></span>
            Radar: Clear
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
