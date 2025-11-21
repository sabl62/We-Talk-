import { useEffect, useMemo } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { UserPlus, Check } from "lucide-react";

const FriendsPanel = ({ onClose }) => {
  const {
    friends,
    requests,
    getFriends,
    getRequests,
    sendRequest,
    acceptRequest,
    isLoading,
  } = useFriendStore();

  const { authUser } = useAuthStore();
  const userId = authUser["_id"];

  useEffect(() => {
    getFriends();
    getRequests();
  }, [getFriends, getRequests]);

  // Deduplicate friends based on _id
  const uniqueFriends = useMemo(() => {
    const safeFriends = friends || [];
    const seen = new Set();
    return safeFriends.filter((friend) => {
      if (seen.has(friend._id)) {
        return false;
      }
      seen.add(friend._id);
      return true;
    });
  }, [friends]);

  // Deduplicate requests based on _id
  const uniqueRequests = useMemo(() => {
    const safeRequests = requests || [];
    const seen = new Set();
    return safeRequests.filter((request) => {
      if (seen.has(request._id)) {
        return false;
      }
      seen.add(request._id);
      return true;
    });
  }, [requests]);

  if (isLoading)
    return (
      <div className="p-5 text-center text-zinc-500">Loading friends...</div>
    );

  return (
    <div className="p-6 overflow-y-auto h-full flex flex-col gap-6">
      {/* My ID Section */}
      <section>
        <h2 className="font-semibold text-lg mb-2">My ID</h2>
        <div className="bg-base-300 rounded-lg p-3 break-all text-sm">
          {userId}
        </div>
      </section>

      {/* Friend Requests Section */}
      <section>
        <h2 className="font-semibold text-lg mb-3 flex items-center justify-between">
          Friend Requests
          {uniqueRequests.length > 0 && (
            <span className="badge badge-primary badge-sm">
              {uniqueRequests.length}
            </span>
          )}
        </h2>
        {uniqueRequests.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-4">
            No pending requests
          </p>
        ) : (
          <div className="space-y-2">
            {uniqueRequests.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between bg-base-300 rounded-lg p-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <span className="truncate font-medium">{user.fullName}</span>
                </div>
                <button
                  onClick={() => acceptRequest(user._id)}
                  className="btn btn-sm btn-success flex items-center gap-1 flex-shrink-0"
                >
                  <Check className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Your Friends Section */}
      <section>
        <h2 className="font-semibold text-lg mb-3 flex items-center justify-between">
          Your Friends
          {uniqueFriends.length > 0 && (
            <span className="badge badge-secondary badge-sm">
              {uniqueFriends.length}
            </span>
          )}
        </h2>
        {uniqueFriends.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-4">
            No friends yet. Add some!
          </p>
        ) : (
          <div className="space-y-2">
            {uniqueFriends.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 bg-base-300 rounded-lg p-3 hover:bg-base-content/10 transition-colors"
              >
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <span className="truncate font-medium">{user.fullName}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Friend Section */}
      <section className="mt-auto pt-4 border-t border-base-300">
        <h2 className="font-semibold text-lg mb-3">Add a Friend</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            id="friendId"
            placeholder="Enter user ID"
            className="input input-bordered w-full"
          />
          <button
            className="btn btn-primary w-full flex items-center justify-center gap-2"
            onClick={() => {
              const id = document.getElementById("friendId").value.trim();
              if (id) {
                sendRequest(id);
                document.getElementById("friendId").value = "";
                // Close sidebar on mobile after adding friend
                if (window.innerWidth < 1024 && onClose) {
                  onClose();
                }
              }
            }}
          >
            <UserPlus className="size-5" />
            Send Request
          </button>
        </div>
      </section>
    </div>
  );
};

export default FriendsPanel;
