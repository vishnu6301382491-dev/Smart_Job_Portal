import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PageShell = ({ title, description, actions = [], children }) => {
  return (
    <div className="page-shell space-y-8 relative">
      {/* Background SVG Wave Accent */}
      <div className="absolute -top-12 left-0 right-0 h-40 pointer-events-none opacity-25 overflow-hidden z-0">
        <svg className="w-full h-full animated-wave" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,192L48,176C96,160,192,128,288,138.7C384,149,480,203,576,213.3C672,224,768,192,864,165.3C960,139,1056,117,1152,128C1248,139,1344,181,1392,202.7L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            fill="url(#waveGradient)"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-4xl relative z-10 space-y-3"
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
            Smart Job Portal
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-5xl leading-tight">
          {title}
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          {description}
        </p>

        {actions.length > 0 ? (
          <div className="pt-2 flex flex-wrap gap-3">
            {actions.map((action) =>
              action.href ? (
                action.href.startsWith("#") || /^https?:\/\//i.test(action.href) ? (
                  <Button
                    key={action.label}
                    as="a"
                    href={action.href}
                    target={/^https?:\/\//i.test(action.href) ? "_blank" : undefined}
                    rel={/^https?:\/\//i.test(action.href) ? "noreferrer" : undefined}
                    variant={action.variant || "primary"}
                    className="shine-btn"
                  >
                    {action.label}
                  </Button>
                ) : (
                  <Button key={action.label} as={Link} to={action.href} variant={action.variant || "primary"} className="shine-btn">
                    {action.label}
                  </Button>
                )
              ) : (
                <Button key={action.label} type="button" variant={action.variant || "primary"} onClick={action.onClick} className="shine-btn">
                  {action.label}
                </Button>
              )
            )}
          </div>
        ) : null}
      </motion.section>

      {/* Main Content Area */}
      <Card className="relative z-10">{children}</Card>
    </div>
  );
};

export default PageShell;
