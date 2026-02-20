import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle, Loader2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoPlayerProps {
  url: string;
  onMetadata?: (data: { qualities: number; segments: number }) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onMetadata }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError(null);

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setIsLoading(false);
        if (onMetadata) {
          onMetadata({
            qualities: data.levels.length,
            segments: 0 // Will be updated as segments load or via master playlist parsing
          });
        }
      });

      hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
        if (onMetadata) {
          onMetadata({
            qualities: hls?.levels.length || 0,
            segments: data.details.fragments.length
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError(`Stream Error: ${data.details}`);
          setIsLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => setIsLoading(false));
      video.addEventListener('error', () => {
        setError("Native playback failed.");
        setIsLoading(false);
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [url, onMetadata]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full aspect-video rounded-2xl overflow-hidden glass-panel group"
    >
      <video
        ref={videoRef}
        controls
        className="w-full h-full object-contain bg-black/40"
      />

      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm z-10"
          >
            <Loader2 className="w-10 h-10 text-neon animate-spin mb-4" />
            <span className="text-xs font-mono text-neon uppercase tracking-widest">Buffering Stream</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md z-20 p-6 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Analysis Failed</h3>
            <p className="text-text-secondary text-sm max-w-xs">{error}</p>
          </motion.div>
        )}

        {!url && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 z-10">
            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
              <Maximize2 className="w-6 h-6 text-white/20" />
            </div>
            <p className="mt-4 text-text-secondary text-xs uppercase tracking-widest font-bold">Preview Standby</p>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
