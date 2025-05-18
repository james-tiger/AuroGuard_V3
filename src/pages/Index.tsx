
import { Link } from "react-router-dom";
import { Shield, Satellite, Activity, AlertTriangle, BarChart4, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="flex-1 starfield">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Space Defense Simulation System
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Monitor, detect, and respond to space debris threats with our
            advanced simulation platform
          </p>
          <Link to="/simulation">
            <Button className="bg-space-accent hover:bg-space-accent/80 text-black font-medium">
              Launch Simulation
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-space-panel border-space-grid p-6">
            <div className="flex justify-between items-start mb-4">
              <Satellite className="text-space-accent h-8 w-8" />
              <span className="text-sm text-space-accent bg-space-accent/10 px-2 py-1 rounded">Real-time</span>
            </div>
            <h3 className="text-xl font-medium mb-2">Live Satellite Tracking</h3>
            <p className="text-gray-400 text-sm">
              Monitor satellite positions using real-time TLE data with accurate orbital predictions
            </p>
          </Card>

          <Card className="bg-space-panel border-space-grid p-6">
            <div className="flex justify-between items-start mb-4">
              <AlertTriangle className="text-space-warning h-8 w-8" />
              <span className="text-sm text-space-warning bg-space-warning/10 px-2 py-1 rounded">Predictive</span>
            </div>
            <h3 className="text-xl font-medium mb-2">Collision Prediction</h3>
            <p className="text-gray-400 text-sm">
              Advanced algorithms to predict potential collisions and provide timely alerts
            </p>
          </Card>

          <Card className="bg-space-panel border-space-grid p-6">
            <div className="flex justify-between items-start mb-4">
              <BarChart4 className="text-space-highlight h-8 w-8" />
              <span className="text-sm text-space-highlight bg-space-highlight/10 px-2 py-1 rounded">Analytics</span>
            </div>
            <h3 className="text-xl font-medium mb-2">Data Analytics</h3>
            <p className="text-gray-400 text-sm">
              Historical logs and analytics to improve future collision avoidance strategies
            </p>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between bg-space-panel border border-space-grid p-8 rounded-lg">
          <div className="lg:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Interactive Simulation Environment</h2>
            <p className="text-gray-300 mb-4">
              Experience a realistic simulation of how satellites detect and avoid space
              debris using our advanced visualization platform.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Shield className="text-space-accent h-5 w-5" />
                <span>Real-time debris tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Activity className="text-space-accent h-5 w-5" />
                <span>Advanced collision avoidance systems</span>
              </li>
              <li className="flex items-center gap-2">
                <Rocket className="text-space-accent h-5 w-5" />
                <span>Spacecraft maneuver simulation</span>
              </li>
            </ul>
            <Link to="/simulation">
              <Button className="bg-gradient-to-r from-blue-600 to-space-accent hover:opacity-90 text-white">
                Enter Simulation
              </Button>
            </Link>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="aspect-square max-w-md mx-auto bg-space rounded-full border border-space-grid relative overflow-hidden">
              <div className="absolute inset-0 grid-pattern rounded-full"></div>
              
              {/* Orbit circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="circle-orbit w-[85%] h-[85%] animate-pulse-light"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="circle-orbit w-[60%] h-[60%] animate-pulse-light"></div>
              </div>
              
              {/* Center point */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              
              {/* Satellite */}
              <div className="absolute top-1/2 left-[15%] transform -translate-y-1/2">
                <div className="w-2 h-2 bg-space-accent rounded-full shadow-lg shadow-space-accent/30"></div>
              </div>

              {/* Debris */}
              <div className="absolute top-1/4 right-[30%]">
                <div className="w-1 h-1 bg-space-warning rounded-full shadow-sm shadow-space-warning/30"></div>
              </div>
              
              {/* Radar sweep animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="radar-sweep"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
