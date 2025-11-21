import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import {
  MoreVertical,
  MessageSquare,
  Trash2,
  CornerUpLeft,
  Image as ImageIcon, // Renamed to avoid conflict with HTML Image
} from "lucide-react";
import ImageModal from "./ImageModal";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  const [replyingTo, setReplyingTo] = useState(null);
  const [imagePreviewSrc, setImagePreviewSrc] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(true);

  useEffect(() => {
    if (!selectedUser) return;
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-focus input when chat opens or user changes
  useEffect(() => {
    if (selectedUser && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [selectedUser?._id]);

  // Auto-focus when clicking "reply"
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <div className="flex-1 grid place-items-center">
          <div className="text-center p-8">
            <MessageSquare className="mx-auto mb-4 w-12 h-12 text-primary" />
            <h3 className="text-xl font-semibold">Select a chat to start</h3>
            <p className="text-sm text-base-content/60 mt-1">
              Choose a contact from the left to begin chatting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleReply = (msg) => {
    setReplyingTo(msg);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-base-100 border-b border-base-300">
        <ChatHeader
          onBack={() => {
            setMobileOpen(false);
          }}
        />
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 md:p-6 bg-gradient-to-b from-base-100 to-base-200">
        <div className="max-w-3xl mx-auto">
          {isMessagesLoading ? (
            <MessageSkeleton />
          ) : (
            messages.map((message) => {
              const isSelf = message.senderId === authUser._id;

              // --------------------------------------------------------
              // ⚡️ HYBRID REPLY LOGIC (The Fix)
              // --------------------------------------------------------
              let replyMsg;

              // Case 1: Backend sent the full populated object
              if (message.replyTo && typeof message.replyTo === "object") {
                replyMsg = message.replyTo;
              }
              // Case 2: Backend/Socket sent just a string ID, find it in list
              else if (message.replyTo && typeof message.replyTo === "string") {
                replyMsg = messages.find((m) => m._id === message.replyTo);
              }
              // --------------------------------------------------------

              return (
                <div
                  key={message._id}
                  id={message._id}
                  className={`
                    flex items-start gap-3 relative scroll-mt-24
                    ${isSelf ? "justify-end" : "justify-start"}
                  `}
                >
                  {!isSelf && (
                    <div className="avatar">
                      <div className="size-10 rounded-full border">
                        <img
                          src={selectedUser.profilePic || "/avatar.png"}
                          alt={selectedUser.fullName}
                        />
                      </div>
                    </div>
                  )}

                  <div className="max-w-[75%] md:max-w-[60%]">
                    <div
                      className={`relative inline-block rounded-2xl p-3 shadow-sm ${
                        isSelf
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                          : "bg-base-100 border border-base-300 text-base-content"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs opacity-70 font-medium">
                            {isSelf ? "You" : selectedUser.fullName}
                          </span>
                          <span className="text-xs opacity-50">•</span>
                          <time className="text-xs opacity-50">
                            {formatMessageTime(message.createdAt)}
                          </time>
                          {message.isEdited && (
                            <span className="ml-2 text-xs italic opacity-60">
                              (edited)
                            </span>
                          )}
                        </div>

                        {/* Dropdown Menu */}
                        <div className="dropdown dropdown-end z-10">
                          <label
                            tabIndex={0}
                            className="cursor-pointer p-1 rounded hover:bg-base-200"
                          >
                            <MoreVertical
                              className={`${isSelf ? "text-white" : ""}`}
                            />
                          </label>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-44 text-base-content"
                          >
                            <li>
                              <button
                                onClick={() => handleReply(message)}
                                className="flex items-center gap-2"
                              >
                                <CornerUpLeft className="size-4" /> Reply
                              </button>
                            </li>

                            {isSelf && (
                              <li>
                                <button
                                  onClick={() => handleDelete(message._id)}
                                  className="flex items-center gap-2 text-error"
                                >
                                  <Trash2 className="size-4" /> Delete
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* ⚡️ REPLY BUBBLE DISPLAY */}
                      {replyMsg && (
                        <div
                          className={`
                            mb-2 p-2 rounded-md border-l-4 transition-all duration-300
                            ${
                              isSelf
                                ? "bg-emerald-700/30 border-emerald-300/60"
                                : "bg-base-300 border-primary"
                            } 
                            hover:bg-primary/20
                            cursor-pointer
                          `}
                          onClick={() => {
                            // Handle scrolling to message
                            const targetId = replyMsg._id || replyMsg; // handle object or string
                            const target = document.getElementById(targetId);

                            if (target) {
                              target.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                              target.classList.add("ring-4", "ring-primary/60");
                              setTimeout(() => {
                                target.classList.remove(
                                  "ring-4",
                                  "ring-primary/60"
                                );
                              }, 1200);
                            }
                          }}
                        >
                          <div className="text-xs opacity-80 truncate font-medium">
                            {replyMsg.isDeleted ? (
                              <span className="italic opacity-70">
                                Message deleted
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                {replyMsg.text ? (
                                  replyMsg.text
                                ) : replyMsg.image ? (
                                  <>
                                    <ImageIcon size={12} /> Photo
                                  </>
                                ) : (
                                  "Message"
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {message.image && (
                          <img
                            src={message.image}
                            alt="attachment"
                            className="w-full max-w-[320px] md:max-w-[420px] rounded-md cursor-pointer object-cover"
                            onClick={() => setImagePreviewSrc(message.image)}
                          />
                        )}

                        {!message.isDeleted ? (
                          message.text ? (
                            <p
                              className={`
                                ${isSelf ? "leading-relaxed" : ""}
                                break-words 
                                break-all 
                                overflow-hidden 
                                max-w-full
                                whitespace-pre-wrap
                              `}
                            >
                              {message.text}
                            </p>
                          ) : null
                        ) : (
                          <p className="italic opacity-60 text-xs mt-1">
                            This message was deleted
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelf && (
                    <div className="avatar">
                      <div className="size-10 rounded-full border">
                        <img
                          src={authUser.profilePic || "/avatar.png"}
                          alt={authUser.fullName}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-base-300 bg-base-100 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto">
          <MessageInput
            ref={inputRef}
            replyingTo={replyingTo}
            clearReply={() => setReplyingTo(null)}
          />
        </div>
      </div>

      {/* Image modal */}
      <ImageModal
        src={imagePreviewSrc}
        alt="Preview"
        onClose={() => setImagePreviewSrc(null)}
      />
    </div>
  );
};

export default ChatContainer;
