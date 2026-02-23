import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SingleSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

export const SingleSelect = ({ label, options, value, onChange, required }: SingleSelectProps) => (
  <div className="space-y-2">
    <Label className="text-foreground font-medium">
      {label} {required && <span className="text-primary">*</span>}
    </Label>
    <div className="grid gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "text-left px-4 py-2.5 rounded-lg border text-sm transition-colors",
            value === opt
              ? "border-primary bg-primary/10 text-foreground"
              : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-white/[0.15]"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

interface MultiSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  required?: boolean;
}

export const MultiSelect = ({ label, options, value, onChange, required }: MultiSelectProps) => (
  <div className="space-y-2">
    <Label className="text-foreground font-medium">
      {label} {required && <span className="text-primary">*</span>}
    </Label>
    <div className="grid gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() =>
              onChange(selected ? value.filter((v) => v !== opt) : [...value, opt])
            }
            className={cn(
              "text-left px-4 py-2.5 rounded-lg border text-sm transition-colors",
              selected
                ? "border-primary bg-primary/10 text-foreground"
                : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-white/[0.15]"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

interface TextQuestionProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
}

export const TextQuestion = ({ label, value, onChange, placeholder, multiline, required }: TextQuestionProps) => (
  <div className="space-y-2">
    <Label className="text-foreground font-medium">
      {label} {required && <span className="text-primary">*</span>}
    </Label>
    {multiline ? (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white/[0.05] border-white/[0.1] min-h-[80px] focus-visible:ring-offset-0"
      />
    ) : (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white/[0.05] border-white/[0.1] focus-visible:ring-offset-0"
      />
    )}
  </div>
);
