import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Waitlist from "./pages/Waitlist";
import WaitlistConfirmed from "./pages/WaitlistConfirmed";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailVerified from "./pages/EmailVerified";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Overview from "./pages/dashboard/Overview";
import DashContributions from "./pages/dashboard/DashContributions";
import ReputationPage from "./pages/dashboard/Reputation";
import AnalyticsDash from "./pages/dashboard/Analytics";
import DashSettings from "./pages/dashboard/Settings";
import DashFeedback from "./pages/dashboard/Feedback";

import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import WaitlistManager from "./pages/admin/WaitlistManager";
import ValidationsManager from "./pages/admin/ValidationsManager";
import ContactsManager from "./pages/admin/ContactsManager";
import WhitepaperManager from "./pages/admin/WhitepaperManager";
import ContributionsManager from "./pages/admin/ContributionsManager";
import TasksManager from "./pages/admin/TasksManager";
import ContributeTasksManager from "./pages/admin/ContributeTasksManager";
import PointsManager from "./pages/admin/PointsManager";
import UsersManager from "./pages/admin/UsersManager";
import SettingsManager from "./pages/admin/SettingsManager";
import AdminLayout from "./components/admin/AdminLayout";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import BetaRequestsManager from "./pages/admin/BetaRequestsManager";
import ProjectRequestsManager from "./pages/admin/ProjectRequestsManager";
import ReportsManager from "./pages/admin/ReportsManager";
import ProjectsManager from "./pages/admin/ProjectsManager";
import ContributorsManager from "./pages/admin/ContributorsManager";
import ProjectOverview from "./pages/project/ProjectOverview";
import ProjectContributors from "./pages/project/ProjectContributors";
import ProjectActivity from "./pages/project/ProjectActivity";
import ProjectEvaluate from "./pages/project/ProjectEvaluate";
import ProjectAnalytics from "./pages/project/ProjectAnalytics";
import ProjectAIAnalyst from "./pages/project/ProjectAIAnalyst";
import ProjectSettings from "./pages/project/ProjectSettings";

import Whitepaper from "./pages/Whitepaper";
import NotFound from "./pages/NotFound";
import ProjectRequest from "./pages/ProjectRequest";
import ProjectDetail from "./pages/ProjectDetail";
import AdminProjectDetail from "./pages/admin/ProjectDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/waitlist/confirmed" element={<WaitlistConfirmed />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-verified" element={<EmailVerified />} />
          <Route path="/whitepaper" element={<Whitepaper />} />
          <Route path="/contributions" element={<Navigate to="/dashboard/contributions" replace />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/explore" element={<Feed />} />
          <Route path="/project-request" element={<ProjectRequest />} />
          <Route path="/u/:code" element={<Profile />} />
          <Route path="/p/:slug" element={<ProjectDetail />} />
          {/* Contributor dashboard (MVP) */}
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/dashboard/contributions" element={<DashContributions />} />
          <Route path="/dashboard/reputation" element={<ReputationPage />} />
          <Route path="/dashboard/analytics" element={<AnalyticsDash />} />
          <Route path="/dashboard/settings" element={<DashSettings />} />
          <Route path="/dashboard/feedback" element={<DashFeedback />} />

          {/* Project workspace */}
          <Route path="/project" element={<ProjectOverview />} />
          <Route path="/project/contributors" element={<ProjectContributors />} />
          <Route path="/project/activity" element={<ProjectActivity />} />
          <Route path="/project/evaluate" element={<ProjectEvaluate />} />
          <Route path="/project/analytics" element={<ProjectAnalytics />} />
          <Route path="/project/ai" element={<ProjectAIAnalyst />} />
          <Route path="/project/settings" element={<ProjectSettings />} />

          {/* Admin */}

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout requiredPermission="dashboard"><Dashboard /></AdminLayout>} />
          <Route path="/admin/waitlist" element={<AdminLayout requiredPermission="waitlist"><WaitlistManager /></AdminLayout>} />
          <Route path="/admin/tasks" element={<AdminLayout requiredPermission="tasks"><TasksManager /></AdminLayout>} />
          <Route path="/admin/contribute-tasks" element={<AdminLayout requiredPermission="contribute-tasks"><ContributeTasksManager /></AdminLayout>} />
          <Route path="/admin/validations" element={<AdminLayout requiredPermission="validations"><ValidationsManager /></AdminLayout>} />
          <Route path="/admin/contacts" element={<AdminLayout requiredPermission="contacts"><ContactsManager /></AdminLayout>} />
          <Route path="/admin/whitepaper" element={<AdminLayout requiredPermission="whitepaper"><WhitepaperManager /></AdminLayout>} />
          <Route path="/admin/contributions" element={<AdminLayout requiredPermission="contributions"><ContributionsManager /></AdminLayout>} />
          <Route path="/admin/points" element={<AdminLayout requiredPermission="points"><PointsManager /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout requiredPermission="users"><UsersManager /></AdminLayout>} />
          <Route path="/admin/analytics" element={<AdminLayout requiredPermission="dashboard"><AnalyticsPage /></AdminLayout>} />
          <Route path="/admin/settings" element={<AdminLayout requiredPermission="settings"><SettingsManager /></AdminLayout>} />
          <Route path="/admin/beta" element={<AdminLayout requiredPermission="beta"><BetaRequestsManager /></AdminLayout>} />
          <Route path="/admin/projects" element={<AdminLayout requiredPermission="projects"><ProjectRequestsManager /></AdminLayout>} />
          <Route path="/admin/manage-projects" element={<AdminLayout requiredPermission="manage-projects"><ProjectsManager /></AdminLayout>} />
          <Route path="/admin/manage-projects/:id" element={<AdminLayout requiredPermission="manage-projects"><AdminProjectDetail /></AdminLayout>} />
          <Route path="/admin/contributors" element={<AdminLayout requiredPermission="contributors"><ContributorsManager /></AdminLayout>} />
          <Route path="/admin/reports" element={<AdminLayout requiredPermission="reports"><ReportsManager /></AdminLayout>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
