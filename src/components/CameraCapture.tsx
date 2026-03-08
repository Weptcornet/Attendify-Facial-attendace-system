import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Scan, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as faceapi from 'face-api.js';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  autoMode?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, autoMode = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionScore, setDetectionScore] = useState(0);
  const [autoCaptureCountdown, setAutoCaptureCountdown] = useState<number | null>(null);

  const loadModels = async () => {
    try {
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    } catch (err) {
      console.error("Error loading face-api models:", err);
      setError("Failed to load face detection models. Manual mode enabled.");
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure permissions are granted.");
    }
  };

  useEffect(() => {
    loadModels();
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
        setIsCapturing(true);
        setTimeout(() => setIsCapturing(false), 500);
      }
    }
  }, [onCapture]);

  // Face detection loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (modelsLoaded && videoRef.current && !isCapturing) {
      interval = setInterval(async () => {
        const video = videoRef.current;
        if (video && video.readyState === 4) {
          try {
            const detections = await faceapi.detectAllFaces(
              video, 
              new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 })
            );

            if (detections.length > 0 && videoRef.current === video) {
              const detection = detections[0];
              setFaceDetected(true);
              setDetectionScore(detection.score);

              // Check if face is relatively centered and large enough
              const box = detection.box;
              const videoWidth = video.videoWidth;
              const videoHeight = video.videoHeight;
              
              const isCentered = 
                box.x > videoWidth * 0.1 && 
                box.x + box.width < videoWidth * 0.9 &&
                box.y > videoHeight * 0.1 &&
                box.y + box.height < videoHeight * 0.9;

              if (isCentered && autoMode && autoCaptureCountdown === null) {
                setAutoCaptureCountdown(3);
              }
            } else if (videoRef.current === video) {
              setFaceDetected(false);
              setDetectionScore(0);
              setAutoCaptureCountdown(null);
            }
          } catch (err) {
            // Ignore errors during detection (e.g. if video is paused/stopped)
            console.debug("Face detection error:", err);
          }
        }
      }, 200);
    }

    return () => clearInterval(interval);
  }, [modelsLoaded, isCapturing, autoMode, autoCaptureCountdown]);

  // Countdown effect
  useEffect(() => {
    if (autoCaptureCountdown !== null && autoCaptureCountdown > 0) {
      const timer = setTimeout(() => {
        setAutoCaptureCountdown(autoCaptureCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoCaptureCountdown === 0) {
      captureImage();
      setAutoCaptureCountdown(null);
    }
  }, [autoCaptureCountdown, captureImage]);

  return (
    <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-200">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-zinc-900">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-sm font-medium">{error}</p>
          <button 
            onClick={startCamera}
            className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          
          {/* Scanning Overlay */}
          <AnimatePresence>
            {faceDetected && !autoCaptureCountdown && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-emerald-400/50 rounded-full animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Frame Overlay */}
          <div className={`camera-frame transition-colors duration-300 ${faceDetected ? 'border-emerald-400' : 'border-white/30'}`}>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
                {faceDetected ? (
                  <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                ) : (
                  <Scan className="w-3 h-3 text-white" />
                )}
                <span className="text-[10px] uppercase tracking-widest text-white font-bold">
                  {faceDetected ? 'Face Detected' : 'Scanning for Face'}
                </span>
              </div>
              
              {autoCaptureCountdown !== null && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-black shadow-lg border-2 border-white"
                >
                  {autoCaptureCountdown}
                </motion.div>
              )}
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={captureImage}
              className={`w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 transition-colors ${faceDetected ? 'border-emerald-500' : 'border-zinc-200'} group`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${faceDetected ? 'bg-emerald-500' : 'bg-zinc-400'} group-hover:bg-emerald-600`}>
                <Camera className="w-6 h-6 text-white" />
              </div>
            </motion.button>
          </div>

          {/* Status Indicators */}
          <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
            <div className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-tighter flex items-center gap-1 ${modelsLoaded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${modelsLoaded ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'}`} />
              AI Engine {modelsLoaded ? 'Active' : 'Loading'}
            </div>
          </div>

          <AnimatePresence>
            {isCapturing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white pointer-events-none"
              />
            )}
          </AnimatePresence>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
