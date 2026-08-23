interface StatProps {
  value: string;
  label: string;
  meta?: string;
  rule?: boolean;
}

export function Stat({ value, label, meta, rule = false }: StatProps) {
  return (
    <div
      className={`flex flex-col gap-1.5 ${rule ? "border-l border-border-subtle pl-6 first:border-l-0 first:pl-0" : ""}`}
    >
      <span className="text-[clamp(2rem,3.4vw,2.5rem)] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
        {value}
      </span>
      <span className="text-sm font-semibold text-ink">{label}</span>
      {meta ? <span className="text-xs text-muted-foreground">{meta}</span> : null}
    </div>
  );
}
