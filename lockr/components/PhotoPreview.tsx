import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Type, Loader2, Download, Check } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { fetchWithAuth } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

interface PhotoPreviewProps {
  media: { url: string; type: 'image' | 'video'; mirrored?: boolean };
  onSend: (photoData: any) => void;
  onRetake: () => void;
  groups: Array<{ id: string; name: string; members: string[] }>;
  preSelectedGroupId?: string; // Optional - if provided, this group will be pre-selected
}

export const PhotoPreview = ({ media, onSend, onRetake, groups, preSelectedGroupId }: PhotoPreviewProps) => {
  const [caption, setCaption] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [isAddingText, setIsAddingText] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(preSelectedGroupId ? [preSelectedGroupId] : []);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Text adjustment states
  const [textScale, setTextScale] = useState(1);
  const [textRotation, setTextRotation] = useState(0);
  const textX = useMotionValue(0);
  const textY = useMotionValue(0);
  
  const textInputRef = useRef<HTMLInputElement>(null);
  const lastDistance = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && media.type === 'video') {
      videoRef.current.play().catch(e => console.warn("Video auto-play failed", e));
    }
  }, [media]);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && overlayText) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      
      if (lastDistance.current !== null) {
        const delta = distance / lastDistance.current;
        setTextScale(prev => Math.min(Math.max(0.5, prev * delta), 4));
      }
      lastDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastDistance.current = null;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = `lockr_${Date.now()}.${media.type === 'image' ? 'jpg' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Saved to device!');
  };

  const handleSend = async () => {
    if (selectedGroups.length === 0) return;
    setIsSending(true);
    const toastId = toast.loading('Sealing the capsule...');

    try {
      let finalMediaUrl = media.url;
      
      if (media.url.startsWith('blob:') || media.url.startsWith('data:')) {
        const res = await fetch(media.url);
        const blob = await res.blob();

        const fileName = `media_${Date.now()}.${media.type === 'image' ? 'jpg' : 'mp4'}`;
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('path', `capsules/${fileName}`);

        const uploadRes = await fetchWithAuth('/upload', {
          method: 'POST',
          body: formData
        });
        finalMediaUrl = uploadRes.url;
      }

      for (const groupId of selectedGroups) {
        await fetchWithAuth(`/groups/${groupId}/photos`, {
          method: 'POST',
          body: JSON.stringify({
            url: finalMediaUrl,
            type: media.type,
            caption: overlayText || caption || 'Shared a moment',
            mirrored: media.mirrored
          })
        });
      }

      toast.success('Successfully locked in!', { id: toastId });
      onSend({ success: true });
    } catch (e: any) {
      toast.error('Failed to send: ' + e.message, { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black overflow-hidden touch-none"
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0">
        {media.type === 'image' ? (
          <img 
            src={media.url} 
            className="w-full h-full object-cover" 
            alt="Preview" 
          />
        ) : (
          <video 
            ref={videoRef}
            src={media.url} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Interactive Text Overlay */}
        {overlayText && !isAddingText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              drag
              dragConstraints={{ left: -200, right: 200, top: -400, bottom: 400 }}
              style={{ x: textX, y: textY, scale: textScale, rotate: textRotation }}
              className="pointer-events-auto cursor-move p-10"
              onTap={() => setIsAddingText(true)}
            >
              <span className="text-white font-black text-4xl text-center italic tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,1)] uppercase select-none">
                {overlayText}
              </span>
            </motion.div>
          </div>
        )}
      </div>

      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <motion.button onClick={onRetake} className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white" whileTap={{ scale: 0.9 }} disabled={isSending}>
          <X size={28} />
        </motion.button>
        
        {/* Page Title Top Middle */}
        <div className="absolute left-1/2 -translate-x-1/2 top-7">
          <h2 className="text-white font-black italic tracking-tighter uppercase text-sm drop-shadow-lg">PREVIEW</h2>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAddingText(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isAddingText ? 'bg-white text-gray-950 shadow-xl' : 'bg-black/40 backdrop-blur-md text-white'}`}
          >
            <Type size={20} />
          </button>
          <button onClick={handleDownload} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center">
            <Download size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAddingText && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6"
          >
            <input
              ref={textInputRef}
              autoFocus
              type="text"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              onBlur={() => setIsAddingText(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsAddingText(false)}
              className="w-full bg-transparent border-none text-white text-4xl font-black text-center italic tracking-tighter uppercase focus:ring-0 placeholder:text-white/20"
              placeholder="TYPE SOMETHING..."
            />
            <button 
              onClick={() => setIsAddingText(false)}
              className="mt-8 px-8 py-3 bg-white text-gray-950 rounded-full font-black uppercase italic tracking-tighter shadow-2xl"
            >
              DONE
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caption moved to top under title */}
      {!showGroupSelector && !isAddingText && (
        <div className="absolute top-20 left-0 right-0 px-6 z-10">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full bg-black/30 backdrop-blur-md border-none rounded-2xl px-4 py-2 text-white text-sm text-center placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 font-bold italic"
          />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 pb-12 px-6">
        {!showGroupSelector && !preSelectedGroupId ? (
          <motion.button
            onClick={() => setShowGroupSelector(true)}
            className="w-full h-16 bg-white text-gray-950 rounded-full flex items-center justify-center font-black text-xl shadow-2xl uppercase italic tracking-tighter"
            whileTap={{ scale: 0.98 }}
          >
            SEND TO
          </motion.button>
        ) : preSelectedGroupId && !showGroupSelector ? (
          <div className="space-y-4">
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-4 border border-white/10">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 text-center">SENDING TO</p>
              <p className="text-white font-black italic text-center">{groups.find(g => g.id === preSelectedGroupId)?.name}</p>
            </div>
            <motion.button
              onClick={handleSend}
              disabled={isSending}
              className="w-full h-16 bg-white text-gray-950 rounded-full flex items-center justify-center font-black text-xl shadow-2xl uppercase italic tracking-tighter disabled:opacity-50"
              whileTap={{ scale: 0.98 }}
            >
              {isSending ? <Loader2 className="animate-spin" /> : <><Send size={24} /> SEND</>}
            </motion.button>
          </div>
        ) : (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">SELECT CAPSULES</p>
              {groups.map((group) => {
                const isSelected = selectedGroups.includes(group.id);
                return (
                  <motion.button
                    key={group.id}
                    onClick={() => {
                      setSelectedGroups(prev => isSelected ? prev.filter(id => id !== group.id) : [...prev, group.id]);
                    }}
                    className={`w-full p-4 rounded-3xl backdrop-blur-md flex items-center gap-4 transition-all ${
                      isSelected ? 'bg-white text-gray-950 scale-[1.02]' : 'bg-white/10 text-white'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${isSelected ? 'bg-gray-950 text-white' : 'bg-white/5 text-white/40'}`}>
                      {group.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-black italic tracking-tight">{group.name}</p>
                      <p className={`text-[10px] font-bold uppercase ${isSelected ? 'text-gray-950/40' : 'text-white/40'}`}>
                        {group.members?.length || 0} MEMBERS
                      </p>
                    </div>
                    {isSelected && <div className="w-6 h-6 rounded-full bg-gray-950 flex items-center justify-center text-white text-xs font-black"><Check size={16} /></div>}
                  </motion.button>
                );
              })}
            </div>
            
            <motion.button
              onClick={handleSend}
              disabled={isSending || selectedGroups.length === 0}
              className="w-full h-16 bg-white text-gray-950 rounded-full flex items-center justify-center font-black text-xl shadow-2xl uppercase italic tracking-tighter disabled:opacity-50"
              whileTap={{ scale: 0.98 }}
            >
              {isSending ? <Loader2 className="animate-spin" /> : <><Send size={24} /> SEND ({selectedGroups.length})</>}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};