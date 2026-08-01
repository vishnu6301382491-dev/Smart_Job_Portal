import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { AuthLayout } from "../components/layout/AuthLayout";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { Loader } from "../components/ui/Loader";

const HomePage = lazy(() => import("../pages/HomePage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const JobsPage = lazy(() => import("../pages/jobs/JobsPage"));
const JobDetailsPage = lazy(() => import("../pages/jobs/JobDetailsPage"));
const SavedJobsPage = lazy(() => import("../pages/jobs/SavedJobsPage"));
const NotificationsPage = lazy(() => import("../pages/notifications/NotificationsPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const AppliedJobsPage = lazy(() => import("../pages/applications/AppliedJobsPage"));
const JobTrackerPage = lazy(() => import("../pages/tracker/JobTrackerPage"));
const EmployerDashboardPage = lazy(() => import("../pages/employer/EmployerDashboardPage"));
const PostJobPage = lazy(() => import("../pages/employer/PostJobPage"));
const EditJobPage = lazy(() => import("../pages/employer/EditJobPage"));
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const AgentDashboardPage = lazy(() => import("../pages/admin/AgentDashboardPage"));
const UsersPage = lazy(() => import("../pages/admin/UsersPage"));
const JobsManagementPage = lazy(() => import("../pages/admin/JobsManagementPage"));
const EmployersPage = lazy(() => import("../pages/admin/EmployersPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

const PageFallback = () => (
  <div className="flex h-64 items-center justify-center">
    <Loader label="Loading view..." />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/applications" element={<AppliedJobsPage />} />
              <Route path="/tracker" element={<JobTrackerPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/saved-jobs" element={<SavedJobsPage />} />

              <Route element={<RoleRoute allowedRoles={["employer", "admin"]} />}>
                <Route path="/employer" element={<EmployerDashboardPage />} />
                <Route path="/employer/jobs/new" element={<PostJobPage />} />
                <Route path="/employer/jobs/:id/edit" element={<EditJobPage />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/agent" element={<AgentDashboardPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/jobs" element={<JobsManagementPage />} />
                <Route path="/admin/employers" element={<EmployersPage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
