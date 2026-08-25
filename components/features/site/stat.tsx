type StatProps = {
  value: string;
  label: string;
  valueClassName?: string;
  labelClassName?: string;
  borderClassName?: string;
};

export function Stat({
  value,
  label,
  valueClassName = "text-ink",
  labelClassName = "text-ink",
  borderClassName = "border-ink",
}: StatProps) {
  return (
    <div className={`border-t-2 pt-5 ${borderClassName}`}>
      <div className={`text-stat font-semibold tabular-nums ${valueClassName}`}>{value}</div>
      <div className={`mt-2 text-base ${labelClassName}`}>{label}</div>
    </div>
  );
}
