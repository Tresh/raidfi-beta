import { useMemo, useState } from "react";
import ProjectLayout from "@/components/project/ProjectLayout";
import ContributorTable from "@/components/project/ContributorTable";
import { PageHeader, Panel } from "@/components/dashboard/Primitives";
import { useProject } from "@/hooks/useProject";
import { PERIODS, rangeForDays, useContributorLists, useProjectContributors, useSavedViews } from "@/hooks/useProjectData";
import {
  DEFAULT_COLUMNS,
  FIELDS,
  FIELD_MAP,
  Filter,
  OBJECTIVES,
  OPERATORS,
  applyFilters,
  evalFormula,
  explainMatch,
  parseNaturalQuery,
  scoreForObjective,
} from "@/lib/projectMetrics";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Save, Search, Sparkles, Trash2, Wand2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const uid = () => Math.random().toString(36).slice(2, 9);

const ProjectFind = () => {
  const { project } = useProject();
  const { toast } = useToast();
  const [periodKey, setPeriodKey] = useState("90");
  const range = useMemo(() => rangeForDays(Number(periodKey)), [periodKey]);
  const { loading, error, rows } = useProjectContributors(project, range);
  const { views, save, remove } = useSavedViews(project, "search");
  const { lists, create: createList, remove: removeList } = useContributorLists(project);

  const [objective, setObjective] = useState("balanced");
  const [count, setCount] = useState(10);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [query, setQuery] = useState("");
  const [nl, setNl] = useState("");
  const [nlPreview, setNlPreview] = useState<{ filters: Omit<Filter, "id">[]; note: string[] } | null>(null);
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formulaName, setFormulaName] = useState("");
  const [formula, setFormula] = useState("");
  const [activeFormula, setActiveFormula] = useState<{ name: string; expr: string } | null>(null);

  const obj = OBJECTIVES.find((o) => o.key === objective) ?? OBJECTIVES[0];

  const results = useMemo(() => {
    const baseFilters: Filter[] = [
      ...(obj.filters ?? []).map((f) => ({ ...f, id: `obj-${f.field}` })),
      ...filters,
    ];
    let out = applyFilters(rows, baseFilters);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(
        (r) => r.display_name.toLowerCase().includes(q) || (r.x_username ?? "").toLowerCase().includes(q),
      );
    }
    out = out.map((r) => ({ ...r, match_score: Math.round(scoreForObjective(r, obj)) }));
    if (activeFormula) {
      out = out.map((r) => ({ ...r, __formula: evalFormula(activeFormula.expr, r) }));
    }
    out.sort((a, b) => Number(b.match_score ?? 0) - Number(a.match_score ?? 0));
    return out;
  }, [rows, filters, obj, query, activeFormula]);

  const shown = results.slice(0, count);

  const addFilter = () => setFilters((f) => [...f, { id: uid(), field: "reputation", op: "gte", value: "600" }]);
  const patch = (id: string, next: Partial<Filter>) =>
    setFilters((f) => f.map((x) => (x.id === id ? { ...x, ...next } : x)));

  const runNl = () => {
    const parsed = parseNaturalQuery(nl);
    if (!parsed.filters.length) {
      toast({ title: "Couldn't read that", description: "Try something like: reputation above 700, active in the last 14 days, 5+ contributions." });
      return;
    }
    setNlPreview(parsed);
  };

  const applyNl = () => {
    if (!nlPreview) return;
    setFilters(nlPreview.filters.map((f) => ({ ...f, id: uid() })));
    setNlPreview(null);
    setNl("");
  };

  const saveSearch = async () => {
    const name = window.prompt("Name this search");
    if (!name) return;
    await save(name, { objective, count, filters, periodKey, columns });
    toast({ title: "Search saved", description: "It recalculates from live data every time you open it." });
  };

  const loadSearch = (config: any) => {
    setObjective(config.objective ?? "balanced");
    setCount(config.count ?? 10);
    setFilters(config.filters ?? []);
    setPeriodKey(config.periodKey ?? "90");
    if (config.columns) setColumns(config.columns);
  };

  const saveList = async () => {
    const emails = selected.size ? [...selected] : shown.map((r) => r.email);
    if (!emails.length) return;
    const name = window.prompt(`Name this list of ${emails.length} contributors`);
    if (!name) return;
    await createList(name, emails, `${obj.label} · ${PERIODS.find((p) => p.key === periodKey)?.label}`);
    toast({ title: "List saved", description: `${emails.length} contributors stored.` });
  };

  return (
    <ProjectLayout>
      <PageHeader
        title="Find contributors"
        subtitle="Tell RaidFi what you need. It ranks real contributors from live contribution data and explains every match."
        action={
          <div className="flex items-center gap-2">
            <Select value={periodKey} onValueChange={setPeriodKey}>
              <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => <SelectItem key={p.key} value={p.key} className="text-xs">{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={saveSearch}>
              <Save className="w-3.5 h-3.5" /> Save search
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[300px_1fr] gap-4 items-start">
        {/* ---- criteria rail ---- */}
        <div className="space-y-4">
          <Panel title="What are you looking for?" description="Pick a goal — it changes how results are ranked.">
            <div className="space-y-1.5">
              {OBJECTIVES.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setObjective(o.key)}
                  className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                    objective === o.key ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  }`}
                >
                  <p className={`text-[12.5px] font-medium ${objective === o.key ? "text-primary" : "text-foreground"}`}>{o.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{o.blurb}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <label className="text-[11.5px] text-muted-foreground whitespace-nowrap">How many?</label>
              <Input type="number" min={1} max={200} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value)))} className="h-8 text-xs" />
            </div>
          </Panel>

          <Panel
            title="Criteria"
            description="Stack as many conditions as you need."
            action={<Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1" onClick={addFilter}><Plus className="w-3.5 h-3.5" /> Add</Button>}
          >
            {(obj.filters ?? []).length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {(obj.filters ?? []).map((f, i) => (
                  <span key={i} className="text-[10.5px] px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {FIELD_MAP[f.field]?.label} {f.op === "gte" ? "≥" : "≤"} {f.value}
                  </span>
                ))}
              </div>
            )}
            {filters.length === 0 ? (
              <p className="text-[11.5px] text-muted-foreground">No extra conditions. Add one to narrow the pool.</p>
            ) : (
              <div className="space-y-2">
                {filters.map((f) => {
                  const def = FIELD_MAP[f.field];
                  const ops = OPERATORS[def?.type ?? "number"];
                  return (
                    <div key={f.id} className="flex items-center gap-1.5">
                      <Select value={f.field} onValueChange={(v) => patch(f.id, { field: v, op: OPERATORS[FIELD_MAP[v].type][0].value })}>
                        <SelectTrigger className="h-8 text-[11px] flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {FIELDS.map((fd) => <SelectItem key={fd.key} value={fd.key} className="text-xs">{fd.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={f.op} onValueChange={(v) => patch(f.id, { op: v as any })}>
                        <SelectTrigger className="h-8 text-[11px] w-[86px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ops.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {f.op !== "is_true" && f.op !== "is_false" && (
                        <Input
                          value={f.value}
                          onChange={(e) => patch(f.id, { value: e.target.value })}
                          type={def?.type === "date" ? "date" : def?.type === "text" ? "text" : "number"}
                          className="h-8 text-[11px] w-[84px]"
                        />
                      )}
                      <button onClick={() => setFilters((x) => x.filter((y) => y.id !== f.id))} className="text-muted-foreground hover:text-destructive">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel title="Ask in plain English" description="RaidFi turns it into filters you can check before applying.">
            <div className="flex gap-1.5">
              <Input
                value={nl}
                onChange={(e) => setNl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runNl()}
                placeholder="reputation above 700, active in the last 14 days"
                className="h-8 text-[11.5px]"
              />
              <Button size="sm" className="h-8 px-2.5" onClick={runNl}><Wand2 className="w-3.5 h-3.5" /></Button>
            </div>
            {nlPreview && (
              <div className="mt-3 rounded-md border border-border p-2.5">
                <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground mb-1.5">Filters detected</p>
                <ul className="space-y-0.5 mb-2">
                  {nlPreview.note.map((n) => <li key={n} className="text-[11.5px] text-foreground">· {n}</li>)}
                </ul>
                <div className="flex gap-1.5">
                  <Button size="sm" className="h-7 text-[11px]" onClick={applyNl}>Apply</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setNlPreview(null)}>Discard</Button>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Custom calculation" description="Build a column from existing fields. e.g. quality * acceptance_rate / 100">
            <div className="space-y-1.5">
              <Input value={formulaName} onChange={(e) => setFormulaName(e.target.value)} placeholder="Column name" className="h-8 text-[11.5px]" />
              <Input value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="quality * acceptance_rate / 100" className="h-8 text-[11.5px] font-mono" />
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  className="h-7 text-[11px]"
                  onClick={() => {
                    if (!formula.trim()) return;
                    const test = rows[0] ? evalFormula(formula, rows[0]) : 0;
                    if (test === null) {
                      toast({ title: "That formula doesn't work", description: "Use field names, numbers, + - * / ( ) and min, max, round, abs, sqrt." });
                      return;
                    }
                    setActiveFormula({ name: formulaName.trim() || "Custom", expr: formula });
                  }}
                >
                  Apply
                </Button>
                {activeFormula && (
                  <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setActiveFormula(null)}>Clear</Button>
                )}
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-tight pt-1">
                Fields: reputation, quality, consistency, reliability, depth, footprint, contributions, accepted, acceptance_rate, total_xp, active_days, days_since_last, project_contributions.
              </p>
            </div>
          </Panel>

          {views.length > 0 && (
            <Panel title="Saved searches" description="Recalculated from live data each time.">
              <div className="space-y-1">
                {views.map((v) => (
                  <div key={v.id} className="flex items-center gap-2">
                    <button onClick={() => loadSearch(v.config)} className="flex-1 text-left text-[12px] text-foreground hover:text-primary truncate">
                      {v.name}
                    </button>
                    <button onClick={() => remove(v.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {lists.length > 0 && (
            <Panel title="Contributor lists" description="Shortlists you saved for outreach.">
              <div className="space-y-1">
                {lists.map((l) => (
                  <div key={l.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-foreground truncate">{l.name}</p>
                      <p className="text-[10.5px] text-muted-foreground">{l.emails?.length ?? 0} people{l.note ? ` · ${l.note}` : ""}</p>
                    </div>
                    <button onClick={() => removeList(l.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* ---- results ---- */}
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or X handle" className="h-8 pl-8 text-xs" />
            </div>
            <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={saveList}>
              Save {selected.size ? `${selected.size} selected` : "results"} as list
            </Button>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : (
            <>
              <p className="text-[12.5px] text-foreground">
                <span className="font-semibold">{shown.length}</span> of {results.length} matching contributors
                <span className="text-muted-foreground"> · ranked for {obj.label.toLowerCase()}</span>
              </p>

              <ContributorTable
                rows={shown}
                columns={columns}
                onColumnsChange={setColumns}
                selected={selected}
                onSelectedChange={setSelected}
                extraColumns={[
                  ...(activeFormula
                    ? [{
                        key: "__formula",
                        label: activeFormula.name,
                        render: (r: any) => <span className="tabular-nums">{r.__formula == null ? "—" : Number(r.__formula).toFixed(1)}</span>,
                      }]
                    : []),
                  {
                    key: "match",
                    label: "Match",
                    render: (r: any) => (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary tabular-nums">
                        {r.match_score}
                      </span>
                    ),
                  },
                ]}
                emptyState={
                  rows.length === 0
                    ? "No contribution data in this period yet. Widen the time range, or wait for the first contributions to be reviewed."
                    : "No contributor meets all of these conditions. Try loosening one."
                }
              />

              {shown.length > 0 && (
                <Panel title="Why these people" description="Plain-language reasoning behind the top matches.">
                  <ul className="space-y-2.5">
                    {shown.slice(0, 6).map((r, i) => (
                      <li key={r.email} className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-medium text-foreground">
                            {r.display_name}
                            {r.x_username && <span className="text-muted-foreground font-normal"> @{String(r.x_username).replace(/^@/, "")}</span>}
                          </p>
                          <p className="text-[11.5px] text-muted-foreground leading-snug">{explainMatch(r, obj)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </>
          )}
        </div>
      </div>
    </ProjectLayout>
  );
};

export default ProjectFind;
