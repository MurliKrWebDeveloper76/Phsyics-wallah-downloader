import React from 'react';
import { motion } from 'motion/react';
import { Film, List, Database, CloudDownload, Download } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel p-6 rounded-xl group hover:neon-border transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-lg bg-neon/10 text-neon group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-3xl font-black tracking-tighter text-white">
        {value}
      </div>
      <div className="text-xs font-bold text-text-secondary uppercase tracking-widest">
        {label}
      </div>
    </div>
  </motion.div>
);

interface MetricsGridProps {
  metrics: {
    qualities: number;
    segments: number;
    estSize: string;
    processed: string;
  };
  onExport: () => void;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, onExport }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <Database className="w-3 h-3 text-neon" />
          Stream Metrics
        </h3>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 text-[10px] font-bold text-neon hover:text-white transition-colors uppercase tracking-widest"
        >
          <Download className="w-3 h-3" />
          Export Report
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={<Film className="w-5 h-5" />} 
          label="Qualities" 
          value={metrics.qualities} 
          delay={0.1} 
        />
        <MetricCard 
          icon={<List className="w-5 h-5" />} 
          label="Segments" 
          value={metrics.segments} 
          delay={0.2} 
        />
        <MetricCard 
          icon={<Database className="w-5 h-5" />} 
          label="Est. Size" 
          value={metrics.estSize} 
          delay={0.3} 
        />
        <MetricCard 
          icon={<CloudDownload className="w-5 h-5" />} 
          label="Processed" 
          value={metrics.processed} 
          delay={0.4} 
        />
      </div>
    </div>
  );
};
