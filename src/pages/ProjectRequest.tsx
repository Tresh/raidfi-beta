import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";

const SERVICES = ["Project workspace", "Ecosystem listing", "Campaign partnership", "Community analytics"];

const compressLogo = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const scale = Math.min(1, 320 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return reject(new Error("Could not process logo"));
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL("image/webp", 0.72));
  };
  image.onerror = () => reject(new Error("Invalid image"));
  image.src = URL.createObjectURL(file);
});

const ProjectRequest = () => {
  useSEO({ title: "Project & Partnership Request - RaidFi", description: "Request a RaidFi project workspace, listing, partnership, or community service.", path: "/project-request" });
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [services, setServices] = useState<string[]>([SERVICES[0]]);
  const [logo, setLogo] = useState<string | null>(null);
  const [form, setForm] = useState({ project_name: "", founder_name: "", email: "", website: "", x_handle: "", telegram: "", telegram_group_id: "", goal: "", expectations: "", estimated_budget: "", investment_ready: "unsure" });
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const toggleService = (value: string) => setServices((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.project_name.trim() || !form.founder_name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast({ title: "Check your details", description: "Project name, contact name and a valid email are required.", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("project_requests").insert({
      ...form,
      email: form.email.trim().toLowerCase(),
      x_handle: form.x_handle.replace(/^@/, "") || null,
      website: form.website || null,
      telegram: form.telegram || null,
      telegram_group_id: form.telegram_group_id || null,
      request_types: services.map((item) => item.toLowerCase().replace(/\s+/g, "_")),
      why: form.goal || null,
      goal: form.goal || null,
      expectations: form.expectations || null,
      investment_ready: form.investment_ready === "yes" ? true : form.investment_ready === "no" ? false : null,
      estimated_budget: form.estimated_budget || null,
      telegram_bot_added: false,
      raidfi_community_opt_in: false,
      logo_data_url: logo,
    } as any);
    setSending(false);
    if (error) return toast({ title: "Request not sent", description: error.message, variant: "destructive" });
    setDone(true);
  };

  return <div className="min-h-screen bg-background flex flex-col"><Navbar /><main className="flex-1 pt-24 pb-16"><div className="container max-w-2xl px-5">
    {done ? <div className="py-20 text-center"><CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" /><h1 className="text-2xl font-semibold">Request received</h1><p className="text-sm text-muted-foreground mt-2">We’ll review the fit and continue the conversation by email.</p><Button asChild variant="outline" className="mt-6"><a href="/">Back home</a></Button></div> : <>
      <header className="mb-7"><p className="text-xs font-medium text-primary mb-2">PROJECTS & COMMUNITIES</p><h1 className="text-3xl font-bold">Tell us what you want to build</h1><p className="text-sm text-muted-foreground mt-2 max-w-xl">Request a listing, partnership, project workspace or community intelligence service. Keep it brief-we’ll collect deeper details together later.</p></header>
      <form onSubmit={submit} className="space-y-6">
        <section className="space-y-3"><h2 className="text-sm font-semibold">What are you interested in?</h2><div className="grid sm:grid-cols-2 gap-2">{SERVICES.map((service) => <label key={service} className="flex items-center gap-2 border border-border rounded-lg p-3 text-sm"><Checkbox checked={services.includes(service)} onCheckedChange={() => toggleService(service)} />{service}</label>)}</div></section>
        <section className="grid sm:grid-cols-2 gap-4"><div><Label>Project name</Label><Input value={form.project_name} onChange={(e) => set("project_name", e.target.value)} required /></div><div><Label>Your name</Label><Input value={form.founder_name} onChange={(e) => set("founder_name", e.target.value)} required /></div><div><Label>Work email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div><div><Label>Website</Label><Input placeholder="https://" value={form.website} onChange={(e) => set("website", e.target.value)} /></div><div><Label>Project X account</Label><Input placeholder="@project" value={form.x_handle} onChange={(e) => set("x_handle", e.target.value)} /></div><div><Label>Telegram group</Label><Input placeholder="t.me/community" value={form.telegram} onChange={(e) => set("telegram", e.target.value)} /></div></section>
        <section><Label>Project logo <span className="text-muted-foreground font-normal">(optional, compressed before upload)</span></Label><label className="mt-2 flex items-center justify-center gap-2 h-20 border border-dashed border-border rounded-lg text-sm text-muted-foreground cursor-pointer"><Upload className="w-4 h-4" />{logo ? "Logo ready" : "Choose PNG, JPG or WebP"}<input className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 5_000_000) return toast({ title: "Logo is too large", description: "Choose an image under 5 MB.", variant: "destructive" }); try { setLogo(await compressLogo(file)); } catch { toast({ title: "Could not process logo", variant: "destructive" }); } }} /></label></section>
        <section className="space-y-4"><div><Label>Main goal</Label><Textarea rows={3} value={form.goal} onChange={(e) => set("goal", e.target.value)} placeholder="What outcome are you trying to achieve?" /></div><div><Label>What do you expect from RaidFi?</Label><Textarea rows={3} value={form.expectations} onChange={(e) => set("expectations", e.target.value)} placeholder="Contribution growth, discovery, reputation data, campaign support…" /></div><div className="grid sm:grid-cols-2 gap-4"><div><Label>Open to investing in this?</Label><Select value={form.investment_ready} onValueChange={(value) => set("investment_ready", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="unsure">Let’s discuss</SelectItem><SelectItem value="no">Not currently</SelectItem></SelectContent></Select></div><div><Label>Estimated budget</Label><Input value={form.estimated_budget} onChange={(e) => set("estimated_budget", e.target.value)} placeholder="Range or ‘not decided’" /></div></div></section>
        <section className="border border-border rounded-lg p-4"><h2 className="text-sm font-semibold">Telegram community connection <span className="text-muted-foreground font-normal">(optional)</span></h2><p className="text-xs text-muted-foreground mt-1 mb-3">After approval, add the RaidFi bot to your group for contribution alerts. The group ID lets us securely connect alerts to your workspace; joining the main RaidFi community stays optional.</p><Label>Telegram group ID</Label><Input value={form.telegram_group_id} onChange={(e) => set("telegram_group_id", e.target.value)} placeholder="Example: -1001234567890" /></section>
        <Button type="submit" className="w-full" disabled={sending || services.length === 0}>{sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Send project request</Button>
      </form>
    </>}
  </div></main><Footer /></div>;
};

export default ProjectRequest;