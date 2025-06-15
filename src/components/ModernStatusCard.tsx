
import { ReactNode } from 'react';

interface ModernStatusCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  status?: 'low' | 'medium' | 'high';
  description?: string;
}

const ModernStatusCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  status = 'low',
  description 
}: ModernStatusCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-red-400';
      case 'down': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'high': return 'text-red-400 shadow-red-500/20';
      case 'medium': return 'text-yellow-400 shadow-yellow-500/20';
      default: return 'text-green-400 shadow-green-500/20';
    }
  };

  return (
    <div className="modern-card p-6 animate-float-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 ${getStatusColor()}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            {description && (
              <p className="text-sm text-slate-400">{description}</p>
            )}
          </div>
        </div>
        {trend && (
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </span>
        )}
      </div>
      
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold ${getStatusColor()}`}>
          {value}
        </span>
        <div className={`status-indicator status-${status} text-xs`}>
          {status.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default ModernStatusCard;
