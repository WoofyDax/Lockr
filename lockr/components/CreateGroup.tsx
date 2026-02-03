import { useState } from 'react';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import { Friend } from '../App';

interface CreateGroupProps {
  friends: Friend[];
  onCreateGroup: (name: string, memberUsernames: string[], unlockHours: number) => void;
  onCancel: () => void;
}

export function CreateGroup({ friends, onCreateGroup, onCancel }: CreateGroupProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [unlockHours, setUnlockHours] = useState(24);
  const [customHours, setCustomHours] = useState('');

  const toggleFriend = (username: string) => {
    setSelectedFriends(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && selectedFriends.length > 0) {
      onCreateGroup(groupName.trim(), selectedFriends, unlockHours);
    }
  };

  const handleUnlockTimeChange = (hours: number) => {
    setUnlockHours(hours);
    if (hours !== parseInt(customHours)) {
      setCustomHours('');
    }
  };

  const handleCustomHoursChange = (value: string) => {
    setCustomHours(value);
    const hours = parseInt(value);
    if (!isNaN(hours) && hours > 0) {
      setUnlockHours(hours);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-fuchsia-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Create Group
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Group Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Group Name
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g., Weekend Trip, Birthday Party"
            className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all shadow-sm"
            required
          />
        </div>

        {/* Unlock Time */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-600" />
            Unlock After
          </label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              type="button"
              onClick={() => handleUnlockTimeChange(1)}
              className={`py-4 px-4 rounded-2xl border-2 transition-all shadow-sm font-semibold ${
                unlockHours === 1
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-lg'
                  : 'bg-white border-gray-200 hover:border-violet-400 text-gray-700'
              }`}
            >
              1 hour
            </button>
            <button
              type="button"
              onClick={() => handleUnlockTimeChange(12)}
              className={`py-4 px-4 rounded-2xl border-2 transition-all shadow-sm font-semibold ${
                unlockHours === 12
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-lg'
                  : 'bg-white border-gray-200 hover:border-violet-400 text-gray-700'
              }`}
            >
              12 hours
            </button>
            <button
              type="button"
              onClick={() => handleUnlockTimeChange(24)}
              className={`py-4 px-4 rounded-2xl border-2 transition-all shadow-sm font-semibold ${
                unlockHours === 24
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-lg'
                  : 'bg-white border-gray-200 hover:border-violet-400 text-gray-700'
              }`}
            >
              1 day
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customHours}
              onChange={(e) => handleCustomHoursChange(e.target.value)}
              placeholder="Custom hours"
              min="1"
              className="flex-1 px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all shadow-sm"
            />
            <span className="text-gray-600 font-medium">hours</span>
          </div>
        </div>

        {/* Select Friends */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            Invite Friends ({selectedFriends.length})
          </label>
          
          {friends.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400 shadow-sm">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No friends added yet</p>
              <p className="text-xs mt-1">Add friends first to invite them</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {friends.map(friend => (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => toggleFriend(friend.username)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 shadow-sm ${
                    selectedFriends.includes(friend.username)
                      ? 'bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-violet-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedFriends.includes(friend.username)
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-transparent'
                      : 'border-gray-300'
                  }`}>
                    {selectedFriends.includes(friend.username) && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="font-semibold">{friend.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!groupName.trim() || selectedFriends.length === 0}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 px-4 rounded-2xl hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
        >
          Create Group
        </button>
      </form>
    </div>
  );
}
