import React, { forwardRef } from 'react';

interface TextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ value, onChange }, ref) => {
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      className="w-full h-40 p-4 text-lg bg-slate-900/70 text-slate-100 rounded-xl border-2 border-slate-700/50 focus:border-cyan-500/70 focus:ring-4 focus:ring-cyan-500/20 outline-none resize-none transition-all duration-300 shadow-inner shadow-black/20"
      placeholder="Start typing..."
      autoFocus
    />
  );
});