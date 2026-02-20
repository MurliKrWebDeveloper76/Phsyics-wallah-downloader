import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface TerminalProps {
  logs: LogEntry[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="terminal-bg rounded-xl overflow-hidden shadow-2xl"
    >
      <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest ml-2">
            HLS Analyzer Terminal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-green-500/80 uppercase">Live</span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="p-4 h-64 overflow-y-auto font-mono text-xs leading-relaxed scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-1.5 flex gap-3"
            >
              <span className="text-white/20 shrink-0">[{log.timestamp}]</span>
              <span className={`
                ${log.type === 'success' ? 'text-green-400' : ''}
                ${log.type === 'warning' ? 'text-yellow-400' : ''}
                ${log.type === 'error' ? 'text-red-400' : ''}
                ${log.type === 'info' ? 'text-neon' : ''}
              `}>
                $ {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex items-center gap-1">
          <span className="text-neon">$</span>
          <div className="w-2 h-4 bg-neon/50 animate-blink" />
        </div>
      </div>
    </motion.div>
  );
};
