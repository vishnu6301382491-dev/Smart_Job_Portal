import PageShell from "./_PageShell";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const featuredRoles = [
  {
    title: "Senior Full Stack Engineer",
    company: "Acme Cloud Technologies",
    location: "Bangalore, India",
    type: "Full-time",
    salary: "$45,000 - $65,000",
    skills: ["React", "Node.js", "MongoDB"],
    remote: true,
  },
  {
    title: "Lead Product Designer (UI/UX)",
    company: "Aster Studio Labs",
    location: "Mumbai, India",
    type: "Full-time",
    salary: "$35,000 - $50,000",
    skills: ["Figma", "Design Systems", "Prototyping"],
    remote: false,
  },
  {
    title: "Staff Analytics & AI Engineer",
    company: "Gridline Intelligence",
    location: "Hyderabad, India",
    type: "Full-time",
    salary: "$55,000 - $80,000",
    skills: ["Python", "BigQuery", "Machine Learning"],
    remote: true,
  },
];

const stats = [
  { label: "Active Jobs", value: "1,248+", icon: "💼", change: "+14% this week" },
  { label: "Applications Processed", value: "9,534+", icon: "🚀", change: "99.8% match rate" },
  { label: "Verified Employers", value: "314+", icon: "🏢", change: "50+ new this month" },
  { label: "Avg Response Time", value: "24 Hours", icon: "⚡", change: "3x faster hiring" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const HomePage = () => {
  return (
    <PageShell
      title="Find your dream job with AI-powered matching."
      description="Connect directly with verified local employers, company career portals, and remote teams through smart job intelligence."
      actions={[
        { label: "Explore Vacancies →", href: "/jobs" },
        { label: "Create Account", href: "/register", variant: "secondary" },
      ]}
    >
      <div className="space-y-12">
        {/* Animated Statistics Cards */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              data-magnetic="true"
              className="glass-card p-5 space-y-2 hover:-translate-y-1.5 transition-all duration-300 border-l-4 border-l-blue-600"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{stat.label}</span>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{stat.value}</p>
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>↑</span> {stat.change}
              </p>
            </motion.div>
          ))}
        </motion.section>

        {/* Hero Banner with Glassmorphism */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="glass-card p-8 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-cyan-500/10 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4 relative z-10">
              <Badge variant="primary" className="text-xs py-1 px-3">
                ✨ Autonomous AI Job Intelligence Platform
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
                One unified portal for discovery, automated verification, & career tracking.
              </h2>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Search verified vacancies across Bangalore, Hyderabad, Pune, Gurgaon, and global remote tracks. Set up instant email alerts, track your applications in Kanban pipelines, and get hired faster.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 relative z-10">
              <Button as={Link} to="/jobs" variant="primary" className="shine-btn" data-magnetic="true">
                Browse All Openings 🚀
              </Button>
              <Button as={Link} to="/register" variant="secondary" data-magnetic="true">
                Join as Employer
              </Button>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Designed For Everyone
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)] space-y-1 hover:border-blue-500/40 transition">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">🎯 For Job Seekers</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Build your profile, upload PDF resumes, set up city alerts, and monitor application timelines.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)] space-y-1 hover:border-purple-500/40 transition">
                <p className="text-sm font-bold text-purple-600 dark:text-purple-400">🏢 For Employers</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Publish openings, manage brand profiles, and review applicants with status transition controls.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)] space-y-1 hover:border-cyan-500/40 transition">
                <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">🤖 Autonomous AI Agent</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Background agent harvests, cleans, de-duplicates, and verifies 170+ jobs daily automatically.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Featured Roles Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Handpicked Vacancies
              </p>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">Featured Opportunities</h3>
            </div>
            <Button as={Link} to="/jobs" variant="ghost" className="text-xs">
              View All 1,200+ Roles →
            </Button>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-4 lg:grid-cols-3"
          >
            {featuredRoles.map((job) => (
              <motion.article
                key={job.title}
                variants={itemVariants}
                data-magnetic="true"
                className="glass-card p-6 flex flex-col justify-between space-y-4 hover:-translate-y-2 transition-all duration-300 border-t-2 border-t-blue-500"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{job.company}</span>
                    {job.remote ? <Badge variant="info">Remote</Badge> : <Badge variant="neutral">On-site</Badge>}
                  </div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)]">{job.title}</h4>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">💰 {job.salary}</p>
                  <p className="text-xs text-[var(--text-muted)]">📍 {job.location}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--border-color)]">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-soft)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <Button as={Link} to="/jobs" variant="secondary" className="w-full text-xs py-2">
                  View Role Details →
                </Button>
              </motion.article>
            ))}
          </motion.div>
        </section>
      </div>
    </PageShell>
  );
};

export default HomePage;
