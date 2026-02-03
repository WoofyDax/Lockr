import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, Lock, LockOpen, Users, Clock, Image } from 'lucide-react';
import { Group, User } from '../App';
import { CameraView } from './CameraView';
import { PhotoPreview } from './PhotoPreview';

interface GroupChatProps {
  group: Group;
  currentUser: User;
  onBack: () => void;
  onAddPhoto: (groupId: string, photoUrl: string) => void;
  allGroups: Group[]; // Need this for PhotoPreview
}

export function GroupChat({ group, currentUser, onBack, onAddPhoto, allGroups }: GroupChatProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  const isUnlocked = currentTime >= group.unlockTime;

  // Update time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeRemaining = () => {
    const remaining = group.unlockTime - currentTime;
    
    if (remaining <= 0) return null;
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onAddPhoto(group.id, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (media: { url: string; type: 'image' | 'video' }) => {
    setCapturedMedia(media);
    setShowCamera(false);
  };

  const handlePhotoSent = () => {
    setCapturedMedia(null);
    // Optionally trigger a refresh or show success
  };

  const timeRemaining = formatTimeRemaining();

  // Show camera view
  if (showCamera) {
    return <CameraView onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />;
  }

  // Show photo preview with pre-selected group
  if (capturedMedia) {
    return (
      <PhotoPreview
        media={capturedMedia}
        onSend={handlePhotoSent}
        onRetake={() => setCapturedMedia(null)}
        groups={allGroups}
        preSelectedGroupId={group.id}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-fuchsia-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {group.name}
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {group.members.join(', ')}
              </p>
            </div>
          </div>
          
          {/* Status Banner */}
          {isUnlocked ? (
            <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <LockOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Photos Unlocked! 🎉</p>
                <p className="text-xs text-white/90">You can now view all photos</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Photos Locked 🔒</p>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Unlocks in {timeRemaining}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {group.photos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-violet-200 to-fuchsia-200 rounded-full flex items-center justify-center">
              <Image className="w-10 h-10 text-violet-500" />
            </div>
            <p className="font-semibold text-gray-500">No photos yet</p>
            <p className="text-sm mt-1">Be the first to add a photo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-24">
            {group.photos.map(photo => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                  {isUnlocked ? (
                    <img
                      src={photo.url}
                      alt={`Photo by ${photo.username}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500">
                      <Lock className="w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 rounded-b-2xl">
                  <p className="text-white text-sm font-semibold truncate drop-shadow-md">
                    {isUnlocked ? photo.username : '???'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Photo Button */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setShowCamera(true)}
            className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 px-4 rounded-2xl hover:from-violet-700 hover:to-fuchsia-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/80 border border-gray-300 text-gray-700 py-4 px-4 rounded-2xl hover:bg-white transition-all flex items-center justify-center shadow-md"
          >
            <Image className="w-5 h-5" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}