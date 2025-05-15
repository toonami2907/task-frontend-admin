import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Modal({ isOpen, onClose, children, title, className = "" }) {
  const modalRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = ""; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  // Close when clicking outside the modal content
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white p-0 shadow-lg ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        )}
        <div className="p-0">{children}</div>
      </div>
    </div>
  );
}

export function ModalTrigger({ children, onClick }) {
  return React.cloneElement(children, {
    onClick: (e) => {
      e.preventDefault();
      if (onClick) onClick();
      if (children.props.onClick) children.props.onClick(e);
    },
  });
}