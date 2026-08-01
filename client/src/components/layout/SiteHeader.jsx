import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import NotificationPreferenceControls from "../notifications/NotificationPreferenceControls";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { userService } from "../../services/userService";

const navLinkClass = ({ isActive }) =>
  [
    "rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200",
    isActive
      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20"
      : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]",
  ].join(" ");

export const SiteHeader = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [preferenceSavingKey, setPreferenceSavingKey] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notificationMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      if (!isAuthenticated) {
        if (!cancelled) {
          setUnreadNotifications(0);
        }
        return;
      }

      try {
        const { data } = await userService.notificationSummary();
        if (!cancelled) {
          setUnreadNotifications(data.unreadCount || 0);
        }
      } catch {
        if (!cancelled) {
          setUnreadNotifications(0);
        }
      }
    };

    const refresh = () => {
      void loadSummary();
    };

    refresh();
    window.addEventListener("smart-job-notifications-updated", refresh);
    const interval = window.setInterval(refresh, 60000);

    return () => {
      cancelled = true;
      window.removeEventListener("smart-job-notifications-updated", refresh);
      window.clearInterval(interval);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!notificationMenuOpen || !isAuthenticated) {
      return undefined;
    }

    let cancelled = false;

    const loadRecentNotifications = async () => {
      try {
        const { data } = await userService.notifications({ limit: 5 });
        if (!cancelled) {
          setRecentNotifications(data.notifications || []);
        }
      } catch {
        if (!cancelled) {
          setRecentNotifications([]);
        }
      }
    };

    const handlePointerDown = (event) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setNotificationMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotificationMenuOpen(false);
      }
    };

    loadRecentNotifications();
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      cancelled = true;
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isAuthenticated, notificationMenuOpen]);

  const handlePreviewNotification = async (notification) => {
    if (!notification?.readAt) {
      try {
        await userService.markNotificationRead(notification._id);
        window.dispatchEvent(new Event("smart-job-notifications-updated"));
      } catch {
        // Keep preview robust
      }
    }

    setNotificationMenuOpen(false);
    navigate(notification.link || "/notifications");
  };

  const handleMarkAllRead = async () => {
    try {
      await userService.markAllNotificationsRead();
      window.dispatchEvent(new Event("smart-job-notifications-updated"));
      setNotificationMenuOpen(false);
    } catch {
      // Ignore dropdown failures
    }
  };

  const handleTogglePreference = async (prefKey) => {
    if (!user) return;

    const currentPrefs = user.notificationPrefs || {};
    const nextValue = currentPrefs[prefKey] === false;
    const nextPrefs = {
      ...currentPrefs,
      [prefKey]: nextValue,
    };

    setPreferenceSavingKey(prefKey);

    try {
      const { data } = await userService.updateProfile({
        notificationPrefs: nextPrefs,
      });

      if (data.user) {
        updateUser(data.user);
      }
    } catch {
      // Keep dropdown usable
    } finally {
      setPreferenceSavingKey("");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-all">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-lg shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            SJ
          </span>
          <div>
            <p className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              Smart<span className="text-blue-600 dark:text-blue-400">Job</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              Job Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/jobs" className={navLinkClass}>
            Jobs
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/tracker" className={navLinkClass}>
                Job Tracker
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/saved-jobs" className={navLinkClass}>
                Saved Jobs
              </NavLink>
            </>
          ) : null}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:border-blue-500/40 transition-all text-sm flex items-center gap-1.5 font-medium"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Notifications Dropdown Trigger */}
          {isAuthenticated ? (
            <div className="relative" ref={notificationMenuRef}>
              <button
                type="button"
                onClick={() => setNotificationMenuOpen((current) => !current)}
                className="relative p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:border-blue-500/40 transition-all text-sm font-medium"
                aria-label="Notifications"
              >
                🔔
                {unreadNotifications > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-extrabold text-white shadow-sm shadow-blue-500/40">
                    {unreadNotifications}
                  </span>
                ) : null}
              </button>

              {/* Notification Menu Card */}
              {notificationMenuOpen ? (
                <div className="absolute right-0 top-12 w-96 rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications Inbox</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{unreadNotifications} unread alerts</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleMarkAllRead()}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <NotificationPreferenceControls
                    user={user}
                    onTogglePreference={handleTogglePreference}
                    savingKey={preferenceSavingKey}
                    title="Quick Preferences"
                    description="Toggle active alert channels."
                    className="rounded-2xl p-3"
                  />

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map((notification) => (
                        <button
                          key={notification._id}
                          type="button"
                          onClick={() => void handlePreviewNotification(notification)}
                          className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 text-left transition hover:border-blue-500/40"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{notification.title}</p>
                            {!notification.readAt ? <span className="h-2 w-2 rounded-full bg-blue-500" /> : null}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{notification.message}</p>
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-center text-xs text-slate-600 dark:text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/5 font-medium">
                        No notifications yet.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      as={Link}
                      to="/notifications"
                      variant="secondary"
                      className="flex-1 text-xs font-semibold"
                      onClick={() => setNotificationMenuOpen(false)}
                    >
                      View All Inbox
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* User Auth Controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="hidden sm:flex items-center gap-2 group">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="text-left text-xs">
                  <p className="font-semibold text-slate-900 dark:text-white leading-tight">{user?.name}</p>
                  <p className="capitalize text-slate-500 dark:text-slate-400 leading-tight">{user?.role}</p>
                </div>
              </Link>
              <Button variant="ghost" className="text-xs px-3 py-2" onClick={() => void logout()}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button as={Link} to="/login" variant="ghost" className="text-xs px-3 py-2">
                Login
              </Button>
              <Button as={Link} to="/register" variant="primary" className="text-xs px-3.5 py-2">
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen ? (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 p-4 space-y-2 animate-in slide-in-from-top duration-200">
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/jobs" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
            Jobs
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/tracker" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                Job Tracker
              </NavLink>
              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/saved-jobs" onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                Saved Jobs
              </NavLink>
            </>
          ) : null}
        </div>
      ) : null}
    </header>
  );
};
