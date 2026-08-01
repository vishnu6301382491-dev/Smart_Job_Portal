import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../ui/Badge";

const linkClass = ({ isActive }) =>
  [
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
    isActive
      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
      : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]",
  ].join(" ");

export const DashboardLayout = () => {
  const { user } = useAuth();

  const links = [
    { to: "/dashboard", label: "Overview", icon: "📌" },
    { to: "/tracker", label: "My Job Tracker", icon: "📊" },
    { to: "/profile", label: "My Profile", icon: "👤" },
    { to: "/applications", label: "Applied Jobs", icon: "📩" },
    { to: "/notifications", label: "Notifications", icon: "🔔" },
    { to: "/saved-jobs", label: "Saved Jobs", icon: "⭐" },
  ];

  if (user?.role === "employer" || user?.role === "admin") {
    links.push({ to: "/employer", label: "Employer Dashboard", icon: "🏢" });
    links.push({ to: "/employer/jobs/new", label: "Post New Job", icon: "➕" });
  }

  if (user?.role === "admin") {
    links.push({ to: "/admin", label: "Admin Console", icon: "⚙️" });
    links.push({ to: "/admin/agent", label: "AI Job Agent", icon: "🤖" });
  }

  return (
    <div className="page-shell grid gap-6 lg:grid-cols-[270px_1fr]">
      {/* Glassmorphism Sidebar Navigation */}
      <aside className="glass-card p-5 space-y-6 h-fit sticky top-24">
        {/* User Card */}
        <div className="border-b border-[var(--border-color)] pb-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Portal User</p>
            <p className="text-sm font-extrabold text-[var(--text-primary)] truncate">{user?.name || "Guest"}</p>
            <Badge variant="primary" className="mt-1 text-[10px] py-0 px-2 uppercase">
              {user?.role || "user"}
            </Badge>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === "/dashboard"}>
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Dashboard Workspace */}
      <section className="glass-panel p-6 sm:p-8 space-y-6">
        <Outlet />
      </section>
    </div>
  );
};
