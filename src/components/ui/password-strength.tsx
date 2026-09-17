import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const CELL = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.45,
} as const;

const CROSSFADE = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.8,
} as const;

const INSTANT = { duration: 0 } as const;

const COMMON =
  /^(?:password|passw0rd|qwerty|letmein|welcome|admin|iloveyou|monkey|dragon|abc123|111111|123123|123456)/i;
const RUN = /(.)\1{3,}/;
const RUN_UP =
  /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg|qwer|wert|erty|asdf)/i;

export type PasswordRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

type EvaluatedRule = PasswordRule & { met: boolean };

type PasswordStrengthProps = {
  value: string;
  rules: readonly PasswordRule[];
  labels?: readonly string[];
  announceDelay?: number;
  className?: string;
};

type PasswordStrengthState = {
  score: number;
  max: number;
  label: string;
  rules: EvaluatedRule[];
  guessable: boolean;
  announcement: string;
};

const defaultLabels = ["Empty", "Weak", "Getting there", "Strong"] as const;

function usePasswordStrength(
  value: string,
  rules: readonly PasswordRule[],
  labels: readonly string[],
  announceDelay: number,
): PasswordStrengthState {
  const state = useMemo(() => {
    const evaluated = rules.map((rule) => ({ ...rule, met: rule.test(value) }));
    const passed = evaluated.reduce((total, rule) => total + (rule.met ? 1 : 0), 0);
    const guessable =
      value.length > 0 &&
      (COMMON.test(value) || RUN.test(value) || RUN_UP.test(value));
    const score =
      value.length === 0
        ? 0
        : guessable
          ? 1
          : Math.min(rules.length, Math.max(1, passed));
    const label = labels[Math.min(score, labels.length - 1)] ?? "";
    const unmet = evaluated.filter((rule) => !rule.met);
    const announcement =
      value.length === 0
        ? ""
        : [
            `Password strength ${label.toLowerCase()}.`,
            guessable ? "This is a commonly guessed pattern." : "",
            unmet.length === 0
              ? "All requirements met."
              : `Still needed: ${unmet.map((rule) => rule.label.toLowerCase()).join(", ")}.`,
          ]
            .filter(Boolean)
            .join(" ");

    return {
      score,
      max: rules.length,
      label,
      rules: evaluated,
      guessable,
      announcement,
    };
  }, [labels, rules, value]);

  const [settledAnnouncement, setSettledAnnouncement] = useState("");

  useEffect(() => {
    if (!state.announcement) {
      setSettledAnnouncement("");
      return;
    }

    const timeoutId = window.setTimeout(
      () => setSettledAnnouncement(state.announcement),
      announceDelay,
    );

    return () => window.clearTimeout(timeoutId);
  }, [announceDelay, state.announcement]);

  return { ...state, announcement: settledAnnouncement };
}

const TONES = {
  none: {
    bar: "bg-muted-foreground/25",
    text: "text-muted-foreground",
  },
  danger: {
    bar: "bg-destructive",
    text: "text-destructive",
  },
  caution: {
    bar: "bg-secondary",
    text: "text-secondary-foreground dark:text-secondary",
  },
  safe: {
    bar: "bg-primary",
    text: "text-primary",
  },
} as const;

function toneFor(score: number, max: number) {
  if (score === 0) return TONES.none;
  const ratio = score / max;
  if (ratio <= 0.34) return TONES.danger;
  if (ratio <= 0.67) return TONES.caution;
  return TONES.safe;
}

export function PasswordStrength({
  value,
  rules,
  labels = defaultLabels,
  announceDelay = 700,
  className,
}: PasswordStrengthProps) {
  const {
    score,
    max,
    label,
    rules: evaluated,
    guessable,
    announcement,
  } = usePasswordStrength(value, rules, labels, announceDelay);
  const reducedMotion = useReducedMotion();
  const tone = toneFor(score, max);

  return (
    <div className={cn("w-full", className)}>
      <div
        role="meter"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={score}
        aria-valuetext={label}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: max }, (_, index) => (
          <div
            key={index}
            className="relative h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <motion.span
              className={cn(
                "absolute inset-0 origin-left rounded-full transition-colors duration-200",
                tone.bar,
              )}
              initial={false}
              animate={{ scaleX: index < score ? 1 : 0 }}
              transition={
                reducedMotion
                  ? INSTANT
                  : { ...CELL, delay: index < score ? index * 0.03 : 0 }
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex h-5 items-center justify-between gap-3">
        <span className="inline-grid text-xs font-medium leading-5">
          {labels.map((text, index) => (
            <motion.span
              key={text}
              aria-hidden="true"
              className={cn(
                "col-start-1 row-start-1 whitespace-nowrap transition-colors duration-200",
                tone.text,
              )}
              initial={false}
              animate={{
                opacity: index === Math.min(score, labels.length - 1) ? 1 : 0,
              }}
              transition={reducedMotion ? INSTANT : CROSSFADE}
            >
              {text}
            </motion.span>
          ))}
        </span>

        <motion.span
          aria-hidden="true"
          className="whitespace-nowrap text-[11px] leading-5 text-destructive"
          initial={false}
          animate={{ opacity: guessable ? 1 : 0 }}
          transition={reducedMotion ? INSTANT : CROSSFADE}
        >
          Commonly guessed
        </motion.span>
      </div>

      <ul className="mt-2.5 grid gap-1.5">
        {evaluated.map((rule) => (
          <li key={rule.id} className="flex items-center gap-2">
            <span className="relative grid size-3.5 shrink-0 place-items-center rounded border border-border text-primary-foreground">
              <motion.span
                className="absolute inset-0 rounded-[3px] bg-primary"
                initial={false}
                animate={{ opacity: rule.met ? 1 : 0 }}
                transition={reducedMotion ? INSTANT : CROSSFADE}
              />
              <motion.svg
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="relative size-2.5"
                initial={false}
                animate={{
                  opacity: rule.met ? 1 : 0,
                  scale: rule.met ? 1 : 0.6,
                }}
                transition={reducedMotion ? INSTANT : CELL}
              >
                <path
                  d="M2 6.2 4.7 8.9 10 3.3"
                  stroke="currentColor"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </span>
            <span
              className={cn(
                "text-xs leading-5 transition-colors duration-200",
                rule.met ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {rule.label}
            </span>
            <span className="sr-only">{rule.met ? "met" : "not met"}</span>
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

export default PasswordStrength;
