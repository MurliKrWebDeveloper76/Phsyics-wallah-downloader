/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Link2, 
  ChevronLeft, 
  User, 
  Activity, 
  Play, 
  Github, 
  Twitter, 
  Info,
  CheckCircle2,
  AlertTriangle,
  CloudDownload
} from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { Terminal } from './components/Terminal';
import { MetricsGrid } from './components/MetricsGrid';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function App() {
  const [urlInput, setUrlInput] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState({
    qualities: 0,
    segments: 0,
    estSize: '0 MB',
    processed: '0 MB'
  });

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  };

  const handleAnalyze = async () => {
    if (!urlInput.trim()) return;
    
    setIsAnalyzing(true);
    setLogs([]);
    addLog('Initializing StreamScope Analyzer...', 'info');
    
    setTimeout(() => addLog(`Target: ${urlInput.substring(0, 40)}...`, 'info'), 400);
    setTimeout(() => addLog('Fetching master playlist...', 'info'), 800);
    
    // Simulate analysis steps
    setTimeout(() => {
      addLog('Parsing variant streams...', 'info');
      addLog('Detected adaptive bitrate levels', 'success');
    }, 1500);

    setTimeout(() => {
      setActiveUrl(urlInput.trim());
      addLog('Analysis complete. Ready for playback.', 'success');
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleMetadata = (data: { qualities: number; segments: number }) => {
    setMetrics(prev => ({
      ...prev,
      qualities: data.qualities,
      segments: data.segments,
      estSize: `${(data.segments * 2.4).toFixed(1)} MB`,
      processed: data.segments > 0 ? `${(data.segments * 0.8).toFixed(1)} MB` : '0 MB'
    }));
    
    if (data.qualities > 0) {
      addLog(`Detected ${data.qualities} quality levels`, 'success');
    }
    if (data.segments > 0) {
      addLog(`Counting media segments: ${data.segments} found`, 'info');
    }
  };

  const handleExport = () => {
    const reportData = {
      streamUrl: activeUrl,
      analysisTimestamp: new Date().toISOString(),
      metrics,
      logs: logs.map(l => ({ time: l.timestamp, msg: l.message, type: l.type }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stream-analysis-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addLog('Analysis report exported successfully', 'success');
  };

  const handleDownloadLecture = async () => {
    if (!activeUrl) return;
    
    setIsDownloading(true);
    addLog('Requesting backend download process...', 'info');
    
    try {
      const response = await fetch('/api/analyze-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: activeUrl })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addLog(`Backend Status: ${data.status}`, 'success');
        addLog(data.message, 'info');
        
        // Simulate a file download trigger
        setTimeout(() => {
          addLog('Lecture segments processed. Generating download link...', 'info');
          setTimeout(() => {
            addLog('Download ready: lecture_export.mp4 (Simulated)', 'success');
            setIsDownloading(false);
          }, 1500);
        }, 1000);
      } else {
        addLog(`Backend Error: ${data.error}`, 'error');
        setIsDownloading(false);
      }
    } catch (error) {
      addLog('Failed to connect to backend downloader.', 'error');
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh selection:bg-neon/30 pb-20">
      {/* Top Navigation */}
      <header className="sticky top-0 w-full z-50 bg-background/60 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="font-black text-xl tracking-tighter flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon" />
              Stream<span className="text-neon">Scope</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-neon/10 text-[10px] text-neon uppercase tracking-widest font-bold">Analyzer</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 text-[10px] font-bold text-text-secondary uppercase tracking-widest mr-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1" />
              System Online
            </div>
            <div className="w-9 h-9 rounded-full glass-panel flex items-center justify-center border-neon/20">
              <User className="w-5 h-5 text-neon" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & Metrics */}
          <div className="lg:col-span-7 space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-8 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Link2 className="w-32 h-32" />
              </div>
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight mb-1">Video Analyzer</h2>
                  <p className="text-sm text-text-secondary">Input HLS manifest for deep analysis</p>
                </div>
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-neon text-xs font-mono">
                    <Activity className="w-4 h-4 animate-spin" />
                    ANALYZING...
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Enter HLS .m3u8 link"
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon/50 transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {activeUrl && !isAnalyzing && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </div>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full btn-gradient py-4 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <Activity className="w-5 h-5 animate-spin" />
                  ) : (
                    <Link2 className="w-5 h-5" />
                  )}
                  FETCH PLAYLIST
                </button>
                
                <AnimatePresence>
                  {activeUrl && (
                    <motion.button
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={handleDownloadLecture}
                      disabled={isDownloading}
                      className="w-full bg-white/5 border border-white/10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <Activity className="w-5 h-5 animate-spin text-neon" />
                      ) : (
                        <CloudDownload className="w-5 h-5 text-neon" />
                      )}
                      DOWNLOAD LECTURE (MP4)
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Bar */}
              <div className="mt-8 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  <span>Status: {isAnalyzing ? 'Analyzing' : activeUrl ? 'Ready' : 'Standby'}</span>
                  <span>{isAnalyzing ? '65%' : activeUrl ? '100%' : '0%'}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: isAnalyzing ? '65%' : activeUrl ? '100%' : '0%' }}
                    className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                  />
                </div>
              </div>
            </motion.section>

            <MetricsGrid metrics={metrics} onExport={handleExport} />

            <Terminal logs={logs} />
          </div>

          {/* Right Column: Preview & Info */}
          <div className="lg:col-span-5 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <Play className="w-3 h-3 text-neon" />
                  Playback Preview
                </h3>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                </div>
              </div>
              <VideoPlayer url={activeUrl} onMetadata={handleMetadata} />
            </section>

            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-panel p-6 rounded-2xl border-neon/10"
            >
              <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-neon" />
                Analyzer Insights
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Adaptive Bitrate</p>
                    <p className="text-[10px] text-text-secondary">Master playlist detected with multiple variant streams.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">CORS Policy</p>
                    <p className="text-[10px] text-text-secondary">Ensure the source server allows cross-origin requests.</p>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full btn-gradient flex items-center justify-center shadow-2xl z-50"
      >
        <Play className="w-6 h-6 fill-background" />
      </motion.button>

      <footer className="mt-20 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-neon" />
            <span className="font-black tracking-tighter text-white">StreamScope</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-text-secondary hover:text-neon transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="text-text-secondary hover:text-neon transition-colors"><Twitter className="w-5 h-5" /></a>
          </div>
          <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest">
            © 2026 StreamScope Analyzer • v1.0.4
          </p>
        </div>
      </footer>
    </div>
  );
}
