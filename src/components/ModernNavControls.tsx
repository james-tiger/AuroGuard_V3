
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface ModernNavControlsProps {
  controls: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  onControlChange: (direction: 'up' | 'down' | 'left' | 'right', active: boolean) => void;
}

const ModernNavControls = ({ controls, onControlChange }: ModernNavControlsProps) => {
  const handleMouseDown = (direction: 'up' | 'down' | 'left' | 'right') => {
    onControlChange(direction, true);
  };

  const handleMouseUp = (direction: 'up' | 'down' | 'left' | 'right') => {
    onControlChange(direction, false);
  };

  const getButtonClass = (active: boolean) => 
    `nav-arrow ${active ? 'animate-pulse-glow bg-blue-500/40' : ''}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-sm font-semibold text-slate-300 mb-2">Navigation Controls</h3>
      
      {/* Up */}
      <button
        className={getButtonClass(controls.up)}
        onMouseDown={() => handleMouseDown('up')}
        onMouseUp={() => handleMouseUp('up')}
        onMouseLeave={() => handleMouseUp('up')}
      >
        <ArrowDown className="w-5 h-5 text-blue-300" />
      </button>
      
      {/* Left, Center, Right */}
      <div className="flex items-center gap-3">
        <button
          className={getButtonClass(controls.left)}
          onMouseDown={() => handleMouseDown('left')}
          onMouseUp={() => handleMouseUp('left')}
          onMouseLeave={() => handleMouseUp('left')}
        >
          <ArrowLeft className="w-5 h-5 text-blue-300" />
        </button>
        
        <div className="w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>
        
        <button
          className={getButtonClass(controls.right)}
          onMouseDown={() => handleMouseDown('right')}
          onMouseUp={() => handleMouseUp('right')}
          onMouseLeave={() => handleMouseUp('right')}
        >
          <ArrowRight className="w-5 h-5 text-blue-300" />
        </button>
      </div>
      
      {/* Down */}
      <button
        className={getButtonClass(controls.down)}
        onMouseDown={() => handleMouseDown('down')}
        onMouseUp={() => handleMouseUp('down')}
        onMouseLeave={() => handleMouseUp('down')}
      >
        <ArrowUp className="w-5 h-5 text-blue-300" />
      </button>
      
      <p className="text-xs text-slate-500 text-center mt-2">
        Hold to activate thrusters
      </p>
    </div>
  );
};

export default ModernNavControls;
