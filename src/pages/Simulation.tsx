import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Pause, Play, FastForward, SkipForward, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield, Power, Target, Satellite, X } from 'lucide-react';
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
    risk: INITIAL_TELEMETRY.safety.collisionRisk as 'Low' | 'Medium' | 'High',
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
    <div className="flex-1 relative overflow-hidden starfield">
      {/* Main simulation area */}
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

      {/* Collision warning alert - moved to left side */}
      {showWarning && (
        <div className="absolute top-24 left-4 right-auto z-20 max-w-xs">
          <Alert variant="destructive" className="border-red-600 bg-red-900/40 text-white animate-pulse glassmorphism">
            <div className="flex justify-between items-start">
              <div>
                <AlertTitle className="text-red-200 highlight-text">COLLISION RISK DETECTED</AlertTitle>
                <AlertDescription>
                  Critical proximity warning! Space debris detected within {Math.round(radarRange * 0.3)}km range.
                </AlertDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-200 hover:text-white hover:bg-red-800/50" 
                onClick={dismissWarning}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {/* Critical System Status - also moved to left side */}
      {(telemetry.spacecraft.fuel < 20 || telemetry.spacecraft.shields < 30) && (
        <div className="absolute bottom-4 left-4 right-auto z-20 max-w-xs">
          <Alert variant="destructive" className="border-amber-600 bg-amber-900/40 text-white glassmorphism">
            <AlertTitle className="text-amber-200">SYSTEM ALERT</AlertTitle>
            <AlertDescription>
              {telemetry.spacecraft.fuel < 20 && (
                <div className="mb-1">Fuel levels critical: {Math.round(telemetry.spacecraft.fuel)}% remaining</div>
              )}
              {telemetry.spacecraft.shields < 30 && (
                <div>Shield integrity compromised: {Math.round(telemetry.spacecraft.shields)}% remaining</div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Right sidebar with controls */}
      <div className="absolute top-0 right-0 bottom-0 w-80 glassmorphism border-l border-space-grid overflow-y-auto z-10">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="controls" className="space-y-6">
              {/* Telemetry Section */}
              <div className="space-y-4 floating-panel">
                <div className="section-title">
                  Telemetry
                </div>

                {/* Spacecraft Data */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glassmorphism p-3 glow-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Satellite className="h-4 w-4 text-space-accent" />
                      <span className="text-xs text-gray-400">Spacecraft</span>
                    </div>
                    <div className="space-y-3">
                      <div className="data-cell">
                        <span className="data-label">Velocity</span>
                        <span className="data-value">{telemetry.spacecraft.velocity} km/s</span>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="data-label">Altitude</span>
                          <span className="data-value">{telemetry.spacecraft.altitude} km</span>
                        </div>
                        <Progress value={telemetry.spacecraft.altitude / 10} className="h-1 mt-1 tech-progress-bar" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="data-label">Fuel</span>
                          <span className={`data-value ${telemetry.spacecraft.fuel < 20 ? 'text-red-500' : ''}`}>
                            {Math.round(telemetry.spacecraft.fuel)}%
                          </span>
                        </div>
                        <Progress 
                          value={telemetry.spacecraft.fuel} 
                          className={`h-1 mt-1 ${
                            telemetry.spacecraft.fuel < 20 ? 'bg-red-900' : 'tech-progress-bar'
                          }`} 
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="data-label">Shields</span>
                          <span className={`data-value ${telemetry.spacecraft.shields < 30 ? 'text-red-500' : ''}`}>
                            {Math.round(telemetry.spacecraft.shields)}%
                          </span>
                        </div>
                        <Progress 
                          value={telemetry.spacecraft.shields} 
                          className={`h-1 mt-1 ${
                            telemetry.spacecraft.shields < 30 ? 'bg-red-900' : 'tech-progress-bar'
                          }`} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="glassmorphism p-3 glow-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-space-accent" />
                      <span className="text-xs text-gray-400">Environment</span>
                    </div>
                    <div className="space-y-2">
                      <div className="data-cell">
                        <span className="data-label">Radar Range</span>
                        <span className="data-value">{radarRange} km</span>
                      </div>
                      <div className="data-cell">
                        <span className="data-label">Debris Count</span>
                        <span className="data-value">{telemetry.environment.debrisCount}</span>
                      </div>
                      <div className="data-cell">
                        <span className="data-label">Nearby Objects</span>
                        <span className="data-value">{telemetry.environment.nearbyObjects}</span>
                      </div>
                      <div className="data-cell">
                        <span className="data-label">Solar Activity</span>
                        <span className={`data-value ${
                          telemetry.environment.solarActivity === 'High' ? 'text-red-500' : 
                          telemetry.environment.solarActivity === 'Moderate' ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {telemetry.environment.solarActivity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="glassmorphism p-3 glow-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-space-accent" />
                      <span className="text-xs text-gray-400">Safety</span>
                    </div>
                    <div className="space-y-3">
                      <div className="data-cell">
                        <span className="data-label">Collision Risk</span>
                        <span 
                          className={`data-value ${
                            telemetry.safety.collisionRisk === 'Low' ? 'text-green-500' : 
                            telemetry.safety.collisionRisk === 'Medium' ? 'text-yellow-500' : 
                            'text-red-500'
                          }`}
                        >
                          {telemetry.safety.collisionRisk}
                        </span>
                      </div>
                      <div className="data-cell">
                        <span className="data-label">Radiation Level</span>
                        <span 
                          className={`data-value ${
                            telemetry.safety.radiationLevel === 'Normal' ? 'text-green-500' : 'text-yellow-500'
                          }`}
                        >
                          {telemetry.safety.radiationLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="glassmorphism p-3 glow-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Power className="h-4 w-4 text-space-accent" />
                      <span className="text-xs text-gray-400">System</span>
                    </div>
                    <div className="space-y-3">
                      <div className="data-cell">
                        <span className="data-label">AI Status</span>
                        <span className="data-value">{telemetry.system.aiStatus}</span>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="data-label">System Integrity</span>
                          <span className={`data-value ${telemetry.system.systemIntegrity < 90 ? 'text-yellow-500' : ''}`}>
                            {telemetry.system.systemIntegrity}%
                          </span>
                        </div>
                        <Progress 
                          value={telemetry.system.systemIntegrity} 
                          className="h-1 mt-1 tech-progress-bar" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Command Core Section */}
              <div className="space-y-4">
                <div className="section-title">
                  Command Core
                </div>
                
                <div className="glassmorphism p-3 dash-border">
                  <div className="mb-4">
                    <span className="text-xs text-gray-400 block mb-2">Simulation Speed</span>
                    <div className="flex items-center justify-between gap-2">
                      <button 
                        className="neo-button"
                        onClick={() => handleSpeedChange(1)}
                      >
                        <RotateCcw className={`h-4 w-4 ${simSpeed === 1 ? 'text-space-accent' : 'text-gray-400'}`} />
                      </button>
                      <button 
                        className="neo-button"
                        onClick={toggleSimulation}
                      >
                        {isRunning ? 
                          <Pause className="h-4 w-4 text-gray-400" /> : 
                          <Play className="h-4 w-4 text-space-accent" />
                        }
                      </button>
                      <button 
                        className="neo-button"
                        onClick={() => handleSpeedChange(2)}
                      >
                        <FastForward className={`h-4 w-4 ${simSpeed === 2 ? 'text-space-accent' : 'text-gray-400'}`} />
                      </button>
                      <button 
                        className="neo-button"
                        onClick={() => handleSpeedChange(4)}
                      >
                        <SkipForward className={`h-4 w-4 ${simSpeed === 4 ? 'text-space-accent' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">Radar Range</span>
                      <span className="text-xs font-mono">{radarRange} km</span>
                    </div>
                    <Slider 
                      value={[radarRange]} 
                      min={5} 
                      max={30} 
                      step={1} 
                      onValueChange={handleRadarRangeChange}
                      className="my-5"
                    />
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Simulation Status</span>
                      <div className="flex items-center gap-1">
                        <span className="indicator-dot bg-green-500"></span>
                        <span className="text-xs font-mono">{isRunning ? `Running (${simSpeed}x)` : 'Paused'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-space-panel border-space-accent hover:bg-space-accent/20"
                    onClick={resetSimulation}
                  >
                    Reset Simulation
                  </Button>
                </div>
              </div>
              
              {/* Navigation Hub - Updated control labels */}
              <div className="space-y-4">
                <div className="section-title">
                  Navigation Hub
                </div>
                
                <div className="glassmorphism p-3 glow-border">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div></div>
                    <button 
                      className={`neo-button flex justify-center items-center ${navigationControls.up ? 'bg-space-accent/20 border-space-accent' : ''}`}
                      onMouseDown={() => handleNavigationPress('up')}
                      onMouseUp={() => handleNavigationRelease('up')}
                      onMouseLeave={() => handleNavigationRelease('up')}
                      onTouchStart={() => handleNavigationPress('up')}
                      onTouchEnd={() => handleNavigationRelease('up')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <ArrowDown className="h-4 w-4" />
                      <span className="text-xs ml-1">Blow Down</span>
                    </button>
                    <div></div>
                    
                    <button 
                      className={`neo-button flex justify-center items-center ${navigationControls.left ? 'bg-space-accent/20 border-space-accent' : ''}`}
                      onMouseDown={() => handleNavigationPress('left')}
                      onMouseUp={() => handleNavigationRelease('left')}
                      onMouseLeave={() => handleNavigationRelease('left')}
                      onTouchStart={() => handleNavigationPress('left')}
                      onTouchEnd={() => handleNavigationRelease('left')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button 
                      className={`neo-button flex justify-center items-center ${navigationControls.down ? 'bg-space-accent/20 border-space-accent' : ''}`}
                      onMouseDown={() => handleNavigationPress('down')}
                      onMouseUp={() => handleNavigationRelease('down')}
                      onMouseLeave={() => handleNavigationRelease('down')}
                      onTouchStart={() => handleNavigationPress('down')}
                      onTouchEnd={() => handleNavigationRelease('down')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button 
                      className={`neo-button flex justify-center items-center ${navigationControls.right ? 'bg-space-accent/20 border-space-accent' : ''}`}
                      onMouseDown={() => handleNavigationPress('right')}
                      onMouseUp={() => handleNavigationRelease('right')}
                      onMouseLeave={() => handleNavigationRelease('right')}
                      onTouchStart={() => handleNavigationPress('right')}
                      onTouchEnd={() => handleNavigationRelease('right')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-center data-label">
                    {telemetry.spacecraft.fuel <= 0 ? (
                      <span className="text-red-500">Fuel depleted - Thrusters offline</span>
                    ) : Object.values(navigationControls).some(control => control) ? (
                      'Thrusters active'
                    ) : (
                      'Use controls to navigate spacecraft'
                    )}
                  </div>
                </div>
              </div>
              
              {/* AI Nexus */}
              <div className="space-y-4">
                <div className="section-title">
                  AI Nexus
                </div>
                
                <div className="glassmorphism p-3 glow-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">AI Control</span>
                    <div className="flex items-center">
                      <span className="text-xs">Manual</span>
                      <div 
                        className="w-8 h-4 mx-2 rounded-full bg-gray-700 flex items-center p-0.5 cursor-pointer"
                        onClick={() => changeAiMode(aiMode === 'off' ? 'avoid' : 'off')}
                      >
                        <div className={`w-3 h-3 rounded-full transition-all ${aiMode !== 'off' ? 'bg-space-accent translate-x-4' : 'bg-gray-400'}`}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      className={`neo-button flex flex-col items-center justify-center py-2 ${aiMode === 'off' ? 'border-space-accent' : ''}`}
                      onClick={() => changeAiMode('off')}
                    >
                      <Power className="h-4 w-4 mb-1" />
                      <span className="text-xs">Off</span>
                    </button>
                    <button 
                      className={`neo-button flex flex-col items-center justify-center py-2 ${aiMode === 'avoid' ? 'border-space-accent' : ''}`}
                      onClick={() => changeAiMode('avoid')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <Shield className="h-4 w-4 mb-1" />
                      <span className="text-xs">Avoid</span>
                    </button>
                    <button 
                      className={`neo-button flex flex-col items-center justify-center py-2 ${aiMode === 'follow' ? 'border-space-accent' : ''}`}
                      onClick={() => changeAiMode('follow')}
                      disabled={telemetry.spacecraft.fuel <= 0}
                    >
                      <Target className="h-4 w-4 mb-1" />
                      <span className="text-xs">Follow</span>
                    </button>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-center mt-2">
                      <span className={`indicator-dot ${aiMode !== 'off' ? 'bg-space-accent' : 'bg-red-500'} mr-2`}></span>
                      <span className="text-xs data-label">
                        {aiMode !== 'off' ? `AI ${aiMode} mode active` : 'AI navigation disabled'}
                      </span>
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
