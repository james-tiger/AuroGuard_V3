
interface MissionSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  status?: 'normal' | 'warning' | 'critical';
  description?: string;
}

const MissionSlider = ({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  unit = '',
  onChange,
  status = 'normal',
  description
}: MissionSliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const getStatusColor = () => {
    switch (status) {
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'critical': return 'from-red-500 to-red-600';
      default: return 'from-green-500 to-emerald-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="mission-label">{label}</label>
          {description && (
            <p className="text-xs mission-subtitle mt-1">{description}</p>
          )}
        </div>
        <div className="text-right">
          <span className="mission-value text-lg">
            {value}{unit}
          </span>
          <div className={`status-indicator ${
            status === 'warning' ? 'status-warning' : 
            status === 'critical' ? 'status-critical' : 
            'status-operational'
          } text-xs`}>
            {status.toUpperCase()}
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="mission-progress h-3">
          <div 
            className={`h-full bg-gradient-to-r ${getStatusColor()} border-radius-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      <div className="flex justify-between text-xs mission-subtitle">
        <span>{min}{unit}</span>
        <span className="mission-value">OPTIMAL: {Math.round((min + max) / 2)}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export default MissionSlider;
