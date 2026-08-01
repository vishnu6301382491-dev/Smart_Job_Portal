export const SkeletonCard = () => {
  return (
    <div className="glass-card p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-300/20 dark:bg-slate-700/30 shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-48 rounded-lg bg-slate-300/20 dark:bg-slate-700/30" />
            <div className="h-3.5 w-32 rounded-lg bg-slate-300/15 dark:bg-slate-700/20" />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full bg-slate-300/20 dark:bg-slate-700/30" />
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <div className="h-6 w-16 rounded-full bg-slate-300/15 dark:bg-slate-700/20" />
        <div className="h-6 w-20 rounded-full bg-slate-300/15 dark:bg-slate-700/20" />
        <div className="h-6 w-24 rounded-full bg-slate-300/15 dark:bg-slate-700/20" />
      </div>
      <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4">
        <div className="h-4 w-28 rounded-lg bg-slate-300/15 dark:bg-slate-700/20" />
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-xl bg-slate-300/20 dark:bg-slate-700/30" />
          <div className="h-9 w-24 rounded-xl bg-slate-300/25 dark:bg-slate-700/40" />
        </div>
      </div>
    </div>
  );
};
