import React from 'react';

export default function ViewerWrapper({ title, children }) {
  return (
    // Common outer wrapper styling for all viewers
    <div className="m-6 border rounded bg-white dark:bg-black dark:border-gray-700 p-6 shadow space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      {children}
    </div>
  );
}