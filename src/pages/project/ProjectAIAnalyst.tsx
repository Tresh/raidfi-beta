import { useMemo, useRef, useState, useEffect } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import { PageHeader, Panel } from "@/components/dashboard/Primitives";
import { useProject } from "@/hooks/useProject";
import { rangeForDays, useProjectContributors } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PROVIDERS = [
  { key: "openai", label: "OpenAI", url: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini" },
  { key: "openrouter", label: "OpenRouter", url: "https://openrouter.ai/api/v1/chat/completions", model: "openai/gpt-4o-mini" },
  { key: "anthropic", label: "Anthropic", url: "https://api.anthropic.com/v1/messages", model: "claude-3-5-sonnet-latest" },
  { key: "google", label: "Google Gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", model: "gemini-2.0-flash" },
  { key: "custom", label: "Custom (OpenAI-compatible)", url: "", model: "" },
];

const STORE = "raidfi.project.ai";

interface Config { provider: string; apiKey: string; model: string; baseUrl: string }

const loadConfig = (): Config => {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { provider: "openai", apiKey: "", model: PROVIDERS[0].model, baseUrl: PROVIDERS[0].url };
};

interface Msg { role: "user" | "assistant"; content: string }

const ProjectAIAnalyst = () => {
  const { project } = useProject();
  const { toast } = useToast();
  const [config, setConfig] = useState<Config>(loadConfig);
  const [days, setDays] = useState(90);
  const range = useMemo(() => rangeForDays(days), [days]);
  const { rows, loading } = useProjectContributors(project, range);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  const connected = Boolean(config.apiKey && config.baseUrl && config.model);

  const saveConfig = (next: Config) => {
    setConfig(next);
    localStorage.setItem(STORE, JSON.stringify(next));
  };

  // Only the project-scoped rows already authorized for this workspace are sent.
  const dataset = useMemo(
    () =>
      rows.slice(0, 150).map((r) => ({
        name: r.display_name,
        x: r.x_username,
        reputation: r.reputation,
        tier: r.tier,
        quality: r.quality,
        consistency: r.consistency,
        reliability: r.reliability,
        depth: r.depth,
        contributions: r.contributions,
        accepted: r.accepted,
        acceptance_rate: r.acceptance_rate,
        days_since_last: r.days_since_last,
        posts_about_us: r.project_contributions,
        xp_from_us: r.project_xp,
      })),
    [rows],
  );

  const ask = async () => {
    const question = input.trim();
    if (!question || !connected) return;
    setInput("");
    const history = [...messages, { role: "user" as const, content: question }];
    setMessages(history);
    setBusy(true);
    try {
      const system = `You are the RaidFi analyst for the project "${project?.name}". Answer only from the JSON contributor dataset provided (last ${days} days, project-scoped). Never invent contributors or numbers. If the data can't answer, say so. Be concise and practical, and name specific contributors with their numbers.\n\nDATASET:\n${JSON.stringify(dataset)}`;

      let reply = "";
      if (config.provider === "anthropic") {
        const res = await fetch(config.baseUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": config.apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: config.model,
            max_tokens: 1200,
            system,
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
        reply = json?.content?.[0]?.text ?? "";
      } else {
        const res = await fetch(config.baseUrl, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${config.apiKey}` },
          body: JSON.stringify({
            model: config.model,
            messages: [{ role: "system", content: system }, ...history],
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
        reply = json?.choices?.[0]?.message?.content ?? "";
      }
      setMessages([...history, { role: "assistant", content: reply || "No response." }]);
    } catch (e: any) {
      toast({ title: "AI request failed", description: e?.message ?? "Check your key, model and provider.", variant: "destructive" });
      setMessages(history);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProjectLayout>
      <PageHeader
        title="AI Analyst"
        subtitle="Ask questions about your contributor data using your own AI provider key."
      />

      <div className="grid lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="border border-border rounded-lg bg-card flex flex-col min-h-[60vh]">
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Try asking:</p>
                <ul className="space-y-1 text-[12.5px]">
                  <li>“Who are our 10 most consistent contributors?”</li>
                  <li>“Which strong contributors have gone quiet?”</li>
                  <li>“Who should we consider for an ambassador role, and why?”</li>
                  <li>“Analyse our top 50 contributors — what stands out?”</li>
                </ul>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div className={m.role === "user" ? "max-w-[85%] rounded-lg bg-primary text-primary-foreground px-3 py-2 text-[13px]" : "text-[13.5px] text-foreground whitespace-pre-wrap leading-relaxed"}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && <p className="text-[13px] text-muted-foreground animate-pulse">Analysing…</p>}
            <div ref={endRef} />
          </div>
          <div className="border-t border-border p-3 flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); }
              }}
              placeholder={connected ? "Ask about your contributors…" : "Connect your AI provider first"}
              disabled={!connected || busy}
              rows={2}
              className="text-[13px] resize-none"
            />
            <Button size="icon" onClick={ask} disabled={!connected || busy || !input.trim()}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Panel title="AI connection" description="Your key is stored only in this browser and sent straight to your provider.">
            <div className="space-y-2">
              <Select
                value={config.provider}
                onValueChange={(v) => {
                  const p = PROVIDERS.find((x) => x.key === v)!;
                  saveConfig({ ...config, provider: v, baseUrl: p.url, model: p.model });
                }}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => <SelectItem key={p.key} value={p.key} className="text-xs">{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {config.provider === "custom" && (
                <Input
                  value={config.baseUrl}
                  onChange={(e) => saveConfig({ ...config, baseUrl: e.target.value })}
                  placeholder="https://.../v1/chat/completions"
                  className="h-8 text-xs"
                />
              )}
              <Input
                value={config.model}
                onChange={(e) => saveConfig({ ...config, model: e.target.value })}
                placeholder="Model"
                className="h-8 text-xs"
              />
              <Input
                type="password"
                value={config.apiKey}
                onChange={(e) => saveConfig({ ...config, apiKey: e.target.value })}
                placeholder="API key"
                className="h-8 text-xs"
              />
              <p className="text-[10.5px] text-muted-foreground leading-tight">
                By connecting a provider you authorise the analyst to read the contributor data your workspace can already
                see. Nothing is stored on RaidFi servers.
              </p>
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => setMessages([])}>
                  <Trash2 className="w-3.5 h-3.5" /> Clear chat
                </Button>
              )}
            </div>
          </Panel>

          <Panel title="Data in scope">
            <div className="space-y-1.5 text-[12px] text-muted-foreground">
              <p>{loading ? "Loading…" : `${rows.length} contributors`} · last {days} days</p>
              <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[30, 90, 180, 365].map((d) => <SelectItem key={d} value={String(d)} className="text-xs">Last {d} days</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </Panel>
        </div>
      </div>
    </ProjectLayout>
  );
};

export default ProjectAIAnalyst;
