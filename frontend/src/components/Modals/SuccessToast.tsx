import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface SuccessToastProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  isOpen,
  onClose,
  title = 'Task saved successfully',
  message = 'Payment successful',
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-5 right-5 z-50 animate-linear-enter">
      <div className="flex items-center gap-3.5 px-4 py-3 rounded-2xl backdrop-blur-2xl bg-white/95 dark:bg-black/95 border border-zinc-200/90 dark:border-zinc-800 shadow-2xl">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-200 dark:shadow-none">
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
        <div>
          <div className="text-xs sm:text-sm font-bold text-black dark:text-white leading-tight">
            {title}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-zinc-400 hover:text-black dark:hover:text-white ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
