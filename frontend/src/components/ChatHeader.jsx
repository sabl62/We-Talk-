import { X, ChevronLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = ({ onBack }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  return (
    <div className="p-3 md:p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Mobile back button */}
        <button
          onClick={() => {
            if (onBack) onBack();
            else setSelectedUser(null);
          }}
          className="md:hidden btn btn-ghost btn-sm mr-1"
          aria-label="Back to chats"
        >
          <ChevronLeft />
        </button>

        <div className="avatar">
          <div className="w-10 h-10 rounded-full overflow-hidden border">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium text-sm md:text-base">
            {selectedUser.fullName}
          </h3>
          <p className="text-xs text-base-content/60">
            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost btn-square"
          onClick={() => setSelectedUser(null)}
          aria-label="Close chat"
        >
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
