import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const NotificationPreferenceControls = ({
  user,
  onTogglePreference,
  savingKey = "",
  title = "Quick controls",
  description = "Manage the in-app alerts you want to keep seeing.",
  className = "",
}) => {
  const savedJobUpdatesEnabled = user?.notificationPrefs?.savedJobUpdates !== false;
  const matchedJobsEnabled = user?.notificationPrefs?.matchedJobs !== false;

  return (
    <div className={`rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-4 sm:p-5 ${className}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">Flip in-app alert types on the fly</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={savedJobUpdatesEnabled ? "success" : "warning"}>
            Saved jobs: {savedJobUpdatesEnabled ? "On" : "Off"}
          </Badge>
          <Badge variant={matchedJobsEnabled ? "success" : "warning"}>
            Matching jobs: {matchedJobsEnabled ? "On" : "Off"}
          </Badge>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-3.5 shadow-sm">
          <p className="text-xs font-bold text-slate-900 dark:text-white">Saved job alerts</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Get notified when a role you saved changes or gets removed.</p>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant={savedJobUpdatesEnabled ? "secondary" : "primary"}
              disabled={savingKey === "savedJobUpdates"}
              onClick={() => void onTogglePreference("savedJobUpdates")}
              className="text-xs px-3 py-1.5"
            >
              {savingKey === "savedJobUpdates" ? "Saving..." : savedJobUpdatesEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-3.5 shadow-sm">
          <p className="text-xs font-bold text-slate-900 dark:text-white">Matching job alerts</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Get notified when a new role matches your profile skills.</p>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant={matchedJobsEnabled ? "secondary" : "primary"}
              disabled={savingKey === "matchedJobs"}
              onClick={() => void onTogglePreference("matchedJobs")}
              className="text-xs px-3 py-1.5"
            >
              {savingKey === "matchedJobs" ? "Saving..." : matchedJobsEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferenceControls;
