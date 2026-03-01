import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Validation error", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { name, email, subject, message } = parsed.data;

      // Check for duplicate email submission
      const { data: existing } = await supabase
        .from("contact_submissions")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        toast({ title: "Already submitted", description: "This email has already sent a message. We'll get back to you soon!", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("contact_submissions").insert([{ name, email, subject, message }]);
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 glass">
        <div className="container mx-auto px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <img src={logo} alt="RaidFi" className="w-8 h-8 rounded-full" />
            <span className="font-medium text-foreground">RaidFi</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-sm w-full">
          {!sent ? (
            <>
              <div className="text-center mb-5">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Get in <span className="text-primary">Touch</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Have a question or partnership idea? We'd love to hear from you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="glass-card p-5 rounded-xl space-y-3">
                <Input
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  className="bg-white/[0.05] border-white/[0.1] text-foreground h-9 text-sm"
                  required
                  maxLength={100}
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="bg-white/[0.05] border-white/[0.1] text-foreground h-9 text-sm"
                  required
                  maxLength={255}
                />
                <Input
                  name="subject"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="bg-white/[0.05] border-white/[0.1] text-foreground h-9 text-sm"
                  required
                  maxLength={200}
                />
                <Textarea
                  name="message"
                  placeholder="Your message..."
                  value={form.message}
                  onChange={handleChange}
                  className="bg-white/[0.05] border-white/[0.1] text-foreground min-h-[80px] text-sm"
                  required
                  maxLength={2000}
                />
                <Button type="submit" className="w-full h-9 text-sm font-semibold" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send Message
                </Button>
              </form>
            </>
          ) : (
            <div className="glass-card p-6 rounded-xl text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Message sent</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Thanks for reaching out! We'll get back to you soon.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Contact;
