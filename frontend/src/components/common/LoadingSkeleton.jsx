import React from 'react';

/**
 * Loading skeleton component for placeholders during data fetch
 */
export function LoadingSkeleton({ variant = 'card', count = 1, className = '' }) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'table-row') {
    return (
      <>
        {items.map((i) => (
          <tr key={i} className="animate-pulse border-b border-[#D9E1E8]">
            <td className="p-4"><div className="h-4 w-16 bg-slate-200 rounded"></div></td>
            <td className="p-4"><div className="h-4 w-48 bg-slate-200 rounded"></div></td>
            <td className="p-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
            <td className="p-4"><div className="h-6 w-20 bg-slate-200 rounded-full"></div></td>
            <td className="p-4"><div className="h-4 w-28 bg-slate-200 rounded"></div></td>
            <td className="p-4 text-right"><div className="h-8 w-16 bg-slate-200 rounded ml-auto"></div></td>
          </tr>
        ))}
      </>
    );
  }

  if (variant === 'stat-card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {items.map((i) => (
          <div key={i} className="animate-pulse p-5 rounded-xl border border-[#D9E1E8] bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-7 w-16 bg-slate-200 rounded mb-2"></div>
            <div className="h-3 w-28 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-[#D9E1E8] bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
            <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
          </div>
          <div className="h-3 w-3/4 bg-slate-200 rounded mb-2"></div>
          <div className="h-3 w-1/2 bg-slate-200 rounded mb-4"></div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="h-3 w-24 bg-slate-200 rounded"></div>
            <div className="h-3 w-16 bg-slate-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
