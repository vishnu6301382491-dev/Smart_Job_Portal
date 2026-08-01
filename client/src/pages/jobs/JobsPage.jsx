import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import PageShell from "../_PageShell";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
import { jobService } from "../../services/jobService";
import { getErrorMessage } from "../../services/error";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { JobAlertModal } from "../../components/jobs/JobAlertModal";

const STORAGE_LOC_KEY = "smart_job_user_location";

const createDefaultFilters = () => ({
  q: "",
  location: "",
  skill: "",
  jobType: "all",
  remote: false,
  sort: "latest",
});

const normalizeSkill = (skill) => String(skill || "").trim();

const uniqueSkills = (skills = []) => {
  const seen = new Set();
  return skills.map(normalizeSkill).filter(Boolean).filter((skill) => {
    const key = skill.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const formatSalary = (job) => {
  if (!job.salaryMin && !job.salaryMax) {
    return "Competitive";
  }
  const currency = job.currency || "INR";
  if (job.salaryMin && job.salaryMax) {
    return `${currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
  }
  return `${currency} ${(job.salaryMin || job.salaryMax).toLocaleString()}`;
};

const getCompanyInitials = (name = "Company") => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const JobsPage = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState(createDefaultFilters);
  const [jobs, setJobs] = useState([]);
  const [searchSummary, setSearchSummary] = useState("");
  const [searchedVariants, setSearchedVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [detectedLocationName, setDetectedLocationName] = useState("");
  const [error, setError] = useState("");
  const [savingJobId, setSavingJobId] = useState("");
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [editingLocModal, setEditingLocModal] = useState(false);

  const updateFilter = useCallback((key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(createDefaultFilters());
  }, []);

  // Automatic Location Detection Flow (HTML5 GPS -> IP Fallback -> Stored Cache)
  const detectUserLocationAuto = useCallback(async (isManualTrigger = false) => {
    setDetectingLoc(true);
    let toastId;
    if (isManualTrigger) {
      toastId = toast.loading("Detecting your location...");
    }

    const saveLocAndApply = (locName) => {
      setDetectedLocationName(locName);
      updateFilter("location", locName);
      localStorage.setItem(STORAGE_LOC_KEY, JSON.stringify({ name: locName, timestamp: Date.now() }));
      if (toastId) {
        toast.success(`Location set to ${locName}`, { id: toastId });
      }
    };

    const tryIpLocationFallback = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/").catch(() => null);
        if (res && res.ok) {
          const ipData = await res.json();
          const ipCity = ipData.city || ipData.region || "Hyderabad";
          saveLocAndApply(ipCity);
          return;
        }
      } catch {
        // Ignore fallback errors
      }
      saveLocAndApply("Hyderabad");
    };

    if (!navigator.geolocation) {
      await tryIpLocationFallback();
      setDetectingLoc(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          const data = await res.json();
          const city = data.city || data.locality || data.principalSubdivision || "Hyderabad";
          saveLocAndApply(city);
        } catch {
          await tryIpLocationFallback();
        } finally {
          setDetectingLoc(false);
        }
      },
      async () => {
        // Geolocation denied or timed out: fall back smoothly to IP Geolocation
        await tryIpLocationFallback();
        setDetectingLoc(false);
      },
      { timeout: 6000 }
    );
  }, [updateFilter]);

  // Initial Auto Detection on Mount
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_LOC_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.name) {
          setDetectedLocationName(parsed.name);
          updateFilter("location", parsed.name);
          return;
        }
      } catch {
        // Ignore parse error
      }
    }

    detectUserLocationAuto(false);
  }, [detectUserLocationAuto, updateFilter]);

  const savedJobIds = useMemo(
    () => new Set(Array.isArray(user?.savedJobs) ? user.savedJobs : []),
    [user?.savedJobs]
  );

  const handleToggleSavedJob = useCallback(
    async (job) => {
      if (!isAuthenticated) {
        navigate("/login", { state: { from: location } });
        return;
      }

      setSavingJobId(job._id);

      try {
        const isSaved = savedJobIds.has(job._id);
        const { data } = isSaved
          ? await userService.removeSavedJob(job._id)
          : await userService.saveJob(job._id);

        if (data.user) {
          updateUser(data.user);
        }
        toast.success(isSaved ? "Job removed from saved items" : "Job saved successfully! ⭐");
      } catch (err) {
        toast.error(getErrorMessage(err, "Unable to update saved jobs"));
      } finally {
        setSavingJobId("");
      }
    },
    [isAuthenticated, location, navigate, savedJobIds, updateUser]
  );

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {};
        if (filters.q) params.q = filters.q;
        if (filters.location) params.location = filters.location;
        if (filters.skill) params.skill = filters.skill;
        if (filters.jobType !== "all") params.jobType = filters.jobType;
        if (filters.remote) params.remote = "true";

        const { data } = await jobService.list(params);

        if (cancelled) return;

        const sortedJobs = [...(data.jobs || [])].sort((a, b) => {
          if (filters.sort === "salary") {
            const aSalary = Number(a.salaryMax || a.salaryMin || 0);
            const bSalary = Number(b.salaryMax || b.salaryMin || 0);
            return bSalary - aSalary;
          }
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        setJobs(sortedJobs);
        setSearchSummary(data.searchSummary || "");
        setSearchedVariants(data.searchedVariants || []);
      } catch (err) {
        if (!cancelled) {
          setJobs([]);
          setError(getErrorMessage(err, "Unable to load jobs"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timeout = setTimeout(loadJobs, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [filters.q, filters.location, filters.skill, filters.jobType, filters.remote, filters.sort]);

  const selectedSkill = normalizeSkill(filters.skill);
  const profileSkills = useMemo(
    () => uniqueSkills(Array.isArray(user?.skills) ? user.skills : []),
    [user?.skills]
  );

  const quickSkills = useMemo(() => {
    const popularSkills = uniqueSkills(
      jobs.flatMap((job) => (Array.isArray(job.skills) ? job.skills : []))
    ).filter(
      (skill) => !profileSkills.some((ownedSkill) => ownedSkill.toLowerCase() === skill.toLowerCase())
    );
    return uniqueSkills([...profileSkills, ...popularSkills]).slice(0, 8);
  }, [jobs, profileSkills]);

  const activeFilters = useMemo(() => {
    return [
      filters.q ? { label: `Keyword: ${filters.q}`, onClear: () => updateFilter("q", "") } : null,
      filters.location ? { label: `Location: ${filters.location}`, onClear: () => updateFilter("location", "") } : null,
      selectedSkill ? { label: `Skill: ${selectedSkill}`, onClear: () => updateFilter("skill", "") } : null,
      filters.jobType !== "all" ? { label: `Type: ${filters.jobType}`, onClear: () => updateFilter("jobType", "all") } : null,
      filters.remote ? { label: "Remote only", onClear: () => updateFilter("remote", false) } : null,
    ].filter(Boolean);
  }, [filters, selectedSkill, updateFilter]);

  return (
    <PageShell
      title="Discover Opportunities"
      description="Explore curated openings across tech hubs, local businesses, and remote tracks."
      actions={[]}
    >
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        {/* Sidebar Filters */}
        <aside className="glass-card p-5 space-y-5 h-fit sticky top-24">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">Search Filters</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Refine target roles</p>
            </div>
            <Button
              type="button"
              variant="accent"
              onClick={() => setAlertModalOpen(true)}
              className="text-xs px-2.5 py-1.5"
            >
              🔔 Create Alert
            </Button>
          </div>

          <Input
            type="search"
            label="Keyword / Job Title"
            icon="🔍"
            placeholder="React, Engineer, Manager..."
            value={filters.q}
            onChange={(event) => updateFilter("q", event.target.value)}
          />

          <div className="space-y-2">
            <Input
              type="text"
              label="Location / City"
              icon="📍"
              placeholder="Hyderabad, Bengaluru, Pune..."
              value={filters.location}
              onChange={(event) => updateFilter("location", event.target.value)}
            />
            <button
              type="button"
              onClick={() => detectUserLocationAuto(true)}
              disabled={detectingLoc}
              className="w-full text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1.5 py-1 transition"
            >
              {detectingLoc ? "Detecting GPS/IP..." : "📍 Re-detect Location"}
            </button>
          </div>

          <Input
            type="text"
            label="Skill"
            icon="⚡"
            placeholder="Node.js, Python, Figma..."
            value={filters.skill}
            onChange={(event) => updateFilter("skill", event.target.value)}
          />

          {/* Quick Skill Tags */}
          <div className="space-y-2 pt-1 border-t border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Trending Skills
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {quickSkills.map((skill) => {
                const isSelected = selectedSkill.toLowerCase() === skill.toLowerCase();
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => updateFilter("skill", isSelected ? "" : skill)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                        : "bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:bg-blue-500/10 hover:text-blue-600 border border-[var(--border-color)]"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <Select
            value={filters.jobType}
            label="Job Type"
            icon="⌛"
            onChange={(event) => updateFilter("jobType", event.target.value)}
          >
            <option value="all">All Job Types</option>
            <option value="full-time">Full-time</option>
            <option value="contract">Contract</option>
            <option value="part-time">Part-time</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
          </Select>

          <Select
            value={filters.sort}
            label="Sort By"
            icon="🔃"
            onChange={(event) => updateFilter("sort", event.target.value)}
          >
            <option value="latest">Latest Posted</option>
            <option value="salary">Highest Salary</option>
          </Select>

          <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs font-medium text-[var(--text-primary)] cursor-pointer">
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={(event) => updateFilter("remote", event.target.checked)}
              className="h-4 w-4 rounded border-slate-400 bg-transparent text-blue-600 focus:ring-blue-500"
            />
            🌐 Remote Jobs Only
          </label>

          <Button type="button" variant="secondary" className="w-full text-xs" onClick={resetFilters}>
            Reset Filters
          </Button>
        </aside>

        {/* Main Job Listings Stream */}
        <div className="space-y-5">
          {/* Top Location Status Card */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Open Vacancies</h2>
                  {detectedLocationName ? (
                    <span className="rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-semibold border border-blue-500/30">
                      📍 Current Location: {detectedLocationName}
                    </span>
                  ) : null}
                </div>

                {searchSummary ? (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                    {searchSummary}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="primary">{jobs.length} Roles Available</Badge>
                <Badge variant="success">{savedJobIds.size} Saved</Badge>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--border-color)]">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={filter.onClear}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-700 dark:text-blue-300 transition hover:bg-rose-500/10 hover:text-rose-600"
                  >
                    {filter.label}
                    <span className="font-bold text-xs">✕</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Job Card Feed */}
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error ? (
            <div className="glass-card p-6 border-rose-500/30 bg-rose-500/10 text-sm text-rose-500">
              {error}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => {
                const companyName = job.employer?.companyName || "Independent Employer";
                const isSaved = savedJobIds.has(job._id);

                return (
                  <article
                    key={job._id}
                    className="glass-card p-5 sm:p-6 transition-all duration-300 hover:border-blue-500/40 hover:-translate-y-1 space-y-4 group"
                  >
                    {/* Top Row: Company Logo Avatar, Title, Actions */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        {/* Company Logo or Initials Avatar */}
                        {job.employer?.logoUrl ? (
                          <img
                            src={job.employer.logoUrl}
                            alt={companyName}
                            className="h-12 w-12 rounded-2xl object-cover border border-[var(--border-color)] shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                            {getCompanyInitials(companyName)}
                          </div>
                        )}

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/jobs/${job._id}`}
                              className="text-lg font-bold text-[var(--text-primary)] hover:text-blue-600 transition group-hover:text-blue-600"
                            >
                              {job.title}
                            </Link>
                            {job.external ? <Badge variant="purple">{job.sourceName || "External"}</Badge> : null}
                            {job.remote ? <Badge variant="info">Remote</Badge> : null}
                          </div>
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                            {companyName}
                          </p>
                        </div>
                      </div>

                      {/* Bookmark Icon Button */}
                      <button
                        type="button"
                        onClick={() => void handleToggleSavedJob(job)}
                        disabled={savingJobId === job._id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isSaved
                            ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                            : "bg-[var(--surface-soft)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-amber-500 hover:border-amber-500/30"
                        }`}
                        title={isSaved ? "Remove bookmark" : "Bookmark job"}
                      >
                        {isSaved ? "★" : "☆"}
                      </button>
                    </div>

                    {/* Middle Row: Salary, Location, Experience, Skills */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          💰 {formatSalary(job)}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium">
                          📍 {job.location}
                        </span>
                        {job.experienceLevel ? (
                          <span className="inline-flex items-center gap-1 capitalize font-medium">
                            🎯 {job.experienceLevel} Level
                          </span>
                        ) : null}
                      </div>

                      <span className="text-[11px] text-[var(--text-muted)]">
                        Posted {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Skills Chips */}
                    {Array.isArray(job.skills) && job.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg bg-[var(--surface-soft)] border border-[var(--border-color)] px-2.5 py-0.5 text-xs text-[var(--text-secondary)] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Bottom Action Footer */}
                    <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3.5">
                      <Badge variant="neutral">{job.jobType}</Badge>

                      <div className="flex items-center gap-2">
                        <Button as={Link} to={`/jobs/${job._id}`} variant="secondary" className="text-xs px-3 py-1.5">
                          View Details
                        </Button>
                        {job.external ? (
                          <Button as="a" href={job.sourceUrl} target="_blank" rel="noreferrer" variant="primary" className="text-xs px-3 py-1.5">
                            Apply Source ↗
                          </Button>
                        ) : (
                          <Button as={Link} to={`/jobs/${job._id}#apply`} variant="primary" className="text-xs px-3 py-1.5">
                            Quick Apply →
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-10 text-center space-y-3">
              <span className="text-4xl">🔍</span>
              <p className="text-base font-bold text-[var(--text-primary)]">No Vacancies Matched</p>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                Try resetting your search filters or setting up a Job Alert to be notified when matching roles open up.
              </p>
              <Button type="button" variant="secondary" onClick={resetFilters} className="text-xs mt-2">
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <JobAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        initialCity={filters.location || detectedLocationName}
      />
    </PageShell>
  );
};

export default JobsPage;
