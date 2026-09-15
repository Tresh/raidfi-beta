import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProjectLayout from "@/components/project/ProjectLayout";
import ContributorTable from "@/components/project/ContributorTable";
import CriteriaBar from "@/components/project/CriteriaBar";
import PostGrid from "@/components/project/PostGrid";

import { PageHeader, Panel } from "@/components/dashboard/Primitives";
import { useProject } from "@/hooks/useProject";
import {
  PERIODS,
  rangeForDays,
  useContributorLists,
  useProjectActivity,
  useProjectContributors,
  useSavedViews,
} from "@/hooks/useProjectData";
import { DEFAULT_COLUMNS, Filter, applyFilters } from "@/lib/projectMetrics";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Loader2, Save, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TABS = [
  { key: "posts", label: "Top posts" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "data", label: "All data" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const decode = (s: string) =>
  s.replace(/&mdash;/g, "-").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const ProjectContributors = () => {
  const { project } = useProject();
  const { toast } = useToast();
  const [periodKey, setPeriodKey] = useState("90");
  const range = useMemo(() => rangeForDays(Number(periodKey)), [periodKey]);
  const { loading, error, rows } = useProjectContributors(project, range);
  const { rows: posts, loading: postsLoading, hasMore, loadMore } = useProjectActivity(project, range, true, 30);
  const { views, save, remove } = useSavedViews(project, "search");
  const { lists, create: createList } = useContributorLists(project);

  const [tab, setTab] = useState<TabKey>("posts");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [query, setQuery] = useState("");
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const results = useMemo(() => {
    let out = applyFilters(rows, filters);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter((r) => r.display_name.toLowerCase().includes(q) || (r.x_username ?? "").toLowerCase().includes(q));
    }
    return out;
  }, [rows, filters, query]);

  const leaderboard = useMemo(
    () => [...results].sort((a, b) => Number(b.project_xp ?? 0) - Number(a.project_xp ?? 0)),
    [results],
  );

  const matchedEmails = useMemo(() => new Set(results.map((r) => r.email)), [results]);
  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((p) => matchedEmails.has(p.email));
    return [...filtered].sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0));
  }, [posts, matchedEmails]);

  const saveSearch = async () => {
    const name = window.prompt("Name this search");
    if (!name) return;
    await save(name, { filters, periodKey, columns, tab });
    toast({ title: "Search saved", description: "It recalculates from live data each time you open it." });
  };

  const saveList = async () => {
    const emails = selected.size ? [...selected] : results.map((r) => r.email);
    if (!emails.length) return;
    const name = window.prompt(`Name this shortlist of ${emails.length} contributors`);
    if (!name) return;
    await createList(name, emails, `${PERIODS.find((p) => p.key === periodKey)?.label}`);
    toast({ title: "Shortlist saved", description: `${emails.length} contributors stored.` });
  };

  return (
    <ProjectLayout>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-foreground">Contributors</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select value={periodKey} onValueChange={setPeriodKey}>
            <SelectTrigger className="h-8 flex-1 min-w-[140px] sm:flex-none sm:w-[148px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => <SelectItem key={p.key} value={p.key} className="text-xs">{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 shrink-0" onClick={saveSearch}>
            <Save className="w-3.5 h-3.5" /> Save
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">{error}</div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
        <div className="inline-flex w-full sm:w-auto rounded-full border border-border p-0.5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-[11.5px] px-3 h-7 rounded-full transition-colors whitespace-nowrap flex-1 sm:flex-none ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:flex-1 sm:min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or @handle" className="pl-8 h-8 text-xs" />
        </div>
      </div>

      <div className="mb-4">
        <CriteriaBar filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : tab === "posts" ? (
        <div className="space-y-3">
          {visiblePosts.length === 0 && !postsLoading ? (
            <Panel title="No posts yet">
              <p className="text-sm text-muted-foreground">
                Nothing matching these criteria in this period. Widen the period or clear criteria.
              </p>
            </Panel>
          ) : (
            <PostGrid posts={visiblePosts} />
          )}
          {postsLoading && <div className="py-6 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>}
          {hasMore && !postsLoading && (
            <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={loadMore}>Load more</Button>
          )}
        </div>

      ) : tab === "leaderboard" ? (
        <Panel title="Leaderboard" description="Ranked by reviewed value delivered to your project in this period.">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No contributors match these criteria.</p>
          ) : (
            <ul className="divide-y divide-border -my-1">
              {leaderboard.map((c, i) => (
                <li key={c.email} className="py-2.5 flex items-center gap-3">
                  <span className="w-6 text-[11px] tabular-nums text-muted-foreground">#{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    {c.referral_code ? (
                      <Link to={`/u/${c.referral_code}`} target="_blank" className="text-[13px] text-foreground hover:text-primary truncate block">
                        {c.display_name}
                      </Link>
                    ) : (
                      <p className="text-[13px] text-foreground truncate">{c.display_name}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      {c.project_contributions ?? 0} posts about us · reputation {c.reputation ?? 0} · quality {c.quality ?? 0}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold text-primary tabular-nums shrink-0">
                    {(c.project_xp ?? 0).toLocaleString()} XP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11.5px] text-muted-foreground">{results.length} contributors match</p>
            <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={saveList}>
              Save shortlist{selected.size ? ` (${selected.size})` : ""}
            </Button>
          </div>
          <ContributorTable
            rows={results}
            columns={columns}
            onColumnsChange={setColumns}
            selected={selected}
            onSelectedChange={setSelected}
            emptyState="No contributors match these criteria in this period."
          />
        </div>
      )}

      {(views.length > 0 || lists.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {views.length > 0 && (
            <Panel title="Saved searches" description="Recalculated from live data each time.">
              <ul className="space-y-1">
                {views.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-2">
                    <button
                      className="text-[12.5px] text-foreground hover:text-primary text-left"
                      onClick={() => {
                        setFilters(v.config?.filters ?? []);
                        setPeriodKey(v.config?.periodKey ?? "90");
                        if (v.config?.columns) setColumns(v.config.columns);
                        if (v.config?.tab) setTab(v.config.tab);
                      }}
                    >
                      {v.name}
                    </button>
                    <button onClick={() => remove(v.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
          {lists.length > 0 && (
            <Panel title="Shortlists" description="Groups you saved for outreach or evaluation.">
              <ul className="space-y-1">
                {lists.map((l: any) => (
                  <li key={l.id} className="text-[12.5px] text-foreground">
                    {l.name} <span className="text-muted-foreground">· {(l.emails ?? []).length} contributors</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </ProjectLayout>
  );
};

export default ProjectContributors;
