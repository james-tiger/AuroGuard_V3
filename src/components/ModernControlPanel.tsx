
import { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface ModernControlPanelProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

const ModernControlPanel = ({ 
  title, 
  icon, 
  children, 
  defaultExpanded = true,
  className = '' 
}: ModernControlPanelProps) => {
  return (
    <div className={`glass-panel ${className} animate-slide-in-right`}>
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        {icon && (
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            {icon}
          </div>
        )}
        <h2 className="font-semibold text-white flex-1">{title}</h2>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>
      
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
};

export default ModernControlPanel;
