import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FIELDS, FIELD_MAP, Filter, OPERATORS } from "@/lib/projectMetrics";

const uid = () => Math.random().toString(36).slice(2, 9);

const opLabel = (f: Filter) =>
  OPERATORS[FIELD_MAP[f.field]?.type ?? "number"].find((o) => o.value === f.op)?.label ?? f.op;

const Editor = ({
  value,
  onChange,
}: {
  value: Filter;
  onChange: (next: Filter) => void;
}) => {
  const def = FIELD_MAP[value.field];
  const ops = OPERATORS[def?.type ?? "number"];
  return (
    <div className="space-y-2 w-[240px]">
      <Select
        value={value.field}
        onValueChange={(v) => onChange({ ...value, field: v, op: OPERATORS[FIELD_MAP[v].type][0].value })}
      >
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent className="max-h-72">
          {FIELDS.map((f) => (
            <SelectItem key={f.key} value={f.key} className="text-xs">{f.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Select value={value.op} onValueChange={(v) => onChange({ ...value, op: v as Filter["op"] })}>
          <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ops.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {value.op !== "is_true" && value.op !== "is_false" && (
          <Input
            autoFocus
            value={value.value}
            onChange={(e) => onChange({ ...value, value: e.target.value })}
            type={def?.type === "date" ? "date" : def?.type === "text" ? "text" : "number"}
            className="h-8 text-xs w-[96px]"
          />
        )}
      </div>
      {def?.help && <p className="text-[10.5px] text-muted-foreground leading-tight">{def.help}</p>}
    </div>
  );
};

const CriteriaBar = ({
  filters,
  onChange,
}: {
  filters: Filter[];
  onChange: (next: Filter[]) => void;
}) => {
  const [draft, setDraft] = useState<Filter>({ id: "draft", field: "reputation", op: "gte", value: "600" });
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filters.map((f) => (
        <Popover key={f.id}>
          <div className="inline-flex items-center rounded-full border border-border bg-muted/40 pl-2.5 pr-1 h-7">
            <PopoverTrigger asChild>
              <button className="text-[11.5px] text-foreground hover:text-primary whitespace-nowrap">
                <span className="text-muted-foreground">{FIELD_MAP[f.field]?.label}</span>{" "}
                {opLabel(f)}
                {f.op !== "is_true" && f.op !== "is_false" && <span className="font-medium"> {f.value}</span>}
              </button>
            </PopoverTrigger>
            <button
              onClick={() => onChange(filters.filter((x) => x.id !== f.id))}
              className="ml-1 p-1 text-muted-foreground/70 hover:text-destructive"
              aria-label="Remove criterion"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <PopoverContent align="start" className="p-3 w-auto">
            <Editor value={f} onChange={(next) => onChange(filters.map((x) => (x.id === f.id ? next : x)))} />
          </PopoverContent>
        </Popover>
      ))}

      <Popover open={openAdd} onOpenChange={setOpenAdd}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full border border-dashed border-border text-[11.5px] text-muted-foreground hover:text-primary hover:border-primary/40">
            <Plus className="w-3.5 h-3.5" /> Criteria
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-3 w-auto">
          <Editor value={draft} onChange={setDraft} />
          <Button
            size="sm"
            className="w-full h-8 text-xs mt-3"
            onClick={() => {
              onChange([...filters, { ...draft, id: uid() }]);
              setOpenAdd(false);
            }}
          >
            Add criterion
          </Button>
        </PopoverContent>
      </Popover>

      {filters.length > 0 && (
        <button onClick={() => onChange([])} className="text-[11px] text-muted-foreground hover:text-foreground ml-1">
          Clear all
        </button>
      )}
    </div>
  );
};

export default CriteriaBar;
