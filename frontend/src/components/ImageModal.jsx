import React from "react";

const ImageModal = ({ src, alt = "", onClose }) => {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-w-[95%] max-h-[95%] rounded-lg bg-base-100 shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="block max-w-full max-h-[80vh] object-contain"
        />
        <div className="flex justify-end p-3 border-t border-base-300 bg-base-200">
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost"
            aria-label="Close image preview"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
