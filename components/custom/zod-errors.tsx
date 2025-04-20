import { cn } from "@/lib/utils";

interface ZodErrorsProps {
  error: string[];
  className?: string;
}

export function ZodErrors({ error, className }: ZodErrorsProps) {
  if (!error || error.length === 0) return null;

  return (
    <div className={cn("mt-1 text-sm text-destructive", className)}>
      {error.map((err, i) => (
        <p key={i}>{err}</p>
      ))}
    </div>
  );
}
