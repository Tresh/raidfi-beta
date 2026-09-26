import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";

// Route Code Splitting: Lazy load page components to minimize initial JS bundle size
const Index = lazy(() => import("./pages/Index"));
const BetaRequest = lazy(() => import("./pages/BetaRequest"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
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
const WaitlistManager = lazy(() => import("./pages/admin/WaitlistManager"));
const ValidationsManager = lazy(() => import("./pages/admin/ValidationsManager"));
const ContactsManager = lazy(() => import("./pages/admin/ContactsManager"));
const WhitepaperManager = lazy(() => import("./pages/admin/WhitepaperManager"));
const ContributionsManager = lazy(() => import("./pages/admin/ContributionsManager"));
const TasksManager = lazy(() => import("./pages/admin/TasksManager"));
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
const NotFound = lazy(() => import("./pages/NotFound"));
const ProjectRequest = lazy(() => import("./pages/ProjectRequest"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const AdminProjectDetail = lazy(() => import("./pages/admin/ProjectDetail"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    
  </QueryClientProvider>
);

export default App;
