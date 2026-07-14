import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize camera stream
  useEffect(() => {
    async function startCamera() {
      try {
        setError(null);
        setLoading(true);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Default to back camera on mobile
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please verify camera permissions.');
      } finally {
        setLoading(false);
      }
    }

    startCamera();

    // Cleanup: Stop all tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match the current video stream frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame onto the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas image to base64 jpeg
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(base64);
      }
    }
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // Reattach current stream to video
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1b1c19]/90 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="bg-[#ffffff] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-[#e3e3de] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e3e3de] flex justify-between items-center bg-[#faf9f4]">
          <h3 className="font-headline font-bold text-[#173124] text-lg flex items-center gap-1.5">
            <span className="material-symbols-outlined">photo_camera</span>
            Capture Plant Portrait
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#e3e3de] text-[#424844] cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined block">close</span>
          </button>
        </div>

        {/* Camera Stream Area */}
        <div className="relative bg-stone-950 aspect-[4/3] w-full flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#ffffff]">
              <span className="animate-spin material-symbols-outlined text-3xl text-brand-emerald">cached</span>
              <span className="font-sans text-xs text-stone-400 mt-2">Starting Camera...</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center text-[#ffffff]">
              <span className="material-symbols-outlined text-4xl text-[#ba1a1a] mb-2">videocam_off</span>
              <p className="font-sans text-sm font-semibold">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-[#173124] text-[#ffffff] font-sans text-xs font-semibold rounded-full cursor-pointer hover:bg-[#173124]/90"
              >
                Close Camera
              </button>
            </div>
          )}

          {/* Video element for live stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${capturedImage || error || loading ? 'hidden' : 'block'}`}
          />

          {/* Canvas for holding captured photo preview */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Preview of captured image */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured sprout portrait"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#e3e3de] bg-[#faf9f4] flex justify-between items-center">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="px-5 py-2 bg-transparent text-[#173124] border border-[#173124] hover:bg-[#dee3b9]/20 font-sans text-xs font-bold rounded-full cursor-pointer transition-colors"
              >
                Retake
              </button>
              <button
                onClick={handleUsePhoto}
                className="px-6 py-2 bg-[#173124] text-[#ffffff] hover:bg-[#173124]/90 font-sans text-xs font-bold rounded-full cursor-pointer transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-transparent text-[#5c6140] hover:bg-[#e3e3de]/50 font-sans text-xs font-semibold rounded-full cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!!error || loading}
                onClick={handleCapture}
                className="px-6 py-2.5 bg-[#173124] text-[#ffffff] disabled:opacity-40 font-sans text-xs font-bold rounded-full cursor-pointer hover:bg-[#173124]/90 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                Capture Sprout
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
