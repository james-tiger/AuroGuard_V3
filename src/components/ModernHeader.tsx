
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Rocket, Menu, X, Zap, Shield, Activity, Settings } from 'lucide-react';

const ModernHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Mission Control', path: '/', icon: Rocket, description: 'Main Dashboard' },
    { name: 'Live Simulation', path: '/simulation', icon: Zap, description: 'Real-time Tracking' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="mission-panel border-0 border-b border-green-500/20 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Professional Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300 border border-green-400/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold mission-title">AuroGuard</h1>
              <p className="text-xs mission-subtitle">Space Defense System</p>
              <div className="flex items-center gap-2 mt-1">
                <Activity className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-mono">OPERATIONAL</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-300 group ${
                    isActive(item.path)
                      ? 'mission-button text-white shadow-lg'
                      : 'mission-button-secondary text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{item.name}</span>
                    <span className="text-xs opacity-75">{item.description}</span>
                  </div>
                </Link>
              );
            })}
            
            {/* Settings Button */}
            <button className="mission-button-secondary p-3 rounded-lg transition-all duration-300 hover:bg-gray-600/50">
              <Settings className="w-4 h-4" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden mission-button-secondary p-3 rounded-lg"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-6 pt-6 border-t border-green-500/20 animate-mission-fade-in">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-lg transition-all duration-300 ${
                      isActive(item.path)
                        ? 'mission-button text-white'
                        : 'mission-button-secondary text-gray-300 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-sm opacity-75">{item.description}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default ModernHeader;
