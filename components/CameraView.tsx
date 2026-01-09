
import React, { useRef, useEffect, useCallback } from 'react';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  isProcessing: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];
      onCapture(base64);
    }
  }, [onCapture, isProcessing]);

  // Periodic capture if needed, but for this app we'll trigger manually or on mode change
  
  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      <button 
        onClick={captureFrame}
        disabled={isProcessing}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 ${isProcessing ? 'border-gray-500 bg-gray-600' : 'border-blue-500 bg-blue-500/20'} flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-blue-500/50`}
      >
        <div className={`w-10 h-10 rounded-full ${isProcessing ? 'bg-gray-400 animate-pulse' : 'bg-white'}`} />
      </button>

      {/* Grid Overlay for Engineering Feel */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 grid grid-cols-6 grid-rows-6">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="border-[1px] border-white/5" />
        ))}
      </div>
    </div>
  );
};

export default CameraView;
