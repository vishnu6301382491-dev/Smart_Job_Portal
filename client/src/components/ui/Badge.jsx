const badgeStyles = {
  neutral: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  primary: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  danger: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  info: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  purple: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
};

export const Badge = ({ variant = "neutral", className = "", ...props }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md transition-all duration-200 ${badgeStyles[variant]} ${className}`}
      {...props}
    />
  );
};
