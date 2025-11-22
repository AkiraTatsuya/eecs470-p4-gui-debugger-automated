// components/GenericScopeViewer.tsx
import { ScopeData } from "@/lib/tstypes";

type Props = {
  scope: ScopeData;
  className?: string;
};

export default function GenericScopeViewer({ scope, className = "" }: Props) {
  const signals = (scope as any)?.signals ?? {};
  const entries = Object.entries(signals);

  if (!entries.length) {
    return (
      <div className={`text-xs text-muted-foreground ${className}`}>
        No signals in this scope.
      </div>
    );
  }

  return (
    <div className={`text-xs max-h-80 overflow-auto space-y-1 ${className}`}>
      {entries.map(([name, sig]: any) => {
        const latest =
          Array.isArray(sig.values) && sig.values.length
            ? sig.values.at(-1)?.value
            : sig?.value ?? "";

        return (
          <div key={name} className="flex justify-between gap-2">
            <span className="font-mono">{name}</span>
            <span className="font-mono text-right break-all">{latest}</span>
          </div>
        );
      })}
    </div>
  );
}
