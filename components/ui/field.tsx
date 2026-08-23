interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-[0.8125rem] font-medium text-verdict-false">{error}</span>
      ) : hint ? (
        <span className="text-[0.8125rem] text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}
