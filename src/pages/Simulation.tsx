
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Pause, Play, FastForward, SkipForward, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield, Power, Target, Satellite, X } from 'lucide-react';
import SimulationCanvas from '@/components/SimulationCanvas';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Mock data for simulation
const INITIAL_TELEMETRY = {
  spacecraft: {
    velocity: 0,
    altitude: 400,
  },
  environment: {
    debrisCount: 25,
    nearbyObjects: 0,
  },
  safety: {
    collisionRisk: 'Low',
  },
  system: {
    aiStatus: 'Inactive',
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

  // Handle debris count changes from the canvas
  const handleDebrisCountChange = (count: number) => {
    setTelemetry(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        debrisCount: count
      }
    }));
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
    
    // Show warning alert for high risk
    setShowWarning(risk === 'High');
  };

  // Function to dismiss warning
  const dismissWarning = () => {
    setShowWarning(false);
  };

  // Simulate changing telemetry data
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTelemetry(prev => {
        return {
          ...prev,
          spacecraft: {
            ...prev.spacecraft,
            velocity: Math.floor(Math.random() * 5),
          }
        };
      });
    }, 3000 / simSpeed);

    return () => clearInterval(interval);
  }, [isRunning, simSpeed]);

  // Handle navigation button press/release
  const handleNavigationPress = (direction: 'up' | 'down' | 'left' | 'right') => {
    setNavigationControls(prev => ({
      ...prev,
      [direction]: true
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
  };

  const toggleSimulation = () => {
    setIsRunning(prev => !prev);
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
  };

  // Handle radar range change
  const handleRadarRangeChange = (value: number[]) => {
    setRadarRange(value[0]);
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

      {/* Collision warning alert */}
      {showWarning && (
        <div className="absolute top-4 left-4 right-4 z-20">
          <Alert variant="destructive" className="border-red-600 bg-red-900/40 text-white animate-pulse">
            <div className="flex justify-between items-start">
              <div>
                <AlertTitle className="text-red-200">COLLISION RISK DETECTED</AlertTitle>
                <AlertDescription>
                  Critical proximity warning! Space debris detected within dangerous range.
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

      {/* Right sidebar with controls */}
      <div className="absolute top-0 right-0 bottom-0 w-80 bg-space-panel bg-opacity-90 border-l border-space-grid overflow-y-auto z-10">
        <div className="p-4 space-y-6">
          {/* Telemetry Section */}
          <div className="space-y-4">
            <div className="tech-panel-header">
              <h2 className="text-sm font-semibold text-gray-200 pl-3">Telemetry</h2>
            </div>

            {/* Spacecraft Data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="tech-panel p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Satellite className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Spacecraft</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Velocity</span>
                      <span className="font-mono">{telemetry.spacecraft.velocity} km/s</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Altitude</span>
                      <span className="font-mono">{telemetry.spacecraft.altitude} km</span>
                    </div>
                    <Progress value={telemetry.spacecraft.altitude / 10} className="h-1 mt-1" />
                  </div>
                </div>
              </div>

              <div className="tech-panel p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Environment</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Radar Range</span>
                      <span className="font-mono">{radarRange} km</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Debris Count</span>
                      <span className="font-mono">{telemetry.environment.debrisCount}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Nearby Objects</span>
                      <span className="font-mono">{telemetry.environment.nearbyObjects}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tech-panel p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400">Safety</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Collision Risk</span>
                      <span 
                        className={`font-mono ${
                          telemetry.safety.collisionRisk === 'Low' ? 'text-green-500' : 
                          telemetry.safety.collisionRisk === 'Medium' ? 'text-yellow-500' : 
                          'text-red-500'
                        }`}
                      >
                        {telemetry.safety.collisionRisk}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tech-panel p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Power className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400">System</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">AI Status</span>
                      <span className="font-mono">{telemetry.system.aiStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Command Core Section */}
          <div className="space-y-4">
            <div className="tech-panel-header">
              <h2 className="text-sm font-semibold text-gray-200 pl-3">Command Core</h2>
            </div>
            
            <div className="tech-panel p-3">
              <div className="mb-4">
                <span className="text-xs text-gray-400 block mb-2">Simulation Speed</span>
                <div className="flex items-center justify-between gap-2">
                  <button 
                    className="bg-space-panel border border-gray-700 rounded p-1 hover:bg-gray-800 transition-colors"
                    onClick={() => handleSpeedChange(1)}
                  >
                    <RotateCcw className={`h-4 w-4 ${simSpeed === 1 ? 'text-space-accent' : 'text-gray-400'}`} />
                  </button>
                  <button 
                    className="bg-space-panel border border-gray-700 rounded p-1 hover:bg-gray-800 transition-colors"
                    onClick={toggleSimulation}
                  >
                    {isRunning ? 
                      <Pause className="h-4 w-4 text-gray-400" /> : 
                      <Play className="h-4 w-4 text-space-accent" />
                    }
                  </button>
                  <button 
                    className="bg-space-panel border border-gray-700 rounded p-1 hover:bg-gray-800 transition-colors"
                    onClick={() => handleSpeedChange(2)}
                  >
                    <FastForward className={`h-4 w-4 ${simSpeed === 2 ? 'text-space-accent' : 'text-gray-400'}`} />
                  </button>
                  <button 
                    className="bg-space-panel border border-gray-700 rounded p-1 hover:bg-gray-800 transition-colors"
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
            </div>
          </div>
          
          {/* Navigation Hub */}
          <div className="space-y-4">
            <div className="tech-panel-header">
              <h2 className="text-sm font-semibold text-gray-200 pl-3">Navigation Hub</h2>
            </div>
            
            <div className="tech-panel p-3">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div></div>
                <button 
                  className={`tech-button flex justify-center items-center ${navigationControls.up ? 'bg-space-accent/20 border-space-accent' : ''}`}
                  onMouseDown={() => handleNavigationPress('up')}
                  onMouseUp={() => handleNavigationRelease('up')}
                  onMouseLeave={() => handleNavigationRelease('up')}
                  onTouchStart={() => handleNavigationPress('up')}
                  onTouchEnd={() => handleNavigationRelease('up')}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <div></div>
                
                <button 
                  className={`tech-button flex justify-center items-center ${navigationControls.left ? 'bg-space-accent/20 border-space-accent' : ''}`}
                  onMouseDown={() => handleNavigationPress('left')}
                  onMouseUp={() => handleNavigationRelease('left')}
                  onMouseLeave={() => handleNavigationRelease('left')}
                  onTouchStart={() => handleNavigationPress('left')}
                  onTouchEnd={() => handleNavigationRelease('left')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button 
                  className={`tech-button flex justify-center items-center ${navigationControls.down ? 'bg-space-accent/20 border-space-accent' : ''}`}
                  onMouseDown={() => handleNavigationPress('down')}
                  onMouseUp={() => handleNavigationRelease('down')}
                  onMouseLeave={() => handleNavigationRelease('down')}
                  onTouchStart={() => handleNavigationPress('down')}
                  onTouchEnd={() => handleNavigationRelease('down')}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button 
                  className={`tech-button flex justify-center items-center ${navigationControls.right ? 'bg-space-accent/20 border-space-accent' : ''}`}
                  onMouseDown={() => handleNavigationPress('right')}
                  onMouseUp={() => handleNavigationRelease('right')}
                  onMouseLeave={() => handleNavigationRelease('right')}
                  onTouchStart={() => handleNavigationPress('right')}
                  onTouchEnd={() => handleNavigationRelease('right')}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-xs text-gray-400 text-center">
                {Object.values(navigationControls).some(control => control) 
                  ? 'Thrusters active' 
                  : 'Use controls to navigate spacecraft'}
              </div>
            </div>
          </div>
          
          {/* AI Nexus */}
          <div className="space-y-4">
            <div className="tech-panel-header">
              <h2 className="text-sm font-semibold text-gray-200 pl-3">AI Nexus</h2>
            </div>
            
            <div className="tech-panel p-3">
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
                  className={`tech-button flex flex-col items-center justify-center py-2 ${aiMode === 'off' ? 'border-space-accent' : ''}`}
                  onClick={() => changeAiMode('off')}
                >
                  <Power className="h-4 w-4 mb-1" />
                  <span className="text-xs">Off</span>
                </button>
                <button 
                  className={`tech-button flex flex-col items-center justify-center py-2 ${aiMode === 'avoid' ? 'border-space-accent' : ''}`}
                  onClick={() => changeAiMode('avoid')}
                >
                  <Shield className="h-4 w-4 mb-1" />
                  <span className="text-xs">Avoid</span>
                </button>
                <button 
                  className={`tech-button flex flex-col items-center justify-center py-2 ${aiMode === 'follow' ? 'border-space-accent' : ''}`}
                  onClick={() => changeAiMode('follow')}
                >
                  <Target className="h-4 w-4 mb-1" />
                  <span className="text-xs">Follow</span>
                </button>
              </div>
              
              <div className="mt-3">
                <div className="flex items-center mt-2">
                  <span className={`indicator-dot ${aiMode !== 'off' ? 'bg-space-accent' : 'bg-red-500'} mr-2`}></span>
                  <span className="text-xs text-gray-400">
                    {aiMode !== 'off' ? `AI ${aiMode} mode active` : 'AI navigation disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
