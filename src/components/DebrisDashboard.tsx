
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Trash, Database, Gauge, Weight } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DebrisData {
  count: number;
  nearby: number;
  risk: 'Low' | 'Medium' | 'High';
  velocity: number;
  weight: number;
  size: number;
  timestamp: string;
}

interface DebrisDashboardProps {
  currentData: {
    count: number;
    nearby: number;
    risk: 'Low' | 'Medium' | 'High';
    velocity: number;
    weight: number;
    size: number;
  };
}

const DebrisDashboard: React.FC<DebrisDashboardProps> = ({ currentData }) => {
  // Create mock historical data
  const generateHistoricalData = (): DebrisData[] => {
    const data: DebrisData[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const pastDate = new Date(now);
      pastDate.setMinutes(now.getMinutes() - i);
      
      data.push({
        count: Math.floor(Math.random() * 10) + 20,
        nearby: Math.floor(Math.random() * 5),
        risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
        velocity: Math.random() * 5 + 1,
        weight: Math.random() * 200 + 50,
        size: Math.random() * 3 + 0.5,
        timestamp: pastDate.toISOString()
      });
    }
    
    // Replace the last entry with current data
    data[data.length - 1] = {
      ...currentData,
      timestamp: new Date().toISOString()
    };
    
    return data;
  };
  
  const historicalData = generateHistoricalData();
  
  // Format data for charts
  const timeLabels = historicalData.map(data => {
    const date = new Date(data.timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  });
  
  const debrisCountData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Total Debris',
        data: historicalData.map(data => data.count),
        borderColor: 'rgba(5, 233, 209, 1)',
        backgroundColor: 'rgba(5, 233, 209, 0.5)',
        tension: 0.4,
      }
    ]
  };
  
  const debrisVelocityData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Velocity (km/s)',
        data: historicalData.map(data => data.velocity),
        borderColor: 'rgba(51, 195, 240, 1)',
        backgroundColor: 'rgba(51, 195, 240, 0.5)',
        tension: 0.4,
      }
    ]
  };
  
  const debrisSizeWeightData = {
    labels: timeLabels.slice(-10), // Last 10 entries
    datasets: [
      {
        label: 'Weight (kg)',
        data: historicalData.slice(-10).map(data => data.weight),
        backgroundColor: 'rgba(5, 233, 209, 0.7)',
      },
      {
        label: 'Size (m)',
        data: historicalData.slice(-10).map(data => data.size),
        backgroundColor: 'rgba(251, 191, 36, 0.7)',
      }
    ]
  };
  
  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    plugins: {
      legend: {
        labels: { color: 'rgba(255, 255, 255, 0.8)' }
      }
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 4,
      }
    }
  };
  
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    plugins: {
      legend: {
        labels: { color: 'rgba(255, 255, 255, 0.8)' }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="section-title mb-4">
        Debris Analytics Dashboard
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real-time metrics */}
        <div className="glassmorphism p-4 glow-border">
          <div className="flex items-center gap-2 mb-3">
            <Trash className="h-5 w-5 text-space-accent" />
            <h3 className="text-sm font-medium">Current Debris Metrics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="data-cell">
              <div className="flex flex-col">
                <span className="data-label">Total Objects</span>
                <span className="data-value text-lg">{currentData.count}</span>
              </div>
            </div>
            
            <div className="data-cell">
              <div className="flex flex-col">
                <span className="data-label">Nearby Objects</span>
                <span className="data-value text-lg">{currentData.nearby}</span>
              </div>
            </div>
            
            <div className="data-cell">
              <div className="flex flex-col">
                <span className="data-label">Risk Level</span>
                <span 
                  className={`data-value text-lg ${
                    currentData.risk === 'Low' ? 'text-green-500' : 
                    currentData.risk === 'Medium' ? 'text-yellow-500' : 
                    'text-red-500'
                  }`}
                >
                  {currentData.risk}
                </span>
              </div>
            </div>
            
            <div className="data-cell">
              <div className="flex flex-col">
                <span className="data-label">Last Updated</span>
                <span className="data-value text-sm">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detailed metrics */}
        <div className="glassmorphism p-4 glow-border">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-5 w-5 text-space-accent" />
            <h3 className="text-sm font-medium">Debris Properties</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="data-cell">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-space-accent" />
                  <span className="data-label">Average Velocity</span>
                </div>
                <span className="data-value">{currentData.velocity.toFixed(2)} km/s</span>
              </div>
            </div>
            
            <div className="data-cell">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-space-accent" />
                  <span className="data-label">Average Weight</span>
                </div>
                <span className="data-value">{currentData.weight.toFixed(1)} kg</span>
              </div>
            </div>
            
            <div className="data-cell">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-space-accent" />
                  <span className="data-label">Average Size</span>
                </div>
                <span className="data-value">{currentData.size.toFixed(1)} m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glassmorphism p-4 glow-border">
          <h3 className="text-sm font-medium mb-3">Debris Count History</h3>
          <div className="h-64">
            <Line data={debrisCountData} options={lineOptions} />
          </div>
        </div>
        
        <div className="glassmorphism p-4 glow-border">
          <h3 className="text-sm font-medium mb-3">Velocity Trends</h3>
          <div className="h-64">
            <Line data={debrisVelocityData} options={lineOptions} />
          </div>
        </div>
        
        <div className="glassmorphism p-4 glow-border col-span-1 lg:col-span-2">
          <h3 className="text-sm font-medium mb-3">Size & Weight Distribution</h3>
          <div className="h-64">
            <Bar data={debrisSizeWeightData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebrisDashboard;
