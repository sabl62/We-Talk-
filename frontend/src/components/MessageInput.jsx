import { useState, useRef, useImperativeHandle } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";

const MessageInput = ({ replyingTo, clearReply, ref }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useImperativeHandle(ref, () => ({
    focus: () => {
      textInputRef.current?.focus();
    },
  }));

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      let processedFile = file;

      if (file.size > MAX_FILE_SIZE) {
        const toastId = toast.loading("Compressing image...");
        const options = {
          maxSizeMB: 4.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        processedFile = await imageCompression(file, options);
        toast.dismiss(toastId);

        if (processedFile.size > MAX_FILE_SIZE) {
          toast.error("Image is too large (max 5MB)");
          return;
        }

        toast.success("Image compressed");
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      console.error(error);
      toast.error("Failed to process image");
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (isSending) return;
    if (!text.trim() && !imagePreview) return;

    

    setIsSending(true);
    try {
      const result = await sendMessage({
        text: text.trim(),
        image: imagePreview || null,
        replyTo: replyingTo?._id || null,
      });

     

      // Reset form
      setText("");
      removeImage();
      clearReply?.();
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);

      setTimeout(() => {
        textInputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="w-full bg-base-100">
      <div className="p-3 md:p-4">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="mb-3 flex items-center justify-between bg-base-200 border-l-4 border-emerald-500 rounded px-3 py-2">
            <div className="flex-1 min-w-0">
              <span className="text-xs opacity-80 block mb-1">
                Replying to previous message
              </span>
              <div className="font-medium text-sm truncate text-zinc-300">
                {replyingTo.text || replyingTo.content ? (
                  replyingTo.text || replyingTo.content
                ) : replyingTo.image ? (
                  <span className="italic flex items-center gap-1">
                    <Image size={14} /> Photo
                  </span>
                ) : (
                  "Message"
                )}
              </div>
            </div>

            <button
              className="btn btn-ghost btn-xs btn-circle ml-2"
              onClick={clearReply}
              type="button"
              aria-label="Cancel reply"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 flex items-center gap-3">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 btn btn-xs btn-circle"
                type="button"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
            <div className="text-sm text-zinc-400">
              Selected image will be uploaded
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 flex gap-2 items-center">
            <input
              type="text"
              ref={textInputRef}
              className="w-full input input-bordered rounded-lg input-sm sm:input-md"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isSending}
            />

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={isSending}
            />

            <button
              type="button"
              className="btn btn-ghost btn-square hidden sm:inline-flex"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
              aria-label="Attach image"
            >
              <Image />
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-circle"
            disabled={(!text.trim() && !imagePreview) || isSending}
            aria-label="Send message"
          >
            <Send />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
