
import { ReactNode } from 'react';
import { Settings, ChevronDown, Power, Pause, Play } from 'lucide-react';

interface MissionControlPanelProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  isActive?: boolean;
  onToggle?: () => void;
}

const MissionControlPanel = ({ 
  title, 
  icon, 
  children, 
  defaultExpanded = true,
  className = '',
  isActive = false,
  onToggle
}: MissionControlPanelProps) => {
  return (
    <div className={`mission-panel ${className} animate-mission-slide-in ${isActive ? 'animate-mission-glow' : ''}`}>
      <div className="flex items-center gap-3 p-5 border-b border-green-500/20">
        {icon && (
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="text-xs mission-subtitle">Mission critical controls</p>
        </div>
        
        {/* Status Indicator */}
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-500'} animate-pulse`}></div>
        
        {onToggle && (
          <button 
            onClick={onToggle}
            className="mission-button-secondary p-2 rounded-lg"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        )}
        
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="p-5 space-y-6">
        {children}
      </div>
    </div>
  );
};

export default MissionControlPanel;
