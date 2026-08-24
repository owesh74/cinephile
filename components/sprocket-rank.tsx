export function SprocketRank({ n }: { n: number }) {
  return (
    <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm border border-border bg-muted font-mono text-xs text-secondary">
      <span
        className="absolute left-0.5 top-0.5 h-1 w-1 rounded-full bg-background"
        aria-hidden
      />
      <span
        className="absolute bottom-0.5 left-0.5 h-1 w-1 rounded-full bg-background"
        aria-hidden
      />
      <span
        className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-background"
        aria-hidden
      />
      <span
        className="absolute bottom-0.5 right-0.5 h-1 w-1 rounded-full bg-background"
        aria-hidden
      />
      {n}
    </div>
  );
}