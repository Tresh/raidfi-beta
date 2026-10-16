import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";

// Route Code Splitting: Lazy load page components to minimize initial JS bundle size
const Index = lazy(() => import("./pages/Index"));
const BetaRequest = lazy(() => import("./pages/BetaRequest"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const EmailVerified = lazy(() => import("./pages/EmailVerified"));
const Feed = lazy(() => import("./pages/Feed"));
const Profile = lazy(() => import("./pages/Profile"));
const Overview = lazy(() => import("./pages/dashboard/Overview"));
const DashContributions = lazy(() => import("./pages/dashboard/DashContributions"));
const ReputationPage = lazy(() => import("./pages/dashboard/Reputation"));
const AnalyticsDash = lazy(() => import("./pages/dashboard/Analytics"));
const DashReferrals = lazy(() => import("./pages/dashboard/Referrals"));
const DashSettings = lazy(() => import("./pages/dashboard/Settings"));
const DashFeedback = lazy(() => import("./pages/dashboard/Feedback"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ContactsManager = lazy(() => import("./pages/admin/ContactsManager"));
const WhitepaperManager = lazy(() => import("./pages/admin/WhitepaperManager"));
const ContributionsManager = lazy(() => import("./pages/admin/ContributionsManager"));
const ContributeTasksManager = lazy(() => import("./pages/admin/ContributeTasksManager"));
const PointsManager = lazy(() => import("./pages/admin/PointsManager"));
const UsersManager = lazy(() => import("./pages/admin/UsersManager"));
const SettingsManager = lazy(() => import("./pages/admin/SettingsManager"));
const AnalyticsPage = lazy(() => import("./pages/admin/AnalyticsPage"));
const BetaRequestsManager = lazy(() => import("./pages/admin/BetaRequestsManager"));
const ProjectRequestsManager = lazy(() => import("./pages/admin/ProjectRequestsManager"));
const ReportsManager = lazy(() => import("./pages/admin/ReportsManager"));
const ProjectsManager = lazy(() => import("./pages/admin/ProjectsManager"));
const ContributorsManager = lazy(() => import("./pages/admin/ContributorsManager"));

const ProjectOverview = lazy(() => import("./pages/project/ProjectOverview"));
const ProjectContributors = lazy(() => import("./pages/project/ProjectContributors"));
const ProjectActivity = lazy(() => import("./pages/project/ProjectActivity"));
const ProjectEvaluate = lazy(() => import("./pages/project/ProjectEvaluate"));
const ProjectAnalytics = lazy(() => import("./pages/project/ProjectAnalytics"));
const ProjectAIAnalyst = lazy(() => import("./pages/project/ProjectAIAnalyst"));
const ProjectSettings = lazy(() => import("./pages/project/ProjectSettings"));

const Whitepaper = lazy(() => import("./pages/Whitepaper"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProjectRequest = lazy(() => import("./pages/ProjectRequest"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const AdminProjectDetail = lazy(() => import("./pages/admin/ProjectDetail"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
    <div className="flex items-center gap-2">
      <img src="/logo.png" alt="RaidFi" className="w-8 h-8" />
      <span className="text-xl font-bold text-gradient tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        RaidFi
      </span>
    </div>
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    <p className="text-xs text-muted-foreground tracking-wide font-medium">Launching soon</p>
  </div>
);

const BetaAccessRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/signup${location.search}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/beta" element={<BetaRequest />} />
            <Route path="/waitlist" element={<Navigate to="/beta" replace />} />
            <Route path="/waitlist/confirmed" element={<Navigate to="/beta" replace />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/beta-access" element={<BetaAccessRedirect />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="/whitepaper" element={<Whitepaper />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
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
            <Route path="/dashboard/referrals" element={<DashReferrals />} />
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
            <Route path="/admin/contribute-tasks" element={<AdminLayout requiredPermission="contribute-tasks"><ContributeTasksManager /></AdminLayout>} />
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
