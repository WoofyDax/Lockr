import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, Zap, ZapOff, Lock, ShieldAlert, FlipHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface CameraViewProps {
  onCapture: (media: { url: string; type: 'image' | 'video'; mirrored?: boolean }) => void;
  onClose: () => void;
}

export const CameraView = ({ onCapture, onClose }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isMirrorOn, setIsMirrorOn] = useState(true); // mirror preview when front camera
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isFlashTriggered, setIsFlashTriggered] = useState(false);
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const startTouchY = useRef<number | null>(null);
  const startTouchX = useRef<number | null>(null);
  const initialZoom = useRef(1);
  const pressTimer = useRef<any>(null);
  const capabilities = useRef<any>(null);
  const lastPinchDistance = useRef<number | null>(null);

  const startCamera = async () => {
    setPermissionError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        const track = stream.getVideoTracks()[0];
        // @ts-ignore
        if (track.getCapabilities) {
          // @ts-ignore
          capabilities.current = track.getCapabilities();
        }
      }
    } catch (err: any) {
      console.error("Camera failed", err);
      setPermissionError(err.name === 'NotAllowedError' ? "CAMERA_DENIED" : "CAMERA_ERROR");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isFrontCamera]);

  const updateZoom = async (newZoom: number) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track && capabilities.current?.zoom) {
      const { min, max } = capabilities.current.zoom;
      const clamped = Math.max(min, Math.min(max, newZoom));
      try {
        // @ts-ignore
        await track.applyConstraints({ advanced: [{ zoom: clamped }] });
        setZoomLevel(clamped);
      } catch (e) {
        setZoomLevel(newZoom);
      }
    } else {
      setZoomLevel(Math.max(1, Math.min(4, newZoom)));
    }
  };

  const toggleTorch = async (on: boolean) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track && !isFrontCamera) {
      try {
        // @ts-ignore
        await track.applyConstraints({ advanced: [{ torch: on }] });
      } catch (e) {
        console.warn("Torch not supported", e);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Pinch to zoom
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      
      if (lastPinchDistance.current !== null) {
        const delta = distance / lastPinchDistance.current;
        const newZoom = Math.max(1, Math.min(4, zoomLevel * delta));
        updateZoom(newZoom);
      }
      lastPinchDistance.current = distance;
      return;
    }

    // Single touch gestures during recording
    if (isRecording && !isLocked && e.touches.length === 1) {
      const touch = e.touches[0];
      
      // Swipe to lock (right swipe)
      if (startTouchX.current !== null) {
        const deltaX = touch.clientX - startTouchX.current;
        const offset = Math.max(0, Math.min(deltaX, 100));
        setSwipeOffset(offset);
        
        if (deltaX > 70) { // Slightly lowered threshold for better feel
          setIsLocked(true);
          setSwipeOffset(0);
          toast.success('Recording locked!', { duration: 1500 });
        }
      }
      
      // Zoom with vertical swipe
      if (startTouchY.current !== null) {
        const deltaY = startTouchY.current - touch.clientY;
        const zoomSensitivity = 0.005; // Slightly reduced sensitivity for smoother zoom
        const newZoom = Math.max(1, Math.min(4, initialZoom.current + deltaY * zoomSensitivity));
        updateZoom(newZoom);
      }
    }
  };

  const handleTouchEnd = () => {
    lastPinchDistance.current = null;
    if (!isLocked) {
      setSwipeOffset(0);
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current) return;
    
    if (isFlashOn) {
      setIsFlashTriggered(true);
      if (!isFrontCamera) await toggleTorch(true);
      await new Promise(r => setTimeout(r, 200));
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (isFrontCamera && isMirrorOn) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      // Draw frame
      if (!capabilities.current?.zoom && zoomLevel > 1) {
        const sw = canvas.width / zoomLevel;
        const sh = canvas.height / zoomLevel;
        const sx = (canvas.width - sw) / 2;
        const sy = (canvas.height - sh) / 2;
        ctx.drawImage(videoRef.current, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(videoRef.current, 0, 0);
      }
      
      const url = canvas.toDataURL('image/jpeg', 0.9);
      
      if (isFlashOn) {
        setIsFlashTriggered(false);
        if (!isFrontCamera) await toggleTorch(false);
      }
      
      onCapture({ url, type: 'image', mirrored: isFrontCamera && isMirrorOn });
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) return;
    
    initialZoom.current = zoomLevel;

    if (isFlashOn && !isFrontCamera) await toggleTorch(true);
    if (isFlashOn && isFrontCamera) setIsFlashTriggered(true);

    chunksRef.current = [];
    
    // Better MIME types for broad support, especially iOS
    const mimeTypes = [
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    
    const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
    
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'video/mp4' });
      const url = URL.createObjectURL(blob);
      onCapture({ url, type: 'video', mirrored: isFrontCamera && isMirrorOn });
    };

    recorder.start(200); // Capture in chunks for better reliability
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsLocked(false);
      setSwipeOffset(0);
      if (isFlashOn) {
        setIsFlashTriggered(false);
        if (!isFrontCamera) await toggleTorch(false);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Immediate feedback and coord capture
    const clientX = e.clientX;
    const clientY = e.clientY;
    startTouchX.current = clientX;
    startTouchY.current = clientY;
    
    if (isLocked) {
      stopRecording();
      return;
    }
    
    pressTimer.current = setTimeout(() => {
      startRecording();
      pressTimer.current = null;
    }, 300); // Slightly longer threshold for photo/video differentiation
  };

  const handlePointerUp = () => {
    if (isLocked) return;
    
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
      takePhoto();
    } else if (isRecording) {
      stopRecording();
    }
  };

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (permissionError) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h2 className="text-2xl font-black text-white italic mb-4">ACCESS DENIED</h2>
        <p className="text-white/60 mb-8">Please enable camera and microphone permissions in your settings.</p>
        <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-black rounded-2xl font-black">REFRESH</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden touch-none select-none"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ transform: `scale(${zoomLevel}) ${isFrontCamera && isMirrorOn ? 'scaleX(-1)' : ''}` }}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-100" 
      />

      {/* Ring Light / Flash Effect */}
      <AnimatePresence>
        {isFlashTriggered && isFrontCamera && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.95 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-white z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>
      
      {/* Zoom Level Indicator */}
      <AnimatePresence>
        {isRecording && zoomLevel > 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full z-50"
          >
            <span className="text-white text-sm font-black">{zoomLevel.toFixed(1)}x</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative flex-1 flex flex-col justify-between p-6 z-50">
        <div className="flex justify-between items-start">
          <button onClick={onClose} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white"><X size={24} /></button>
          <div className="flex flex-col gap-4">
            <button onClick={() => setIsFlashOn(!isFlashOn)} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white">
              {isFlashOn ? <Zap size={24} className="text-yellow-400 fill-yellow-400" /> : <ZapOff size={24} />}
            </button>
            <button onClick={() => setIsMirrorOn(!isMirrorOn)} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white" title="Mirror">
              <FlipHorizontal size={24} className={isMirrorOn ? 'text-white' : 'text-white/60'} />
            </button>
            <button onClick={() => setIsFrontCamera(!isFrontCamera)} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white"><RotateCcw size={24} /></button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 pb-12">
          {isRecording && (
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-black flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-white rounded-full" />
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </motion.div>
              {isLocked && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white text-gray-950 p-2 rounded-full"
                >
                  <Lock size={20} />
                </motion.div>
              )}
            </div>
          )}
          
          <div className="relative flex items-center justify-center w-full max-w-[300px]">
            {/* Swipe to Lock Indicator */}
            <AnimatePresence>
              {isRecording && !isLocked && (
                <motion.div 
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: 40 + (swipeOffset * 0.5) }}
                  exit={{ opacity: 0, x: 0 }}
                  className="absolute left-1/2 flex items-center gap-2 pointer-events-none"
                >
                   <div className="h-0.5 w-12 bg-linear-to-r from-white/0 to-white/60" />
                   <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                    <Lock size={20} className="text-white" />
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={isLocked ? undefined : handlePointerUp}
              className="relative w-24 h-24 flex items-center justify-center select-none touch-none z-10"
              animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: isRecording ? Infinity : 0, duration: 1 }}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Outer ring */}
              <div className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
                isRecording ? 'border-red-500 scale-125' : 'border-white scale-100'
              }`} />
              
              {/* Inner button */}
              <motion.div 
                className={`w-20 h-20 rounded-full transition-all duration-300 ${
                  isRecording ? 'bg-red-500 scale-50' : 'bg-white scale-100'
                }`}
                animate={isRecording ? { 
                  borderRadius: ['50%', '20%', '50%'],
                } : {}}
                transition={{ repeat: isRecording ? Infinity : 0, duration: 1.5 }}
              />
              
              {/* Lock hint text */}
              {isRecording && !isLocked && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -bottom-12 whitespace-nowrap text-white text-[10px] font-black uppercase tracking-widest"
                >
                  Swipe right to lock →
                </motion.div>
              )}
            </motion.button>
          </div>

          {!isRecording && (
            <p className="text-white font-black uppercase tracking-widest text-[10px] bg-black/20 backdrop-blur-sm px-4 py-1 rounded-full">
              Tap to photo • Hold to video
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};