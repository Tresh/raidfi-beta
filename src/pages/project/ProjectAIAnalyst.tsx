import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ProjectLayout from "@/components/project/ProjectLayout";
import { useProject } from "@/hooks/useProject";
import { rangeForDays, useProjectContributors } from "@/hooks/useProjectData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bot,
  Check,
  Database,
  Loader2,
  MessageSquarePlus,
  PanelRightClose,
  PanelRightOpen,
  Plug,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

const PROVIDERS = [
  { key: "openai", label: "OpenAI", url: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini" },
  { key: "openrouter", label: "OpenRouter", url: "https://openrouter.ai/api/v1/chat/completions", model: "openai/gpt-4o-mini" },
  { key: "anthropic", label: "Anthropic", url: "https://api.anthropic.com/v1/messages", model: "claude-3-5-sonnet-latest" },
  { key: "google", label: "Google Gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", model: "gemini-2.0-flash" },
  { key: "custom", label: "Custom (OpenAI-compatible)", url: "", model: "" },
];

const STORE = "raidfi.project.ai";
const CHATS = "raidfi.project.ai.chats";

interface Config { provider: string; apiKey: string; model: string; baseUrl: string }
interface Msg { role: "user" | "assistant"; content: string }
interface Chat { id: string; title: string; messages: Msg[]; updated: number }

const loadConfig = (): Config => {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { provider: "openai", apiKey: "", model: PROVIDERS[0].model, baseUrl: PROVIDERS[0].url };
};

const loadChats = (): Chat[] => {
  try {
    const raw = localStorage.getItem(CHATS);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
};

const newChat = (): Chat => ({ id: crypto.randomUUID(), title: "New chat", messages: [], updated: Date.now() });

const SUGGESTIONS = [
  "Who are our 10 most consistent contributors?",
  "Which strong contributors have gone quiet?",
  "Who should we consider for an ambassador role, and why?",
  "Summarise the health of our contributor base this quarter.",
];

const ProjectAIAnalyst = () => {
  const { project } = useProject();
  const { toast } = useToast();
  const [config, setConfig] = useState<Config>(loadConfig);
  const [days, setDays] = useState(90);
  const range = useMemo(() => rangeForDays(days), [days]);
  const { rows, loading } = useProjectContributors(project, range);

  const [chats, setChats] = useState<Chat[]>(() => {
    const stored = loadChats();
    return stored.length ? stored : [newChat()];
  });
  const [activeId, setActiveId] = useState(() => (loadChats()[0]?.id ?? ""));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [mobilePanel, setMobilePanel] = useState(false);
  const isMobile = useIsMobile();
  const endRef = useRef<HTMLDivElement>(null);

  const active = chats.find((c) => c.id === activeId) ?? chats[0];

  useEffect(() => {
    if (!activeId && chats[0]) setActiveId(chats[0].id);
  }, [activeId, chats]);

  useEffect(() => {
    localStorage.setItem(CHATS, JSON.stringify(chats.slice(0, 30)));
  }, [chats]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages, busy]);

  const connected = Boolean(config.apiKey && config.baseUrl && config.model);

  const saveConfig = (next: Config) => {
    setConfig(next);
    localStorage.setItem(STORE, JSON.stringify(next));
  };

  const patchActive = (messages: Msg[]) =>
    setChats((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              messages,
              updated: Date.now(),
              title: c.title === "New chat" && messages[0] ? messages[0].content.slice(0, 42) : c.title,
            }
          : c,
      ),
    );

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

  const ask = async (preset?: string) => {
    const question = (preset ?? input).trim();
    if (!question || !connected || busy) return;
    setInput("");
    const history = [...(active?.messages ?? []), { role: "user" as const, content: question }];
    patchActive(history);
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
          body: JSON.stringify({ model: config.model, messages: [{ role: "system", content: system }, ...history] }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message ?? "Request failed");
        reply = json?.choices?.[0]?.message?.content ?? "";
      }
      patchActive([...history, { role: "assistant", content: reply || "No response." }]);
    } catch (e: any) {
      toast({ title: "AI request failed", description: e?.message ?? "Check your key, model and provider.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const panelBody = (
    <>
            <div className="p-3 border-b border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5"
                onClick={() => {
                  const c = newChat();
                  setChats((prev) => [c, ...prev]);
                  setActiveId(c.id);
                }}
              >
                <MessageSquarePlus className="w-3.5 h-3.5" /> New chat
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              <p className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground px-2 py-1.5">Chats</p>
              {chats.map((c) => (
                <div
                  key={c.id}
                  className={`group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer ${
                    c.id === active?.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setActiveId(c.id)}
                >
                  <span className="text-[12px] truncate flex-1">{c.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChats((prev) => {
                        const next = prev.filter((x) => x.id !== c.id);
                        const list = next.length ? next : [newChat()];
                        if (c.id === active?.id) setActiveId(list[0].id);
                        return list;
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-3 space-y-3">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Database className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-[11px] font-medium text-foreground">Data in scope</p>
                </div>
                <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[30, 90, 180, 365].map((d) => (
                      <SelectItem key={d} value={String(d)} className="text-xs">Last {d} days</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10.5px] text-muted-foreground mt-1.5">
                  {loading ? "Loading…" : `${rows.length} contributors, capped at 150 per request.`}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Plug className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-[11px] font-medium text-foreground">Connection</p>
                  {connected && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-primary">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  )}
                </div>
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
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Stored only in this browser and sent straight to your provider. Nothing is kept on RaidFi servers.
                  </p>
                </div>
              </div>
            </div>
    </>
  );

  return (
    <ProjectLayout fullBleed>
      <div className="h-full flex min-w-0">
        {/* Chat column */}
        <section className="flex-1 flex flex-col min-w-0">
          <header className="h-14 shrink-0 border-b border-border px-4 sm:px-6 flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">AI Analyst</h1>
              <p className="text-[11px] text-muted-foreground truncate">
                {connected ? `${config.model} · ${rows.length} contributors in scope` : "Not connected"}
              </p>
            </div>
            <button
              onClick={() => (isMobile ? setMobilePanel(true) : setSidebar((s) => !s))}
              className="ml-auto text-muted-foreground hover:text-foreground"
              aria-label="Toggle panel"
            >
              {sidebar && !isMobile ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div className="max-w-3xl mx-auto space-y-5">
              {!active?.messages.length && (
                <div className="pt-8 text-center">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground mt-3">
                    Ask anything about {project?.name ?? "your"} contributors
                  </h2>
                  <p className="text-[12.5px] text-muted-foreground mt-1">
                    Your key stays in this browser. Only data your workspace can already see is sent.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 mt-6 text-left">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => ask(s)}
                        disabled={!connected}
                        className="border border-border rounded-lg px-3 py-2.5 text-[12.5px] text-foreground hover:border-primary/50 hover:bg-muted/50 disabled:opacity-50 transition-colors text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {active?.messages.map((m, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className={`w-7 h-7 rounded-md shrink-0 flex items-center justify-center ${
                      m.role === "user" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[11px] text-muted-foreground mb-1">{m.role === "user" ? "You" : "Analyst"}</p>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-[13.5px] leading-relaxed text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-[13.5px] leading-relaxed text-foreground whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>
              ))}

              {busy && (
                <div className="flex gap-3 items-center text-[13px] text-muted-foreground">
                  <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  Analysing your contributor data…
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-border px-4 sm:px-6 py-3">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-2 border border-border rounded-xl bg-card px-2.5 py-2 focus-within:border-primary/50 transition-colors">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      ask();
                    }
                  }}
                  placeholder={connected ? "Ask about your contributors…" : "Connect your AI provider to start"}
                  disabled={!connected || busy}
                  rows={1}
                  className="text-[13px] resize-none border-0 shadow-none focus-visible:ring-0 min-h-[38px] max-h-40 bg-transparent"
                />
                <Button size="icon" className="h-8 w-8 shrink-0" onClick={() => ask()} disabled={!connected || busy || !input.trim()}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10.5px] text-muted-foreground mt-1.5 text-center">
                Answers come from your own provider and can be wrong - check the numbers before acting.
              </p>
            </div>
          </div>
        </section>

        {/* Right sidebar - desktop */}
        {sidebar && (
          <aside className="hidden lg:flex w-[300px] shrink-0 border-l border-border bg-card flex-col">
            {panelBody}
          </aside>
        )}

        {/* Right panel - mobile */}
        <Sheet open={mobilePanel} onOpenChange={setMobilePanel}>
          <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 lg:hidden">
            <div className="h-full flex flex-col bg-card">{panelBody}</div>
          </SheetContent>
        </Sheet>
      </div>
    </ProjectLayout>
  );
};

export default ProjectAIAnalyst;
