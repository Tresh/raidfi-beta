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
import Contributions from "./pages/Contributions";
import Feed from "./pages/Feed";
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
import AdminLayout from "./components/admin/AdminLayout";
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
          <Route path="/contributions" element={<Contributions />} />
          <Route path="/feed" element={<Feed />} />
          {/* Legacy redirects */}
          <Route path="/dashboard" element={<Navigate to="/contributions" replace />} />
          <Route path="/dashboard/*" element={<Navigate to="/contributions" replace />} />
          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/waitlist" element={<AdminLayout><WaitlistManager /></AdminLayout>} />
          <Route path="/admin/tasks" element={<AdminLayout><TasksManager /></AdminLayout>} />
          <Route path="/admin/contribute-tasks" element={<AdminLayout><ContributeTasksManager /></AdminLayout>} />
          <Route path="/admin/validations" element={<AdminLayout><ValidationsManager /></AdminLayout>} />
          <Route path="/admin/contacts" element={<AdminLayout><ContactsManager /></AdminLayout>} />
          <Route path="/admin/whitepaper" element={<AdminLayout><WhitepaperManager /></AdminLayout>} />
          <Route path="/admin/contributions" element={<AdminLayout><ContributionsManager /></AdminLayout>} />
          <Route path="/admin/points" element={<AdminLayout><PointsManager /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><UsersManager /></AdminLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
