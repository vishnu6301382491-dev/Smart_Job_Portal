export const Input = ({ label, icon, className = "", error, ...props }) => {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</span> : null}
      <div className="relative flex items-center">
        {icon ? <span className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none text-sm">{icon}</span> : null}
        <input
          className={`w-full rounded-xl border border-[var(--border-color)] bg-[var(--surface-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-all duration-200 placeholder:text-[var(--text-muted)] focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-md ${
            icon ? "pl-10" : ""
          } ${error ? "border-rose-500/80 focus:ring-rose-500/20" : ""} ${className}`}
          {...props}
        />
      </div>
      {error ? <p className="text-xs text-rose-500 mt-1">{error}</p> : null}
    </label>
  );
};
