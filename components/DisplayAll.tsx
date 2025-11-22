// components/DisplayAll.tsx
import React from "react";
import { ScopeData } from "@/lib/tstypes";

import ROBDebugger from "@/components/ROBDebugger";
import SignalDebugger from "@/components/SignalDebugger";
import DebuggerOutput from "@/components/DebuggerOutput";

type DisplayAllProps = {
  className?: string;
  signalData: ScopeData | any;
};

const Maybe = ({ cond, children }: { cond: any; children: React.ReactNode }) =>
  cond ? <>{children}</> : null;

const DisplayAll: React.FC<DisplayAllProps> = ({
  className = "",
  signalData,
}) => {
  if (!signalData) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">
          No signal data loaded yet.
        </p>
      </div>
    );
  }

  const testbench = signalData?.signals?.children?.testbench;
  const verisimpleV = testbench?.children?.verisimpleV;
  const rb = verisimpleV?.children?.rb as ScopeData | undefined;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* ========================== */}
      {/* ROB SECTION                */}
      {/* ========================== */}
      <Maybe cond={rb}>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground/90">
            Reorder Buffer (rb)
          </h2>
          <ROBDebugger
            className="border border-border/20 rounded-lg p-3"
            signalData={rb as ScopeData}
          />
        </div>
      </Maybe>

      {!rb && (
        <div className="text-sm text-red-400">
          Could not find <code>testbench.verisimpleV.rb</code> in the signal
          hierarchy. Use the raw view below to confirm the scope names.
        </div>
      )}

      {/* ========================== */}
      {/* RAW SIGNAL VIEWS           */}
      {/* ========================== */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground/90">
          Raw Signal View
        </h2>

        <Maybe cond={testbench}>
          <SignalDebugger
            className="border border-border/20 rounded-lg p-2"
            signalData={testbench}
          />
        </Maybe>

        <DebuggerOutput
          className="border border-border/20 rounded-lg p-2"
          signalData={signalData}
        />
      </div>
    </div>
  );
};

export default DisplayAll;
