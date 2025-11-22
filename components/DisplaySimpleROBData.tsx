import React from "react";
import { SimpleROBEntry, cn } from "@/lib/utils";

type Props = {
  className?: string;
  entries: SimpleROBEntry[];
  head: number;
  tail: number;
};

const DisplaySimpleROBData: React.FC<Props> = ({
  className,
  entries,
  head,
  tail,
}) => {
  return (
    <div
      className={cn(
        "text-xs bg-card/60 rounded-xl overflow-hidden border border-border/30",
        className
      )}
    >
      {/* Header row */}
      <div className="grid grid-cols-[40px,1fr,56px,56px,64px,60px] border-b border-border/40 bg-muted/40 px-2 py-1 font-semibold">
        <span>#</span>
        <span>Entry Bits</span>
        <span className="text-center">Valid</span>
        <span className="text-center">Done</span>
        <span className="text-center">Except</span>
        <span className="text-center">H/T</span>
      </div>

      {/* Rows */}
      <div className="max-h-[420px] overflow-y-auto">
        {entries.map((e) => {
          const isHead = e.index === head;
          const isTail = e.index === tail;

          let rowBg = "bg-background/40";
          if (isHead && isTail) rowBg = "bg-sky-900/40";
          else if (isHead) rowBg = "bg-emerald-900/50";
          else if (isTail) rowBg = "bg-red-900/40";
          else if (e.valid === "1") rowBg = "bg-amber-900/30";

          const htLabel =
            isHead && isTail
              ? "Head/Tail"
              : isHead
              ? "Head"
              : isTail
              ? "Tail"
              : "";

          const fmtBits =
            e.rawBits.length > 40
              ? `${e.rawBits.slice(0, 16)}…${e.rawBits.slice(-8)}`
              : e.rawBits || "—";

          return (
            <div
              key={e.index}
              className={cn(
                "grid grid-cols-[40px,1fr,56px,56px,64px,60px] px-2 py-[3px] border-b border-border/20",
                rowBg
              )}
            >
              <span className="font-mono text-[11px]">{e.index}:</span>
              <span
                className="font-mono text-[10px] truncate"
                title={e.rawBits}
              >
                {fmtBits}
              </span>
              <span className="text-center">{e.valid}</span>
              <span className="text-center">{e.completed}</span>
              <span className="text-center">{e.exception}</span>
              <span className="text-center text-[11px]">{htLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DisplaySimpleROBData;
