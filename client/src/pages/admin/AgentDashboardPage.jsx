import { useEffect, useState } from "react";
import PageShell from "../_PageShell";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Loader } from "../../components/ui/Loader";
import { agentService } from "../../services/agentService";
import { getErrorMessage } from "../../services/error";

const AgentDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState(false);
  const [importingDemo, setImportingDemo] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [filters, setFilters] = useState({
    q: "",
    verificationStatus: "",
    status: "",
    category: "",
    isLocal: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [analyticsRes, jobsRes, logsRes] = await Promise.all([
        agentService.getAnalytics(),
        agentService.getJobs(filters),
        agentService.getLogs(),
      ]);

      setAnalytics(analyticsRes.data);
      setJobs(jobsRes.data.jobs || []);
      setLogs(logsRes.data.logs || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load AI Agent dashboard data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.verificationStatus, filters.status, filters.category, filters.isLocal]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleRunAgent = async () => {
    setRunningAgent(true);
    setError("");
    setSuccessMsg("");

    try {
      const { data } = await agentService.run();
      setSuccessMsg(`AI Agent execution complete! Collected ${data.log?.stats?.totalCollected || 0} items.`);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "Agent execution failed"));
    } finally {
      setRunningAgent(false);
    }
  };

  const handleImportDemo = async () => {
    setImportingDemo(true);
    setError("");
    setSuccessMsg("");

    try {
      const { data } = await agentService.importDemo(1000);
      setSuccessMsg(data.message || "Pan-India demo jobs dataset successfully seeded!");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "Demo seeding failed"));
    } finally {
      setImportingDemo(false);
    }
  };

  const handleVerifyJob = async (jobId, action) => {
    try {
      await agentService.verifyJob(jobId, action);
      setSuccessMsg(`Job successfully ${action === "approve" ? "approved & published" : "rejected & archived"}`);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to verify job"));
    }
  };

  const kpis = analytics?.kpis || {};
  const chartData = analytics?.analytics || {};

  return (
    <PageShell
      title="AI Job Agent Intelligence"
      description="Autonomous pan-India job harvester, AI data cleaner, duplicate prevention engine, and local job verification center."
      actions={[]}
    >
      <div className="space-y-6">
        {/* Top Notification Messages */}
        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {successMsg ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            {successMsg}
          </div>
        ) : null}

        {/* Action Header Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <p className="text-sm font-semibold text-white">Pan-India Autonomous Agent Active</p>
              <Badge variant="info">
                Schedule: {analytics?.scheduler?.schedule || "0 6,12,18 * * *"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Harvests from 100+ Companies, Startups, and Public Directory Sources across all 28 States & UTs automatically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleImportDemo}
              disabled={importingDemo}
              className="px-5 py-2.5 text-xs font-semibold"
            >
              {importingDemo ? "Seeding 1,000 Jobs..." : "🚀 Seed 1,000+ Pan-India Jobs"}
            </Button>

            <Button
              type="button"
              onClick={handleRunAgent}
              disabled={runningAgent}
              className="px-6 py-2.5 text-xs font-semibold"
            >
              {runningAgent ? "Harvesting & Cleaning..." : "⚡ Run AI Agent Now"}
            </Button>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Total Harvested</p>
            <p className="mt-2 text-3xl font-bold text-white">{kpis.totalCollected || 0}</p>
            <p className="mt-1 text-xs text-slate-400">+{kpis.newTodayCount || 0} today</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Pending Verification</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">{kpis.pendingVerificationCount || 0}</p>
            <p className="mt-1 text-xs text-slate-400">Local & low-confidence listings</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Duplicates Prevented</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">{kpis.duplicatesPrevented || 0}</p>
            <p className="mt-1 text-xs text-slate-400">{kpis.updatedJobsCount || 0} merged updates</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400">Avg Confidence Score</p>
            <p className="mt-2 text-3xl font-bold text-emerald-300">{kpis.averageConfidence || 85}%</p>
            <p className="mt-1 text-xs text-slate-400">AI Quality Threshold: 70%</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("jobs")}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === "jobs"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Collected Job Intelligence ({jobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === "analytics"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Regional Analytics & Charts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === "logs"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Agent Logs & Runs ({logs.length})
          </button>
        </div>

        {/* TAB 1: Collected Jobs */}
        {activeTab === "jobs" ? (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Input
                placeholder="Search title, company, state..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
              <Select
                value={filters.verificationStatus}
                onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
              >
                <option value="">All Verification Status</option>
                <option value="pending">Pending Approval</option>
                <option value="verified">Verified & Published</option>
                <option value="rejected">Rejected</option>
              </Select>
              <Select
                value={filters.isLocal}
                onChange={(e) => setFilters({ ...filters, isLocal: e.target.value })}
              >
                <option value="">All Locations</option>
                <option value="true">Local Business Jobs</option>
                <option value="false">National / Remote Jobs</option>
              </Select>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Lifecycle Status</option>
                <option value="active">Active</option>
                <option value="updated">Updated</option>
                <option value="expired">Expired</option>
                <option value="archived">Archived</option>
              </Select>
              <Button type="submit" variant="secondary">
                Filter Results
              </Button>
            </form>

            {loading ? (
              <Loader label="Loading collected jobs..." />
            ) : jobs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                No jobs match the specified filters. Click "🚀 Seed 1,000+ Pan-India Jobs" to populate demo listings!
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-lg font-semibold text-white">{job.title}</h4>
                          {job.state ? (
                            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
                              🇮🇳 {job.state}
                            </span>
                          ) : null}
                          {job.isLocal ? (
                            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300 border border-purple-500/30">
                              📍 Local Job
                            </span>
                          ) : null}
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              job.confidenceScore >= 80
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : job.confidenceScore >= 60
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            AI Confidence: {job.confidenceScore}%
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-cyan-300">
                          {job.companyName} • <span className="text-slate-300">{job.location}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {job.verificationStatus === "pending" ? (
                          <>
                            <Button
                              type="button"
                              onClick={() => handleVerifyJob(job._id, "approve")}
                              className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500"
                            >
                              Approve & Publish
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => handleVerifyJob(job._id, "reject")}
                              className="px-3 py-1.5 text-xs text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Badge variant={job.verificationStatus === "verified" ? "success" : "danger"}>
                            {job.verificationStatus}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-slate-300">{job.description}</p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-slate-400">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span>Source: <strong className="text-slate-200">{job.sourceName}</strong></span>
                        <span>Category: <strong className="text-slate-200">{job.category}</strong></span>
                        {job.salaryMin || job.salaryMax ? (
                          <span>
                            Salary: <strong className="text-emerald-300">
                              {job.currency} {job.salaryMin || 0} - {job.salaryMax || 0}
                            </strong>
                          </span>
                        ) : null}
                      </div>

                      <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline"
                      >
                        View Original Source ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* TAB 2: Regional Analytics & Breakdown */}
        {activeTab === "analytics" ? (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Jobs by Category</h3>
              <div className="space-y-3">
                {(chartData.byCategory || []).map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>{cat.category}</span>
                      <span className="font-semibold text-cyan-300">{cat.count} jobs</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{
                          width: `${Math.min(100, (cat.count / (kpis.totalCollected || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Jobs by State / UT</h3>
              <div className="space-y-3">
                {(chartData.byState || []).map((st) => (
                  <div key={st.state} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>🇮🇳 {st.state}</span>
                      <span className="font-semibold text-emerald-300">{st.count} jobs</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{
                          width: `${Math.min(100, (st.count / (kpis.totalCollected || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Jobs by Top Cities</h3>
              <div className="space-y-3">
                {(chartData.byCity || []).map((city) => (
                  <div key={city.city} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>📍 {city.city}</span>
                      <span className="font-semibold text-purple-300">{city.count} jobs</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-purple-400 rounded-full"
                        style={{
                          width: `${Math.min(100, (city.count / (kpis.totalCollected || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* TAB 3: Agent Logs & Audit Run History */}
        {activeTab === "logs" ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log._id} className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-semibold text-cyan-300">{log.runId}</span>
                    <p className="text-xs text-slate-400">
                      Triggered by: <span className="capitalize text-slate-200">{log.triggeredBy}</span> •{" "}
                      {new Date(log.startTime).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={log.status === "completed" ? "success" : "danger"}>
                    {log.status} ({((log.durationMs || 0) / 1000).toFixed(2)}s)
                  </Badge>
                </div>

                <div className="grid gap-2 sm:grid-cols-4 rounded-2xl bg-slate-950/40 p-3 text-xs">
                  <div>Collected: <strong className="text-white">{log.stats?.totalCollected || 0}</strong></div>
                  <div>New Inserted: <strong className="text-emerald-300">{log.stats?.newInserted || 0}</strong></div>
                  <div>Duplicates Prevented: <strong className="text-cyan-300">{log.stats?.duplicatesPrevented || 0}</strong></div>
                  <div>Auto Published: <strong className="text-purple-300">{log.stats?.autoPublished || 0}</strong></div>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-400 bg-black/30 p-3 rounded-xl">
                  {(log.logs || []).map((entry, idx) => (
                    <div key={idx} className={entry.level === "error" ? "text-rose-400" : ""}>
                      [{new Date(entry.timestamp).toLocaleTimeString()}] [{entry.level.toUpperCase()}] {entry.message}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </PageShell>
  );
};

export default AgentDashboardPage;
