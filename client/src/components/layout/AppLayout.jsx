import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

export const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-400 overflow-hidden">
      {/* Cyber Grid Pattern */}
      <div className="cyber-grid" aria-hidden="true" />

      {/* Noise Texture Overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* Dark Mode Aurora Beams */}
      <div className="aurora-bg hidden dark:block" aria-hidden="true">
        <div className="aurora-beam aurora-1" />
        <div className="aurora-beam aurora-2" />
        <div className="aurora-beam aurora-3" />
      </div>

      {/* Floating Multi-Color Orbs */}
      <div className="orb-container" aria-hidden="true">
        <div className="orb orb-blue h-[500px] w-[500px] -top-24 -left-20 opacity-75" />
        <div className="orb orb-purple h-[550px] w-[550px] top-[20%] -right-28 opacity-65" style={{ animationDelay: "-5s" }} />
        <div className="orb orb-cyan h-[450px] w-[450px] bottom-[20%] left-[15%] opacity-60" style={{ animationDelay: "-10s" }} />
        <div className="orb orb-rose h-[400px] w-[400px] -bottom-24 right-[10%] opacity-45" style={{ animationDelay: "-15s" }} />
      </div>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "var(--surface-strong)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: "1rem",
            boxShadow: "0 15px 35px -5px rgba(0, 0, 0, 0.25)",
            fontSize: "0.875rem",
            padding: "0.75rem 1.25rem",
            backdropFilter: "blur(20px)",
          },
        }}
      />

      <SiteHeader />

      <main className="pb-24 pt-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.99 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
