interface MembreTabAVenirProps {
  message: string;
}

export function MembreTabAVenir({ message }: MembreTabAVenirProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-subtle bg-surface-card px-5 py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
