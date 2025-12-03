import React from 'react';

export default function ViewerWrapper({ title, children }) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-zinc-950 p-6 shadow-sm">
      {title && (
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b dark:border-gray-800">
          {title}
        </h2>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}