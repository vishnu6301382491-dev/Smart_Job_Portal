import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../_PageShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Loader } from "../../components/ui/Loader";
import { userService } from "../../services/userService";
import { getErrorMessage } from "../../services/error";

const STAGE_COLUMNS = [
  { id: "applied", label: "Applied", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  { id: "interview", label: "Interview Scheduled", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" },
  { id: "shortlisted", label: "Shortlisted", color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" },
  { id: "offer", label: "Offer Received", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { id: "rejected", label: "Rejected / Expired", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" },
];

const JobTrackerPage = () => {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const loadTrackerData = async () => {
    setLoading(true);
    setError("");

    try {
      const [appRes, savedRes] = await Promise.all([
        userService.appliedJobs(),
        userService.savedJobs(),
      ]);

      setApplications(appRes.data.applications || []);
      setSavedJobs(savedRes.data.jobs || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load job tracker data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrackerData();
  }, []);

  const getAppsForStage = (stageId) => {
    if (stageId === "rejected") {
      return applications.filter((app) => ["rejected", "expired"].includes(app.status));
    }
    if (stageId === "applied") {
      return applications.filter((app) => ["applied", "pending", "reviewed"].includes(app.status));
    }
    return applications.filter((app) => app.status === stageId);
  };

  return (
    <PageShell
      title="My Job Tracker"
      description="Visual Kanban application pipeline to track your application lifecycle, interviews, and offer status."
      actions={[]}
    >
      {loading ? (
        <Loader label="Loading your job application pipeline..." />
      ) : error ? (
        <div className="glass-card p-6 border-rose-500/30 bg-rose-500/10 text-sm text-rose-500">{error}</div>
      ) : (
        <div className="space-y-8">
          {/* Saved Opportunities Banner */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">⭐ Saved Opportunities ({savedJobs.length})</h3>
                <p className="text-xs text-[var(--text-muted)]">Bookmarked jobs ready for quick application.</p>
              </div>
              <Button as={Link} to="/jobs" variant="secondary" className="text-xs px-3 py-1.5">
                Browse Vacancies →
              </Button>
            </div>

            {savedJobs.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {savedJobs.map((job) => (
                  <div
                    key={job._id}
                    className="min-w-[260px] max-w-[280px] rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)] p-4 flex flex-col justify-between shrink-0 hover:border-blue-500/40 transition"
                  >
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{job.title}</p>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">{job.employer?.companyName || "Company"}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">📍 {job.location}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-[var(--border-color)] pt-2 text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{job.salaryMin ? `${job.currency} ${job.salaryMin.toLocaleString()}` : "Competitive"}</span>
                      <Link to={`/jobs/${job._id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
                        Apply ↗
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No saved jobs yet.</p>
            )}
          </div>

          {/* Kanban Columns Stream */}
          <div className="grid gap-4 lg:grid-cols-5">
            {STAGE_COLUMNS.map((col) => {
              const stageApps = getAppsForStage(col.id);

              return (
                <div key={col.id} className="glass-card p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-xs font-extrabold text-[var(--text-muted)]">{stageApps.length}</span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] scrollbar-thin">
                    {stageApps.length > 0 ? (
                      stageApps.map((app) => (
                        <div
                          key={app._id}
                          onClick={() => setSelectedApp(app)}
                          className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)] p-4 space-y-2 cursor-pointer transition-all hover:border-blue-500/40 hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <p className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">{app.job?.title || "Job Application"}</p>
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{app.job?.employer?.companyName || "Employer"}</p>
                          <p className="text-xs text-[var(--text-muted)]">📍 {app.job?.location}</p>

                          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)] font-medium">
                            <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                            <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Timeline ➔</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] text-center py-8">No jobs in stage</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Modal */}
          {selectedApp ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-lg rounded-3xl border border-[var(--border-color)] bg-[var(--surface-strong)] p-6 shadow-2xl space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="primary">Application Timeline</Badge>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mt-2">{selectedApp.job?.title}</h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{selectedApp.job?.employer?.companyName}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedApp(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg">
                    ✕
                  </button>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold mb-3">Status Audit History</h4>
                  <div className="space-y-4 relative border-l-2 border-blue-500/40 ml-3 pl-4">
                    {(selectedApp.timeline || []).map((entry, index) => (
                      <div key={index} className="relative">
                        <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-[var(--surface-strong)]" />
                        <p className="text-sm font-bold capitalize text-[var(--text-primary)]">{entry.status}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{entry.note}</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{new Date(entry.updatedAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-[var(--border-color)]">
                  <Button type="button" variant="secondary" onClick={() => setSelectedApp(null)}>
                    Close Timeline
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </PageShell>
  );
};

export default JobTrackerPage;
