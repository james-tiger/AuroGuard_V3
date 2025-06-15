import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Pause, Play, FastForward, SkipForward, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield, Power, Target, Satellite, X, Radar, Zap, Activity } from 'lucide-react';
import SimulationCanvas from '@/components/SimulationCanvas';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DebrisDashboard from '@/components/DebrisDashboard';
import { toast } from '@/components/ui/sonner';

// Mock data for simulation
const INITIAL_TELEMETRY = {
  spacecraft: {
    velocity: 0,
    altitude: 400,
    fuel: 100,
    shields: 100
  },
  environment: {
    debrisCount: 25,
    nearbyObjects: 0,
    solarActivity: 'Low'
  },
  safety: {
    collisionRisk: 'Low',
    radiationLevel: 'Normal'
  },
  system: {
    aiStatus: 'Inactive',
    systemIntegrity: 98
  }
};

const Simulation = () => {
  const [simSpeed, setSimSpeed] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const [radarRange, setRadarRange] = useState(15);
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [aiMode, setAiMode] = useState('off');
  const [showWarning, setShowWarning] = useState(false);
  const [navigationControls, setNavigationControls] = useState({
    up: false,
    down: false,
    left: false,
    right: false
  });
  const [activeTab, setActiveTab] = useState('controls');
  const [debrisData, setDebrisData] = useState({
    count: INITIAL_TELEMETRY.environment.debrisCount,
    nearby: INITIAL_TELEMETRY.environment.nearbyObjects,
    risk: INITIAL_TELEMETRY.safety.collisionRisk,
    velocity: 2.5,
    weight: 120,
    size: 1.8,
    composition: 'Mixed',
    detectionHistory: [0]
  });
  const [simulationStatistics, setSimulationStatistics] = useState({
    debrisAvoided: 0,
    distanceTraveled: 0,
    fuelEfficiency: 100
  });
  
  // Simulation updates
  useEffect(() => {
    if (!isRunning) return;
    
    const timerInterval = setInterval(() => {
      // Slowly decrease fuel
      setTelemetry(prev => ({
        ...prev,
        spacecraft: {
          ...prev.spacecraft,
          fuel: Math.max(0, prev.spacecraft.fuel - 0.01 * simSpeed)
        }
      }));
      
      // Increase distance traveled
      setSimulationStatistics(prev => ({
        ...prev,
        distanceTraveled: prev.distanceTraveled + (0.05 * simSpeed * telemetry.spacecraft.velocity)
      }));
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [isRunning, simSpeed, telemetry.spacecraft.velocity]);

  // Handle debris count changes from the canvas
  const handleDebrisCountChange = (count: number) => {
    setTelemetry(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        debrisCount: count
      }
    }));
    
    // Update dashboard data
    setDebrisData(prev => {
      // Add to detection history (keep last 20 measurements)
      const newHistory = [...prev.detectionHistory, count];
      if (newHistory.length > 20) newHistory.shift();
      
      return {
        ...prev,
        count: count,
        detectionHistory: newHistory
      };
    });
  };

  // Handle collision risk changes from the canvas
  const handleCollisionRiskChange = (risk: 'Low' | 'Medium' | 'High', nearbyCount: number) => {
    setTelemetry(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        nearbyObjects: nearbyCount
      },
      safety: {
        ...prev.safety,
        collisionRisk: risk
      }
    }));
    
    // Update dashboard data
    setDebrisData(prev => ({
      ...prev,
      nearby: nearbyCount,
      risk: risk
    }));
    
    // Show warning alert for high risk
    setShowWarning(risk === 'High');
    
    // If AI mode is on and risk is Medium or High, increment debris avoided
    if (aiMode !== 'off' && (risk === 'Medium' || risk === 'High')) {
      setSimulationStatistics(prev => ({
        ...prev,
        debrisAvoided: prev.debrisAvoided + 1
      }));
    }
  };

  // Function to dismiss warning
  const dismissWarning = () => {
    setShowWarning(false);
  };

  // Simulate changing telemetry data
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Randomize spacecraft telemetry
      const spacecraftVelocity = Math.floor(Math.random() * 5);
      
      // Randomize debris properties
      const debrisVelocity = 2 + Math.random() * 3;
      const newWeight = 80 + Math.random() * 150;
      const newSize = 0.5 + Math.random() * 3;
      
      // Randomize environment data
      const solarActivityOptions = ['Low', 'Moderate', 'High'] as const;
      const solarActivity = solarActivityOptions[Math.floor(Math.random() * 3)];
      
      // Update system integrity based on conditions
      const systemIntegrity = Math.max(
        80, 
        98 - (telemetry.safety.collisionRisk === 'High' ? 5 : 0)
      );
      
      // Update fuel efficiency calculation
      const fuelEfficiency = Math.max(
        60,
        100 - (Object.values(navigationControls).filter(Boolean).length * 5)
      );
      
      setTelemetry(prev => ({
        ...prev,
        spacecraft: {
          ...prev.spacecraft,
          velocity: spacecraftVelocity,
        },
        environment: {
          ...prev.environment,
          solarActivity
        },
        system: {
          ...prev.system,
          systemIntegrity
        },
        safety: {
          ...prev.safety,
          radiationLevel: solarActivity === 'High' ? 'Elevated' : 'Normal'
        }
      }));
      
      // Random compositions for debris
      const compositions = ['Metallic', 'Composite', 'Unknown', 'Mixed'];
      const randomComposition = compositions[Math.floor(Math.random() * compositions.length)];
      
      // Update dashboard data
      setDebrisData(prev => ({
        ...prev,
        velocity: debrisVelocity,
        weight: newWeight,
        size: newSize,
        composition: randomComposition
      }));
      
      // Update simulation statistics
      setSimulationStatistics(prev => ({
        ...prev,
        fuelEfficiency
      }));
      
      // Show toast for important events
      if (solarActivity === 'High' && Math.random() > 0.7) {
        toast("Solar Activity Warning", {
          description: "Increased solar radiation detected. Shield monitoring advised.",
          duration: 3000
        });
      }
      
    }, 3000 / simSpeed);

    return () => clearInterval(interval);
  }, [isRunning, simSpeed, telemetry.safety.collisionRisk, navigationControls]);

  // Handle navigation button press/release
  const handleNavigationPress = (direction: 'up' | 'down' | 'left' | 'right') => {
    setNavigationControls(prev => ({
      ...prev,
      [direction]: true
    }));
    
    // Reduce fuel when navigating
    setTelemetry(prev => ({
      ...prev,
      spacecraft: {
        ...prev.spacecraft,
        fuel: Math.max(0, prev.spacecraft.fuel - 0.1)
      }
    }));
  };

  const handleNavigationRelease = (direction: 'up' | 'down' | 'left' | 'right') => {
    setNavigationControls(prev => ({
      ...prev,
      [direction]: false
    }));
  };

  const handleSpeedChange = (speed: number) => {
    setSimSpeed(speed);
    toast(`Simulation Speed: ${speed}x`, { duration: 2000 });
  };

  const toggleSimulation = () => {
    setIsRunning(prev => !prev);
    toast(isRunning ? "Simulation Paused" : "Simulation Resumed", { duration: 2000 });
  };

  const changeAiMode = (mode: string) => {
    setAiMode(mode);
    // Update AI status in telemetry
    setTelemetry(prev => ({
      ...prev,
      system: {
        ...prev.system,
        aiStatus: mode === 'off' ? 'Inactive' : mode === 'avoid' ? 'Avoidance Active' : 'Tracking Active'
      }
    }));
    
    toast(`AI Mode: ${mode === 'off' ? 'Disabled' : mode === 'avoid' ? 'Avoidance' : 'Tracking'}`, { duration: 2000 });
  };

  // Handle radar range change
  const handleRadarRangeChange = (value: number[]) => {
    setRadarRange(value[0]);
  };

  // Reset simulation
  const resetSimulation = () => {
    setTelemetry(INITIAL_TELEMETRY);
    setSimSpeed(1);
    setIsRunning(true);
    setAiMode('off');
    setShowWarning(false);
    setNavigationControls({
      up: false,
      down: false,
      left: false,
      right: false
    });
    setSimulationStatistics({
      debrisAvoided: 0,
      distanceTraveled: 0,
      fuelEfficiency: 100
    });
    toast("Simulation Reset", { duration: 2000 });
  };

  return (
    <div className="flex-1 relative overflow-hidden mission-control-bg">
      {/* Modern Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-purple-900/30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_40%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_40%)] pointer-events-none"></div>

      {/* Main simulation area with modern overlay */}
      <div className="absolute inset-0 z-0">
        <SimulationCanvas 
          isRunning={isRunning} 
          simSpeed={simSpeed}
          radarRange={radarRange}
          aiMode={aiMode}
          navigationControls={navigationControls}
          onDebrisCountChange={handleDebrisCountChange}
          onCollisionRiskChange={handleCollisionRiskChange}
        />
      </div>

      {/* Modern Status Bar - Top */}
      <div className="absolute top-4 left-4 right-80 z-20">
        <div className="mission-panel p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="mission-label">System Status: OPERATIONAL</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="mission-label">Speed: {simSpeed}x</span>
              </div>
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4 text-cyan-400" />
                <span className="mission-label">Range: {radarRange}km</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="mission-value text-lg">{Math.round(simulationStatistics.distanceTraveled)} km</div>
              <div className="text-xs mission-subtitle">Distance Traveled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Collision warning alert - modernized */}
      {showWarning && (
        <div className="absolute top-24 left-4 right-auto z-20 max-w-sm">
          <div className="mission-panel border-red-500/50 bg-red-900/20 text-white animate-mission-glow backdrop-blur-xl">
            <div className="flex justify-between items-start p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="mission-title text-red-200 text-sm font-semibold mb-1">COLLISION RISK DETECTED</div>
                  <div className="text-xs mission-subtitle">
                    Critical proximity warning! Space debris detected within {Math.round(radarRange * 0.3)}km range.
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-200 hover:text-white hover:bg-red-800/50 mission-button-secondary" 
                onClick={dismissWarning}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Critical System Status - modernized */}
      {(telemetry.spacecraft.fuel < 20 || telemetry.spacecraft.shields < 30) && (
        <div className="absolute bottom-4 left-4 right-auto z-20 max-w-sm">
          <div className="mission-panel border-amber-500/50 bg-amber-900/20 text-white backdrop-blur-xl">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mission-title text-amber-200 text-sm font-semibold">SYSTEM ALERT</div>
              </div>
              <div className="space-y-1 text-xs mission-subtitle">
                {telemetry.spacecraft.fuel < 20 && (
                  <div>Fuel levels critical: {Math.round(telemetry.spacecraft.fuel)}% remaining</div>
                )}
                {telemetry.spacecraft.shields < 30 && (
                  <div>Shield integrity compromised: {Math.round(telemetry.spacecraft.shields)}% remaining</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Right sidebar with enhanced controls */}
      <div className="absolute top-0 right-0 bottom-0 w-80 mission-panel border-l border-green-500/20 overflow-y-auto z-10 backdrop-blur-xl">
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 mission-panel">
              <TabsTrigger value="controls" className="mission-button-secondary">Mission Control</TabsTrigger>
              <TabsTrigger value="dashboard" className="mission-button-secondary">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="controls" className="space-y-6">
              {/* Enhanced Telemetry Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-green-400" />
                  </div>
                  <h3 className="mission-title text-lg">Live Telemetry</h3>
                </div>

                {/* Spacecraft Data - Enhanced */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="mission-panel p-4 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Satellite className="h-4 w-4 text-green-400" />
                      <span className="text-xs mission-subtitle">Spacecraft</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="mission-label text-xs">Velocity</span>
                        <span className="mission-value text-sm">{telemetry.spacecraft.velocity} km/s</span>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="mission-label">Altitude</span>
                          <span className="mission-value">{telemetry.spacecraft.altitude} km</span>
                        </div>
                        <div className="mission-progress h-2 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-300"
                            style={{ width: `${telemetry.spacecraft.altitude / 10}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="mission-label">Fuel</span>
                          <span className={`mission-value ${telemetry.spacecraft.fuel < 20 ? 'text-red-400' : ''}`}>
                            {Math.round(telemetry.spacecraft.fuel)}%
                          </span>
                        </div>
                        <div className="mission-progress h-2 rounded-full">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              telemetry.spacecraft.fuel < 20 
                                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                : 'bg-gradient-to-r from-green-500 to-emerald-600'
                            }`}
                            style={{ width: `${telemetry.spacecraft.fuel}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="mission-label">Shields</span>
                          <span className={`mission-value ${telemetry.spacecraft.shields < 30 ? 'text-red-400' : ''}`}>
                            {Math.round(telemetry.spacecraft.shields)}%
                          </span>
                        </div>
                        <div className="mission-progress h-2 rounded-full">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              telemetry.spacecraft.shields < 30 
                                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                : 'bg-gradient-to-r from-blue-500 to-blue-600'
                            }`}
                            style={{ width: `${telemetry.spacecraft.shields}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mission-panel p-4 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs mission-subtitle">Environment</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="mission-label text-xs">Radar Range</span>
                        <span className="mission-value text-sm">{radarRange} km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="mission-label text-xs">Debris Count</span>
                        <span className="mission-value text-sm">{telemetry.environment.debrisCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="mission-label text-xs">Nearby Objects</span>
                        <span className="mission-value text-sm">{telemetry.environment.nearbyObjects}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="mission-label text-xs">Solar Activity</span>
                        <span className={`mission-value text-sm ${
                          telemetry.environment.solarActivity === 'High' ? 'text-red-400' : 
                          telemetry.environment.solarActivity === 'Moderate' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {telemetry.environment.solarActivity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mission-panel p-4 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-xs mission-subtitle">Safety</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="mission-label text-xs">Collision Risk</span>
                        <div className={`status-indicator text-xs ${
                          telemetry.safety.collisionRisk === 'Low' ? 'status-operational' : 
                          telemetry.safety.collisionRisk === 'Medium' ? 'status-warning' : 
                          'status-critical'
                        }`}>
                          {telemetry.safety.collisionRisk}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="mission-label text-xs">Radiation Level</span>
                        <div className={`status-indicator text-xs ${
                          telemetry.safety.radiationLevel === 'Normal' ? 'status-operational' : 'status-warning'
                        }`}>
                          {telemetry.safety.radiationLevel}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mission-panel p-4 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Power className="h-4 w-4 text-purple-400" />
                      <span className="text-xs mission-subtitle">System</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="mission-label text-xs">AI Status</span>
                        <span className="mission-value text-sm">{telemetry.system.aiStatus}</span>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="mission-label">System Integrity</span>
                          <span className={`mission-value ${telemetry.system.systemIntegrity < 90 ? 'text-yellow-400' : ''}`}>
                            {telemetry.system.systemIntegrity}%
                          </span>
                        </div>
                        <div className="mission-progress h-2 rounded-full">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300"
                            style={{ width: `${telemetry.system.systemIntegrity}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Command Core Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Power className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="mission-title text-lg">Command Core</h3>
                </div>
                
                <div className="mission-panel p-4 border border-blue-500/20">
                  <div className="mb-4">
                    <span className="mission-label block mb-3">Simulation Speed</span>
                    <div className="flex items-center justify-between gap-2">
                      <button 
                        className={`mission-button flex items-center gap-2 px-3 py-2 ${simSpeed === 1 ? 'border-green-400' : 'mission-button-secondary'}`}
                        onClick={() => handleSpeedChange(1)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span className="text-xs">1x</span>
                      </button>
                      <button 
                        className="mission-button flex items-center gap-2 px-3 py-2"
                        onClick={toggleSimulation}
                      >
                        {isRunning ? 
                          <Pause className="h-4 w-4" /> : 
                          <Play className="h-4 w-4" />
                        }
                        <span className="text-xs">{isRunning ? 'Pause' : 'Play'}</span>
                      </button>
                      <button 
                        className={`mission-button flex items-center gap-2 px-3 py-2 ${simSpeed === 2 ? 'border-green-400' : 'mission-button-secondary'}`}
                        onClick={() => handleSpeedChange(2)}
                      >
                        <FastForward className="h-4 w-4" />
                        <span className="text-xs">2x</span>
                      </button>
                      <button 
                        className={`mission-button flex items-center gap-2 px-3 py-2 ${simSpeed === 4 ? 'border-green-400' : 'mission-button-secondary'}`}
                        onClick={() => handleSpeedChange(4)}
                      >
                        <SkipForward className="h-4 w-4" />
                        <span className="text-xs">4x</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="mission-label">Radar Range</span>
                      <span className="mission-value">{radarRange} km</span>
                    </div>
                    <Slider 
                      value={[radarRange]} 
                      min={5} 
                      max={30} 
                      step={1} 
                      onValueChange={handleRadarRangeChange}
                      className="my-4"
                    />
                    <div className="flex justify-between text-xs mission-subtitle">
                      <span>5km</span>
                      <span>OPTIMAL: 15km</span>
                      <span>30km</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="mission-label">Simulation Status</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                        <span className="mission-value text-sm">{isRunning ? `Running (${simSpeed}x)` : 'Paused'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mission-button-danger"
                    onClick={resetSimulation}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Simulation
                  </Button>
                </div>
              </div>
              
              {/* Enhanced Navigation Hub */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="mission-title text-lg">Navigation Hub</h3>
                </div>
                
                <div className="mission-panel p-4 border border-cyan-500/20">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div></div>
                    <button 
                      className={`nav-control ${navigationControls.up ? 'bg-green-500/30 border-green-400' : ''}`}
                      onMouseDown={() => handleNavigationPress('up')}
                      onMouseUp={() => handleNavigationRelease('up')}
                      onMouseLeave={() => handleNavigationRelease('up')}
                      onTouchStart={() => handleNavigationPress('up')}
                      onTouchEnd={() => handleNavigationRelease('up')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <ArrowDown className="h-5 w-5" />
                    </button>
                    <div className="flex items-center justify-center">
                      <span className="text-xs mission-subtitle">Blow Down</span>
                    </div>
                    
                    <button 
                      className={`nav-control ${navigationControls.left ? 'bg-green-500/30 border-green-400' : ''}`}
                      onMouseDown={() => handleNavigationPress('left')}
                      onMouseUp={() => handleNavigationRelease('left')}
                      onMouseLeave={() => handleNavigationRelease('left')}
                      onTouchStart={() => handleNavigationPress('left')}
                      onTouchEnd={() => handleNavigationRelease('left')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 mission-panel rounded-lg flex items-center justify-center border border-green-500/30">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <button 
                      className={`nav-control ${navigationControls.right ? 'bg-green-500/30 border-green-400' : ''}`}
                      onMouseDown={() => handleNavigationPress('right')}
                      onMouseUp={() => handleNavigationRelease('right')}
                      onMouseLeave={() => handleNavigationRelease('right')}
                      onTouchStart={() => handleNavigationPress('right')}
                      onTouchEnd={() => handleNavigationRelease('right')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                    
                    <div></div>
                    <button 
                      className={`nav-control ${navigationControls.down ? 'bg-green-500/30 border-green-400' : ''}`}
                      onMouseDown={() => handleNavigationPress('down')}
                      onMouseUp={() => handleNavigationRelease('down')}
                      onMouseLeave={() => handleNavigationRelease('down')}
                      onTouchStart={() => handleNavigationPress('down')}
                      onTouchEnd={() => handleNavigationRelease('down')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <ArrowUp className="h-5 w-5" />
                    </button>
                    <div className="flex items-center justify-center">
                      <span className="text-xs mission-subtitle">Forward</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-center mission-subtitle p-3 mission-panel rounded-lg">
                    {telemetry.spacecraft.fuel <= 0 ? (
                      <span className="text-red-400">⚠️ Fuel depleted - Thrusters offline</span>
                    ) : Object.values(navigationControls).some(control => control) ? (
                      <span className="text-green-400">🚀 Thrusters active</span>
                    ) : (
                      'Use navigation controls to maneuver spacecraft'
                    )}
                  </div>
                </div>
              </div>
              
              {/* Enhanced AI Nexus */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="mission-title text-lg">AI Nexus</h3>
                </div>
                
                <div className="mission-panel p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="mission-label">AI Control System</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs mission-subtitle">Manual</span>
                      <div 
                        className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-all duration-300 ${
                          aiMode !== 'off' ? 'bg-green-500/30 border border-green-400' : 'bg-gray-700/50 border border-gray-600'
                        }`}
                        onClick={() => changeAiMode(aiMode === 'off' ? 'avoid' : 'off')}
                      >
                        <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          aiMode !== 'off' ? 'bg-green-400 translate-x-6' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <span className="text-xs mission-subtitle">Auto</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button 
                      className={`mission-button-secondary flex flex-col items-center justify-center py-3 gap-2 ${aiMode === 'off' ? 'border-green-400 bg-green-500/10' : ''}`}
                      onClick={() => changeAiMode('off')}
                    >
                      <Power className="h-5 w-5" />
                      <span className="text-xs">Manual</span>
                    </button>
                    <button 
                      className={`mission-button-secondary flex flex-col items-center justify-center py-3 gap-2 ${aiMode === 'avoid' ? 'border-green-400 bg-green-500/10' : ''}`}
                      onClick={() => changeAiMode('avoid')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <Shield className="h-5 w-5" />
                      <span className="text-xs">Avoid</span>
                    </button>
                    <button 
                      className={`mission-button-secondary flex flex-col items-center justify-center py-3 gap-2 ${aiMode === 'follow' ? 'border-green-400 bg-green-500/10' : ''}`}
                      onClick={() => changeAiMode('follow')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <Target className="h-5 w-5" />
                      <span className="text-xs">Track</span>
                    </button>
                  </div>
                  
                  <div className="mission-panel p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${aiMode !== 'off' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                      <span className="text-xs mission-label">
                        {aiMode !== 'off' ? `AI ${aiMode} mode active` : 'Manual navigation mode'}
                      </span>
                    </div>
                    <div className="text-xs mission-subtitle mt-2">
                      {aiMode === 'avoid' && 'System automatically avoiding detected debris'}
                      {aiMode === 'follow' && 'System tracking nearest debris object'}
                      {aiMode === 'off' && 'Manual control - use navigation hub'}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="dashboard">
              <DebrisDashboard currentData={debrisData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
