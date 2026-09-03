import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Columns3, Download, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ContributorRow,
  FIELDS,
  FIELD_MAP,
  formatValue,
  toCSV,
} from "@/lib/projectMetrics";

interface Props {
  rows: ContributorRow[];
  columns: string[];
  onColumnsChange: (cols: string[]) => void;
  selected: Set<string>;
  onSelectedChange: (next: Set<string>) => void;
  extraColumns?: { key: string; label: string; render: (row: ContributorRow) => React.ReactNode }[];
  emptyState?: React.ReactNode;
  rankOffset?: boolean;
}

const TierChip = ({ tier }: { tier?: string }) => {
  const tone: Record<string, string> = {
    Core: "bg-primary/15 text-primary border-primary/25",
    Trusted: "bg-primary/10 text-primary border-primary/20",
    Established: "bg-muted text-foreground border-border",
    Emerging: "bg-muted text-muted-foreground border-border",
    Unverified: "bg-muted/50 text-muted-foreground border-border",
  };
  return (
    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-medium ${tone[tier ?? ""] ?? "bg-muted text-muted-foreground border-border"}`}>
      {tier ?? "-"}
    </span>
  );
};

const ContributorTable = ({
  rows,
  columns,
  onColumnsChange,
  selected,
  onSelectedChange,
  extraColumns = [],
  emptyState,
}: Props) => {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({ key: "reputation", dir: "desc" });
  const [pinned, setPinned] = useState<string[]>([]);

  const sorted = useMemo(() => {
    const out = [...rows];
    out.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const def = FIELD_MAP[sort.key];
      let cmp: number;
      if (def?.type === "text") cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      else if (def?.type === "date") cmp = new Date(String(av ?? 0)).getTime() - new Date(String(bv ?? 0)).getTime();
      else cmp = Number(av ?? 0) - Number(bv ?? 0);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    if (pinned.length) {
      out.sort((a, b) => Number(pinned.includes(b.email)) - Number(pinned.includes(a.email)));
    }
    return out;
  }, [rows, sort, pinned]);

  const toggleSort = (key: string) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  };

  const toggleRow = (email: string) => {
    const next = new Set(selected);
    next.has(email) ? next.delete(email) : next.add(email);
    onSelectedChange(next);
  };

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.email));

  const exportCsv = () => {
    const csv = toCSV(sorted as any, columns);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `raidfi-contributors-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(sorted, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `raidfi-contributors-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const grouped = useMemo(() => {
    const map: Record<string, typeof FIELDS> = {};
    FIELDS.forEach((f) => {
      (map[f.group] ??= [] as any).push(f);
    });
    return map;
  }, []);

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
        <p className="text-[11px] text-muted-foreground">
          {rows.length} contributor{rows.length === 1 ? "" : "s"}
          {selected.size > 0 && <span className="text-primary"> · {selected.size} selected</span>}
        </p>
        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5">
                <Columns3 className="w-3.5 h-3.5" /> Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 max-h-80 overflow-y-auto p-3">
              {Object.entries(grouped).map(([group, fields]) => (
                <div key={group} className="mb-3 last:mb-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{group}</p>
                  <div className="space-y-1">
                    {fields.map((f) => (
                      <label key={f.key} className="flex items-center gap-2 text-[12px] cursor-pointer">
                        <Checkbox
                          checked={columns.includes(f.key)}
                          onCheckedChange={() =>
                            onColumnsChange(
                              columns.includes(f.key)
                                ? columns.filter((c) => c !== f.key)
                                : [...columns, f.key],
                            )
                          }
                        />
                        {f.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={exportCsv}>
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={exportJson}>
            JSON
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="py-14 text-center text-sm text-muted-foreground px-6">{emptyState ?? "Nothing matches these criteria yet."}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-9 px-3 py-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() =>
                      onSelectedChange(allSelected ? new Set() : new Set(rows.map((r) => r.email)))
                    }
                  />
                </th>
                <th className="w-9 px-1 py-2" />
                {columns.map((key) => {
                  const def = FIELD_MAP[key];
                  if (!def) return null;
                  return (
                    <th key={key} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                      <button onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 hover:text-foreground" title={def.help}>
                        {def.label}
                        {sort.key === key && (sort.dir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                      </button>
                    </th>
                  );
                })}
                {extraColumns.map((c) => (
                  <th key={c.key} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.email} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2">
                    <Checkbox checked={selected.has(row.email)} onCheckedChange={() => toggleRow(row.email)} />
                  </td>
                  <td className="px-1 py-2">
                    <button
                      onClick={() =>
                        setPinned((p) => (p.includes(row.email) ? p.filter((e) => e !== row.email) : [...p, row.email]))
                      }
                      className="text-muted-foreground/60 hover:text-primary"
                      aria-label="Pin row"
                    >
                      {pinned.includes(row.email) ? <Pin className="w-3.5 h-3.5 text-primary" /> : <PinOff className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                  {columns.map((key) => {
                    const def = FIELD_MAP[key];
                    if (!def) return null;
                    const value = row[key];
                    return (
                      <td key={key} className="px-3 py-2 whitespace-nowrap tabular-nums">
                        {key === "display_name" ? (
                          row.referral_code ? (
                            <Link to={`/u/${row.referral_code}`} target="_blank" className="font-medium text-foreground hover:text-primary hover:underline">
                              {String(value)}
                            </Link>
                          ) : (
                            <span className="font-medium text-foreground">{String(value)}</span>
                          )
                        ) : key === "tier" ? (
                          <TierChip tier={row.tier} />
                        ) : key === "x_username" ? (
                          value ? (
                            <a href={`https://x.com/${String(value).replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                              @{String(value).replace(/^@/, "")}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )
                        ) : (
                          <span className={def.type === "number" && Number(value) === 0 ? "text-muted-foreground" : "text-foreground"}>
                            {formatValue(value, def.type)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {extraColumns.map((c) => (
                    <td key={c.key} className="px-3 py-2">{c.render(row)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContributorTable;
