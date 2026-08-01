import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import PageShell from "../_PageShell";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Loader } from "../../components/ui/Loader";
import { userService } from "../../services/userService";
import { getErrorMessage } from "../../services/error";
import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    title: "",
    location: "",
    phone: "",
    skills: "",
    bio: "",
    notificationPrefs: {
      savedJobUpdates: true,
      matchedJobs: true,
      emailDigests: false,
      digestFrequency: "daily",
    },
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data } = await userService.me();
        if (cancelled) return;

        const profile = data.user;
        setCurrentUser(profile);
        setForm({
          name: profile.name || "",
          title: profile.title || "",
          location: profile.location || "",
          phone: profile.phone || "",
          skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
          bio: profile.bio || "",
          notificationPrefs: {
            savedJobUpdates: profile.notificationPrefs?.savedJobUpdates ?? true,
            matchedJobs: profile.notificationPrefs?.matchedJobs ?? true,
            emailDigests: profile.notificationPrefs?.emailDigests ?? false,
            digestFrequency: profile.notificationPrefs?.digestFrequency || "daily",
          },
        });
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err, "Unable to load your profile"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving profile updates...");

    try {
      const { data } = await userService.updateProfile(form);
      setCurrentUser(data.user);
      updateUser(data.user);
      toast.success("Profile updated successfully! ✨", { id: toastId });
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to update profile"), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (event) => {
    event.preventDefault();
    if (!resumeFile) {
      toast.error("Please select a PDF resume file first.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading resume PDF...");

    try {
      const { data } = await userService.uploadResume(resumeFile);
      setCurrentUser(data.user);
      updateUser(data.user);
      setResumeFile(null);
      toast.success("Resume uploaded successfully! 📄", { id: toastId });
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to upload resume"), { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const updateNotificationPref = (key, value) => {
    setForm((current) => ({
      ...current,
      notificationPrefs: {
        ...current.notificationPrefs,
        [key]: value,
      },
    }));
  };

  return (
    <PageShell
      title="My Profile & Settings"
      description="Update your candidate profile details, target skills, resume PDF, and alert preferences."
      actions={[]}
    >
      {loading ? (
        <Loader label="Loading your profile details..." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          {/* Profile Card Summary */}
          <Card className="space-y-6">
            <div className="flex items-center gap-4 border-b border-[var(--border-color)] pb-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                {currentUser?.name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <Badge variant="primary">Candidate Profile</Badge>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mt-1">
                  {currentUser?.name || user?.name || "Your Name"}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{currentUser?.title || "Add professional title"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)] space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Location</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">📍 {currentUser?.location || "Not specified"}</p>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)] space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Resume Document</p>
                  {currentUser?.resumeUrl ? <Badge variant="success">Uploaded ✓</Badge> : <Badge variant="warning">Missing</Badge>}
                </div>
                <p className="text-sm font-bold text-[var(--text-primary)]">{currentUser?.resumeName || "No PDF uploaded yet"}</p>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)] space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Professional Bio</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{currentUser?.bio || "Add a short summary to describe your experience."}</p>
              </div>
            </div>
          </Card>

          {/* Edit Forms */}
          <div className="space-y-6">
            <form className="grid gap-4 sm:grid-cols-2 glass-card p-6" onSubmit={handleSubmit}>
              <div className="sm:col-span-2 border-b border-[var(--border-color)] pb-3">
                <h4 className="text-base font-bold text-[var(--text-primary)]">Edit Profile Information</h4>
                <p className="text-xs text-[var(--text-muted)]">Manage your basic candidate information.</p>
              </div>

              <Input
                label="Full Name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <Input
                label="Professional Title"
                placeholder="Frontend Developer"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
              <Input
                label="Location"
                placeholder="Bangalore, India"
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
              />
              <Input
                label="Phone Number"
                placeholder="+91 90000 00000"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
              <Input
                className="sm:col-span-2"
                label="Skills (Comma Separated)"
                placeholder="React, Node.js, MongoDB, SQL"
                value={form.skills}
                onChange={(event) => setForm({ ...form, skills: event.target.value })}
              />
              <Textarea
                className="sm:col-span-2"
                label="Professional Bio"
                placeholder="A short summary of your technical experience..."
                value={form.bio}
                onChange={(event) => setForm({ ...form, bio: event.target.value })}
              />
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="primary" loading={saving}>
                  Save Profile Changes
                </Button>
              </div>
            </form>

            {/* Resume File Upload */}
            <form className="glass-card p-6 space-y-4" onSubmit={handleResumeUpload}>
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">Resume Upload (PDF)</h4>
                  <p className="text-xs text-[var(--text-muted)]">Upload your latest PDF resume for quick application submission.</p>
                </div>
                {currentUser?.resumeUrl ? <Badge variant="success">Ready</Badge> : <Badge variant="warning">Missing</Badge>}
              </div>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Select PDF Document</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                  className="block w-full rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--surface-soft)] p-3 text-xs text-[var(--text-primary)] file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                />
              </label>

              <div className="flex justify-end">
                <Button type="submit" variant="secondary" loading={uploading}>
                  Upload Resume PDF 📄
                </Button>
              </div>
            </form>

            {/* Notification Preferences Form */}
            <form className="glass-card p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">Notification Preferences</h4>
                  <p className="text-xs text-[var(--text-muted)]">Choose which updates trigger email & in-app alerts.</p>
                </div>
                <Badge variant="info">{form.notificationPrefs.emailDigests ? "Digest Active" : "Digests Off"}</Badge>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-soft)] p-3.5 text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notificationPrefs.savedJobUpdates}
                    onChange={(event) => updateNotificationPref("savedJobUpdates", event.target.checked)}
                    className="h-4 w-4 rounded border-slate-400 bg-transparent text-blue-600"
                  />
                  Saved Job Updates & Deadline Reminders
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-soft)] p-3.5 text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notificationPrefs.matchedJobs}
                    onChange={(event) => updateNotificationPref("matchedJobs", event.target.checked)}
                    className="h-4 w-4 rounded border-slate-400 bg-transparent text-blue-600"
                  />
                  New Matching Vacancies Discovered
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-soft)] p-3.5 text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notificationPrefs.emailDigests}
                    onChange={(event) => updateNotificationPref("emailDigests", event.target.checked)}
                    className="h-4 w-4 rounded border-slate-400 bg-transparent text-blue-600"
                  />
                  Receive Email Summary Digests
                </label>

                <Select
                  label="Digest Summary Frequency"
                  value={form.notificationPrefs.digestFrequency}
                  onChange={(event) => updateNotificationPref("digestFrequency", event.target.value)}
                  disabled={!form.notificationPrefs.emailDigests}
                >
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Digest</option>
                </Select>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="secondary" loading={saving}>
                  Save Alert Settings
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default ProfilePage;
