import { useState } from 'react';
import { UserPlus, Users, Check, Clock, Sparkles } from 'lucide-react';
import { Friend } from '../App';

interface FriendsListProps {
  friends: Friend[];
  onAddFriend: (username: string) => void;
  onAcceptFriend: (friendId: string) => void;
}

export function FriendsList({ friends, onAddFriend, onAcceptFriend }: FriendsListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFriendUsername, setNewFriendUsername] = useState('');

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFriendUsername.trim()) {
      onAddFriend(newFriendUsername.trim());
      setNewFriendUsername('');
      setShowAddModal(false);
    }
  };

  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingFriends = friends.filter(f => f.status === 'pending');

  return (
    <div className="p-4 pb-24">
      {/* Add Friend Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full mb-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 px-4 rounded-2xl hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <UserPlus className="w-5 h-5" />
        Add Friend
      </button>

      {/* Pending Requests */}
      {pendingFriends.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Requests
          </h2>
          <div className="space-y-3">
            {pendingFriends.map(friend => (
              <div
                key={friend.id}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{friend.username}</p>
                    <p className="text-xs text-gray-500">Friend request sent</p>
                  </div>
                </div>
                <button
                  onClick={() => onAcceptFriend(friend.id)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-md text-sm flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Friends ({acceptedFriends.length})
        </h2>
        
        {acceptedFriends.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="font-medium text-gray-500">No friends yet</p>
            <p className="text-sm mt-1">Add friends to create groups!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {acceptedFriends.map(friend => (
              <div
                key={friend.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{friend.username}</p>
                  <p className="text-xs text-gray-500">Friend</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Add Friend
            </h2>
            <form onSubmit={handleAddFriend}>
              <input
                type="text"
                value={newFriendUsername}
                onChange={(e) => setNewFriendUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none mb-4 transition-all"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewFriendUsername('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
