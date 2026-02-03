import { Plus, Users, Lock, LockOpen, Clock, Sparkles } from 'lucide-react';
import { Group } from '../App';
import { useEffect, useState } from 'react';

interface GroupsListProps {
  groups: Group[];
  onOpenGroup: (group: Group) => void;
  onCreateGroup: () => void;
}

export function GroupsList({ groups, onOpenGroup, onCreateGroup }: GroupsListProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeRemaining = (unlockTime: number) => {
    const remaining = unlockTime - currentTime;
    
    if (remaining <= 0) return 'Unlocked!';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="p-4 pb-24">
      {/* Create Group Button */}
      <button
        onClick={onCreateGroup}
        className="w-full mb-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 px-4 rounded-2xl hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create Group
      </button>

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="font-medium text-gray-500">No groups yet</p>
          <p className="text-sm mt-1">Create a group to start sharing!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(group => {
            const isUnlocked = currentTime >= group.unlockTime;
            const timeRemaining = formatTimeRemaining(group.unlockTime);
            
            return (
              <div
                key={group.id}
                onClick={() => onOpenGroup(group)}
                className="bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02] shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {group.members.length} members
                    </p>
                  </div>
                  
                  {isUnlocked ? (
                    <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                      <LockOpen className="w-3 h-3" />
                      Unlocked
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                      <Lock className="w-3 h-3" />
                      Locked
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 font-medium">
                    📸 {group.photos.length} {group.photos.length === 1 ? 'photo' : 'photos'}
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <Clock className="w-4 h-4" />
                    <span className={isUnlocked ? 'text-green-600' : 'text-amber-600'}>
                      {timeRemaining}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
