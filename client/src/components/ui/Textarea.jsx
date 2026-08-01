export const Textarea = ({ label, className = "", error, ...props }) => {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</span> : null}
      <textarea
        rows={4}
        className={`w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-md ${
          error ? "border-rose-500/80 focus:ring-rose-500/20" : ""
        } ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-rose-500 mt-1">{error}</p> : null}
    </label>
  );
};
