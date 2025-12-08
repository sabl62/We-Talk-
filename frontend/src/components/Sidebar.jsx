import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, Menu, X } from "lucide-react";
import FriendsPanel from "./FriendsPanel";

const Sidebar = ({ collapsed = false }) => {
  const { getFriends, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  // Deduplicate users to prevent duplicate keys
  const uniqueUsers = useMemo(() => {
    const safeUsers = users || [];
    const seen = new Set();
    return safeUsers.filter((user) => {
      if (seen.has(user._id)) {
        return false;
      }
      seen.add(user._id);
      return true;
    });
  }, [users]);

  const filteredUsers = useMemo(() => {
    const base = showOnlineOnly
      ? uniqueUsers.filter((user) => onlineUsers.includes(user._id))
      : uniqueUsers;
    if (!query.trim()) return base;
    return base.filter((u) =>
      (u.fullName || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [uniqueUsers, showOnlineOnly, onlineUsers, query]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      {/* Hamburger Menu Button - Only visible on small screens */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 left-4 z-40 lg:hidden btn btn-circle btn-primary shadow-lg"
        aria-label="Open contacts menu"
      >
        <Menu className="size-6" />
      </button>

      {/* Overlay - darkens background when menu is open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed lg:relative
          top-0 left-0 h-full
          w-80 lg:w-80
          border-r border-base-300
          transform transition-transform duration-300 ease-in-out
          z-50
          flex flex-col
          bg-base-100
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header with Close Button */}
        <div className="border-b border-base-300 w-full p-4 relative">
          {/* Close Button - Only visible on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 lg:hidden btn btn-circle btn-sm btn-ghost"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium">Contacts</span>
          </div>

          {/* Search Bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center w-full gap-2 bg-base-200 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 opacity-60 flex-shrink-0" />
              <input
                className="bg-transparent outline-none w-full text-sm"
                placeholder="Search contacts"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Online Filter */}
          <div className="mt-3 flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
            <span className="text-xs text-zinc-500">
              ({onlineUsers.length - 1} online)
            </span>
          </div>

          {/* Friends Toggle Button */}
          <button
            onClick={() => setShowFriends(!showFriends)}
            className="btn btn-sm mt-3 w-full"
          >
            {showFriends ? "Back to Chats" : "Friends"}
          </button>
        </div>

        {/* Content Area */}
        {showFriends ? (
          <FriendsPanel onClose={() => setIsOpen(false)} />
        ) : (
          <div className="overflow-y-auto w-full py-3 flex-1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    // Close sidebar on mobile after selecting a user
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                    selectedUser?._id === user._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName || "User"}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                    )}
                  </div>

                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-zinc-500 py-8">
                {query.trim() ? (
                  <div>
                    <p className="font-medium mb-1">No results found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                ) : showOnlineOnly ? (
                  <div>
                    <p className="font-medium mb-1">No online users</p>
                    <p className="text-sm">Check back later</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium mb-1">No contacts found</p>
                    <p className="text-sm">Add friends to start chatting</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
