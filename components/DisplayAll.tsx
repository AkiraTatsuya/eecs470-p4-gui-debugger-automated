import React from "react";
import { ScopeData } from "@/lib/tstypes";
import DebuggerOutput from "@/components/DebuggerOutput";
// import ROBDebugger from "@/components/ROBDebugger";
// import RSDebugger from "@/components/RSDebugger";
// import FNAFDebugger from "@/components/FNAFDebugger";
// import RegfileDebugger from "@/components/RegfileDebugger";
// import ShadDebuggerHeader from "@/components/ShadDebuggerHeader";
// import BSDebugger from "@/components/BSDebugger";
// import FUDebugger from "@/components/FUDebugger";
// import IBDebugger from "@/components/IBDebugger";
// import BPredDebugger from "@/components/BPredDebugger";
import SignalDebugger from "@/components/SignalDebugger";
// import I$Debugger from "@/components/I$Debugger";
// import MemDebugger from "@/components/MemDebugger";
// import SQDebugger from "@/components/SQDebugger";
// import D$Debugger from "@/components/D$Debugger";

type DisplayAllProps = {
  className: string;
  signalData: any;
};

const DisplayAll: React.FC<DisplayAllProps> = ({ className, signalData }) => {
  const testbench = signalData?.signals.children.testbench;
  const cpu = testbench?.children.mustafa;
  const Front_End = cpu?.children.Front_End;
  const OoO_Core = cpu?.children.OoO_Core;

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-x-2">
          </div>
        </div>

      {/* all signals */}
      <div className="space-y-4">
        <SignalDebugger className="" signalData={testbench.children} />
        <DebuggerOutput className="" signalData={signalData} />
      </div>
    </>
  );
};

export default DisplayAll;
