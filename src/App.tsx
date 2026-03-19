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
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import WaitlistManager from "./pages/admin/WaitlistManager";
import ValidationsManager from "./pages/admin/ValidationsManager";
import ContactsManager from "./pages/admin/ContactsManager";
import WhitepaperManager from "./pages/admin/WhitepaperManager";
import ContributionsManager from "./pages/admin/ContributionsManager";
import TasksManager from "./pages/admin/TasksManager";
import AdminLayout from "./components/admin/AdminLayout";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Contribute from "./pages/dashboard/Contribute";
import Referrals from "./pages/dashboard/Referrals";
import RaidFi from "./pages/dashboard/RaidFi";
import Whitepaper from "./pages/Whitepaper";
import NotFound from "./pages/NotFound";

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
          <Route path="/whitepaper" element={<Whitepaper />} />
          {/* Redirect old contributions route */}
          <Route path="/contributions" element={<Navigate to="/dashboard" replace />} />
          {/* User dashboard */}
          <Route path="/dashboard" element={<DashboardLayout><Contribute /></DashboardLayout>} />
          <Route path="/dashboard/referrals" element={<DashboardLayout><Referrals /></DashboardLayout>} />
          <Route path="/dashboard/raidfi" element={<DashboardLayout><RaidFi /></DashboardLayout>} />
          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/waitlist" element={<AdminLayout><WaitlistManager /></AdminLayout>} />
          <Route path="/admin/tasks" element={<AdminLayout><TasksManager /></AdminLayout>} />
          <Route path="/admin/validations" element={<AdminLayout><ValidationsManager /></AdminLayout>} />
          <Route path="/admin/contacts" element={<AdminLayout><ContactsManager /></AdminLayout>} />
          <Route path="/admin/whitepaper" element={<AdminLayout><WhitepaperManager /></AdminLayout>} />
          <Route path="/admin/contributions" element={<AdminLayout><ContributionsManager /></AdminLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
