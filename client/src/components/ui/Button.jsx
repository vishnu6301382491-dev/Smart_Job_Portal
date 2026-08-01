const buttonStyles = {
  primary:
    "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98] border border-blue-400/20",
  secondary:
    "bg-[var(--surface-bg)] text-[var(--text-primary)] hover:bg-[var(--surface-strong)] border border-[var(--border-color)] shadow-sm hover:border-blue-500/40 hover:scale-[1.01] active:scale-[0.99]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)] border border-transparent hover:scale-[1.01]",
  danger:
    "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-md shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98]",
  accent:
    "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]",
};

export const Button = ({
  as: Component = "button",
  variant = "primary",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <Component
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60 ${buttonStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
      ) : null}
      {children}
    </Component>
  );
};
