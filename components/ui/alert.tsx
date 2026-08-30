type AlertTone = "info" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<AlertTone, string> = {
  info: "bg-blue-50 text-blue-700 border-blue-100",
  success: "bg-verdict-true-bg text-verdict-true border-verdict-true/20",
  warning: "bg-orange-50 text-orange-800 border-orange-200",
  danger: "bg-verdict-false-bg text-verdict-false border-verdict-false/20",
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
}

export function Alert({ tone = "info", title, children }: AlertProps) {
  return (
    <div
      className={`flex gap-4 rounded-md border p-5 text-sm leading-relaxed ${TONE_CLASSES[tone]}`}
    >
      <div className="flex flex-col gap-1">
        {title ? <p className="text-base font-semibold">{title}</p> : null}
        <p>{children}</p>
      </div>
    </div>
  );
}
