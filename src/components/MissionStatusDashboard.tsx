
import { ReactNode } from 'react';
import { Activity, Shield, Radar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface StatusMetric {
  label: string;
  value: string | number;
  unit?: string;
  status: 'operational' | 'warning' | 'critical';
  icon: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

interface MissionStatusDashboardProps {
  systemStatus: 'operational' | 'warning' | 'critical';
  debrisCount: number;
  collisionRisk: 'Low' | 'Medium' | 'High';
  radarRange: number;
  isSimulationRunning: boolean;
}

const MissionStatusDashboard = ({
  systemStatus,
  debrisCount,
  collisionRisk,
  radarRange,
  isSimulationRunning
}: MissionStatusDashboardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'status-operational';
      case 'warning': return 'status-warning';
      case 'critical': return 'status-critical';
      default: return 'status-operational';
    }
  };

  const getCollisionRiskStatus = (risk: string) => {
    switch (risk) {
      case 'Low': return 'operational';
      case 'Medium': return 'warning';
      case 'High': return 'critical';
      default: return 'operational';
    }
  };

  const metrics: StatusMetric[] = [
    {
      label: 'System Status',
      value: systemStatus.toUpperCase(),
      status: systemStatus as 'operational' | 'warning' | 'critical',
      icon: <Shield className="w-5 h-5" />,
      description: 'Overall system health'
    },
    {
      label: 'Debris Detected',
      value: debrisCount,
      unit: ' objects',
      status: debrisCount > 10 ? 'warning' : debrisCount > 20 ? 'critical' : 'operational',
      icon: <Radar className="w-5 h-5" />,
      trend: 'stable',
      description: 'Within radar range'
    },
    {
      label: 'Collision Risk',
      value: collisionRisk,
      status: getCollisionRiskStatus(collisionRisk) as 'operational' | 'warning' | 'critical',
      icon: <AlertTriangle className="w-5 h-5" />,
      description: 'Proximity assessment'
    },
    {
      label: 'Radar Range',
      value: radarRange,
      unit: ' km',
      status: 'operational',
      icon: <Activity className="w-5 h-5" />,
      description: 'Detection radius'
    },
    {
      label: 'Simulation',
      value: isSimulationRunning ? 'ACTIVE' : 'STANDBY',
      status: isSimulationRunning ? 'operational' : 'warning',
      icon: isSimulationRunning ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />,
      description: 'Mission status'
    }
  ];

  return (
    <div className="mission-panel p-6 animate-mission-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
          <Activity className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Mission Status</h2>
          <p className="text-sm mission-subtitle">Real-time system monitoring</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="status-card p-4 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 ${getStatusColor(metric.status)}`}>
                  {metric.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{metric.label}</h3>
                  {metric.description && (
                    <p className="text-xs mission-subtitle">{metric.description}</p>
                  )}
                </div>
              </div>
              {metric.trend && (
                <span className={`text-xs font-medium ${
                  metric.trend === 'up' ? 'text-red-400' : 
                  metric.trend === 'down' ? 'text-green-400' : 
                  'text-gray-400'
                }`}>
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                </span>
              )}
            </div>
            
            <div className="flex items-end gap-2">
              <span className={`text-xl font-bold mission-value`}>
                {metric.value}
              </span>
              {metric.unit && (
                <span className="text-sm mission-subtitle mb-1">{metric.unit}</span>
              )}
              <div className={`status-indicator ${getStatusColor(metric.status)} text-xs ml-auto`}>
                {metric.status.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* System Health Bar */}
      <div className="mt-6 pt-6 border-t border-green-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="mission-label">System Health</span>
          <span className="mission-value">
            {systemStatus === 'operational' ? '98%' : 
             systemStatus === 'warning' ? '75%' : '45%'}
          </span>
        </div>
        <div className="mission-progress">
          <div 
            className="mission-progress-fill"
            style={{ 
              width: `${systemStatus === 'operational' ? 98 : 
                        systemStatus === 'warning' ? 75 : 45}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MissionStatusDashboard;
