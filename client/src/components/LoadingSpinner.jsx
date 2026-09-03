import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  className = '',
}) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 36,
    xl: 48,
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2
        size={sizeMap[size] || 24}
        className="animate-spin text-brand-600"
      />
      {text && (
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
