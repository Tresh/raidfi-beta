import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Waitlist from "./pages/Waitlist";
import WaitlistConfirmed from "./pages/WaitlistConfirmed";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import WaitlistManager from "./pages/admin/WaitlistManager";
import ValidationsManager from "./pages/admin/ValidationsManager";
import ContactsManager from "./pages/admin/ContactsManager";
import WhitepaperManager from "./pages/admin/WhitepaperManager";
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
          <Route path="/whitepaper" element={<Whitepaper />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/waitlist" element={<AdminLayout><WaitlistManager /></AdminLayout>} />
          <Route path="/admin/validations" element={<AdminLayout><ValidationsManager /></AdminLayout>} />
          <Route path="/admin/contacts" element={<AdminLayout><ContactsManager /></AdminLayout>} />
          <Route path="/admin/whitepaper" element={<AdminLayout><WhitepaperManager /></AdminLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
