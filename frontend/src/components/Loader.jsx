import React from 'react';

/**
 * Reusable Loader component that renders spinners or pulse skeletons.
 * 
 * @param {'full'|'skeleton'|'list'} type - Style of loading visual
 * @param {number} count - Number of skeleton rows/cards to generate
 */
export const Loader = ({ type = 'full', count = 3 }) => {
  if (type === 'full') {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-600 border-t-transparent dark:border-sky-400"></div>
        <p className="animate-pulse text-sm text-slate-500 dark:text-slate-400">Loading data, please wait...</p>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="animate-pulse rounded-2xl bg-white p-6 shadow-card dark:bg-slate-800/80">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
              <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div className="mt-6 h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-700"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex animate-pulse items-center justify-between rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
              </div>
            </div>
            <div className="h-7 w-20 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default Loader;
