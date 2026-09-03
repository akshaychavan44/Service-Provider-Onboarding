import React from 'react';

export default function ProgressBar({
  percentage = 0,
  label = 'Profile Completion',
  showText = true,
  size = 'md',
  color = 'brand',
}) {
  const clamped = Math.min(Math.max(percentage, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    brand: 'bg-gradient-to-r from-brand-600 to-indigo-500',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500',
  };

  const activeColor =
    colorClasses[color] ||
    (clamped >= 80
      ? colorClasses.emerald
      : clamped >= 40
      ? colorClasses.brand
      : colorClasses.amber);

  return (
    <div className="w-full">
      {showText && (
        <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
          <span className="text-slate-600">{label}</span>
          <span className="text-slate-900 font-bold">{clamped}%</span>
        </div>
      )}
      <div
        className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-700 ease-out ${activeColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
