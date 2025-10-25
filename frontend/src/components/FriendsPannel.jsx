// src/components/FriendsPanel.jsx
import { useEffect, useState } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { UserPlus, Check, Menu, X } from "lucide-react";

const FriendsPanel = () => {
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

  // Sidebar toggle for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    getFriends();
    getRequests();
  }, [getFriends, getRequests]);

  if (isLoading)
    return (
      <div className="p-5 text-center text-zinc-500">Loading friends...</div>
    );

  return (
    <div className="flex h-screen overflow-hidden bg-base-100">
      {/* Sidebar */}
      <aside
        className={`fixed sm:static top-0 left-0 h-full sm:h-auto sm:w-80 w-full sm:flex flex-col bg-base-200 border-r border-base-300 transform transition-transform duration-300 ease-in-out z-30
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        {/* Close button (only for mobile) */}
        <div className="flex items-center justify-between sm:hidden p-4 border-b border-base-300 bg-base-200">
          <h2 className="font-semibold text-lg">Friends</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="btn btn-ghost btn-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Friend Requests */}
          <section>
            <h2 className="font-semibold mb-2">Friend Requests</h2>
            {requests.length === 0 ? (
              <p className="text-sm text-zinc-400">No pending requests</p>
            ) : (
              requests.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between bg-base-300 rounded-xl p-3 mb-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="truncate">{user.fullName}</span>
                  </div>
                  <button
                    onClick={() => acceptRequest(user._id)}
                    className="btn btn-sm btn-success flex items-center gap-1"
                  >
                    <Check className="size-4" /> Accept
                  </button>
                </div>
              ))
            )}
          </section>

          {/* Friends List */}
          <section>
            <h2 className="font-semibold mb-2">Your Friends</h2>
            {friends.length === 0 ? (
              <p className="text-sm text-zinc-400">
                You have no friends yet!
              </p>
            ) : (
              friends.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 bg-base-300 rounded-xl p-3 mb-2"
                >
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="truncate">{user.fullName}</span>
                </div>
              ))
            )}
          </section>

          {/* Add Friend */}
          <section>
            <h2 className="font-semibold mb-2">Add a Friend</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full overflow-hidden">
              <input
                type="text"
                id="friendId"
                placeholder="Enter user ID"
                className="input input-bordered flex-grow w-full min-w-0"
              />
              <button
                className="btn btn-primary flex items-center justify-center gap-1 flex-shrink-0 sm:w-auto w-full"
                onClick={() => {
                  const id = document.getElementById("friendId").value.trim();
                  if (id) sendRequest(id);
                }}
              >
                <UserPlus className="size-4" /> Add
              </button>
            </div>
          </section>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm sm:hidden z-20"
        />
      )}

      {/* Main Chat Container */}
      <main className="flex-1 relative p-4 sm:p-6 overflow-y-auto">
        {/* Hamburger Menu Button (mobile only) */}
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="btn btn-ghost btn-sm absolute top-4 left-4 sm:hidden z-10"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </main>
    </div>
  );
};

export default FriendsPanel;
