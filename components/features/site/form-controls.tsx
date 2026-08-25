import {
  forwardRef,
  type ReactNode,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const inputClass =
  "w-full rounded-md border border-ink/10 bg-surface-card px-4 text-sm text-ink shadow-[0_1px_2px_rgba(14,27,46,0.04)] outline-none transition-colors placeholder:text-n-400 hover:border-ink/24 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/25";

export function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">
        {label} {required ? <span className="text-orange-600">*</span> : null}
      </span>
      {children}
      {hint ? <span className="text-xs text-text-muted">{hint}</span> : null}
    </label>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput(props, ref) {
    return <input ref={ref} {...props} className={`h-11 ${inputClass}`} />;
  },
);

export function SelectInput({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`h-11 ${inputClass}`}>
      {children}
    </select>
  );
}

export function TextareaInput(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`min-h-[110px] py-3 ${inputClass}`} />;
}

export function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 flex-none appearance-none rounded border border-ink/24 bg-surface-card checked:border-orange-500 checked:bg-orange-500"
      />
      <span className="text-sm text-text-muted">{label}</span>
    </label>
  );
}

export function RadioCard({
  name,
  label,
  desc,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-md border p-5 transition-colors ${
        checked ? "border-orange-500 bg-orange-50" : "border-ink/10 bg-surface-card hover:border-ink/24"
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 flex-none accent-orange-500"
      />
      <span className="flex flex-col gap-1">
        <strong className="text-sm font-medium text-ink">{label}</strong>
        <span className="text-sm text-text-muted">{desc}</span>
      </span>
    </label>
  );
}
