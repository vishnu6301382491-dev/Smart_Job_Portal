import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { alertService } from "../../services/alertService";
import { getErrorMessage } from "../../services/error";

export const JobAlertModal = ({ isOpen, onClose, initialCity = "" }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "Daily Job Alert",
    city: initialCity,
    category: "",
    skills: "",
    experienceLevel: "all",
    frequency: "instant",
  });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({ ...prev, city: initialCity || prev.city }));
      setStep(1);
      setCreated(false);
    }
  }, [isOpen, initialCity]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const toastId = toast.loading("Creating job alert subscription...");

    try {
      await alertService.create(form);
      toast.success("Job alert created! You will receive notifications for matching jobs.", { id: toastId });
      setCreated(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to create job alert");
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-3xl border border-[var(--border-color)] bg-[var(--surface-strong)] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl transition-all">
        {/* Top Gradient Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              🔔 Smart Intelligence Alert
            </span>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mt-2">
              {created ? "Alert Activated!" : "Set Up Daily Job Notifications"}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Receive automatic alerts when verified jobs match your target city & skills.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition p-1 text-lg rounded-lg hover:bg-[var(--surface-soft)]"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {created ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-3xl font-bold border border-emerald-500/30">
              ✓
            </div>
            <div>
              <p className="text-base font-semibold text-[var(--text-primary)]">Subscription Active</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                We'll monitor incoming vacancies and send instant updates to your inbox.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step Wizard Bar */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    step === 1
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {step > 1 ? "✓" : "1"}
                </span>
                <span className="text-xs font-semibold text-[var(--text-primary)]">Target Role & Location</span>
              </div>

              <div className="h-0.5 w-8 bg-[var(--border-color)]" />

              <div className="flex items-center gap-2">
                <span
                  className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    step === 2
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border-color)]"
                  }`}
                >
                  2
                </span>
                <span className="text-xs font-semibold text-[var(--text-muted)]">Preferences & Frequency</span>
              </div>
            </div>

            {/* Step 1 Fields */}
            {step === 1 ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <Input
                  label="Alert Name"
                  icon="🏷️"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Bangalore React Developer Alerts"
                  required
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="City / Location"
                    icon="📍"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Bangalore, Hyderabad, Remote..."
                  />
                  <Input
                    label="Category"
                    icon="💼"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Software, Healthcare, Retail..."
                  />
                </div>
              </div>
            ) : null}

            {/* Step 2 Fields */}
            {step === 2 ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <Input
                  label="Required Skills (Comma separated)"
                  icon="⚡"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="e.g. React, Node.js, SQL"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <Select
                    label="Experience Level"
                    icon="🎯"
                    value={form.experienceLevel}
                    onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                  >
                    <option value="all">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead / Principal</option>
                  </Select>

                  <Select
                    label="Alert Frequency"
                    icon="⏱️"
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  >
                    <option value="instant">Instant Notifications</option>
                    <option value="daily">Daily Summary</option>
                    <option value="weekly">Weekly Digest</option>
                  </Select>
                </div>
              </div>
            ) : null}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
              {step === 2 ? (
                <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                  ← Back
                </Button>
              ) : (
                <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
              )}

              {step === 1 ? (
                <Button type="button" variant="primary" onClick={() => setStep(2)}>
                  Next Step →
                </Button>
              ) : (
                <Button type="submit" variant="primary" loading={loading}>
                  Activate Alert 🔔
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
