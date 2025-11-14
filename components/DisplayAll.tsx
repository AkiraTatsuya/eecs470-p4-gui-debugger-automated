import React from "react";
import { ScopeData } from "@/lib/tstypes";
import DebuggerOutput from "@/components/DebuggerOutput";
import ROBDebugger from "@/components/ROBDebugger";
import RSDebugger from "@/components/RSDebugger";
import FNAFDebugger from "@/components/FNAFDebugger";
import RegfileDebugger from "@/components/RegfileDebugger";
import ShadDebuggerHeader from "@/components/ShadDebuggerHeader";
// import BSDebugger from "@/components/BSDebugger";
import FUDebugger from "@/components/FUDebugger";
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
  const cpu = testbench?.children;
  const Front_End = cpu?.Front_End;
  const verisimpleV = cpu?.verisimpleV;
  
  // Debug logging
  console.log("=== DisplayAll Debug ===");
  console.log("testbench children:", Object.keys(cpu || {}));
  console.log("verisimpleV exists?", !!verisimpleV);
  if (verisimpleV?.children) {
    console.log("verisimpleV children:", Object.keys(verisimpleV.children || {}));
    
    // Based on your server logs, the modules should be named:
    // rb (ROB), prf (Physical Register File), reservationStation, fl (Free List), etc.
    console.log("rb exists?", !!verisimpleV.children?.rb);
    console.log("prf exists?", !!verisimpleV.children?.prf);
    console.log("reservationStation exists?", !!verisimpleV.children?.reservationStation);
    console.log("fl exists?", !!verisimpleV.children?.fl);
    console.log("mt exists?", !!verisimpleV.children?.mt);
    console.log("amt exists?", !!verisimpleV.children?.amt);
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-x-2">
          {/* Commented out debuggers */}
        </div>

        <div className="flex gap-x-2">
          <div className="justify-items-center space-y-4">
            {/* Physical Register File */}
            {verisimpleV?.children?.prf ? (
              <RegfileDebugger
                className=""
                signalRegfile={verisimpleV.children.prf}
              />
            ) : (
              <div className="text-red-500">PRF module not found</div>
            )}
          </div>

          <div className="justify-items-center space-y-4">
            {/* ROB - based on your logs, it should be 'rb' not 'DUT_rob' */}
            {verisimpleV?.children?.rb ? (
              <ROBDebugger 
                className="" 
                signalData={verisimpleV.children.rb} 
              />
            ) : (
              <div className="text-red-500">ROB module not found</div>
            )}
            
            {/* Free List - based on your logs, it should be 'fl' or 'afl' */}
            {verisimpleV?.children?.fl ? (
              <FNAFDebugger
                className=""
                signalFNAF={verisimpleV.children.fl}
              />
            ) : verisimpleV?.children?.afl ? (
              <FNAFDebugger
                className=""
                signalFNAF={verisimpleV.children.afl}
              />
            ) : (
              <div className="text-red-500">Free List module not found</div>
            )}
          </div>

          <div className="justify-items-center space-y-4">
            {/* Reservation Station */}
            {verisimpleV?.children?.reservationStation ? (
              <RSDebugger
                className=""
                signalRS={verisimpleV.children.reservationStation}
                signalSQ={verisimpleV?.children?.DUT_sq}  // This might not exist
              />
            ) : (
              <div className="text-red-500">Reservation Station not found</div>
            )}
            
            <div className="flex gap-x-2">
              {/* These modules might not exist with these names */}
              {/* {verisimpleV?.children?.DUT_branch_stack && (
                // <BSDebugger
                //   className=""
                //   signalBS={verisimpleV.children.DUT_branch_stack}
                // />
              )} */}
              
              {/* Check for various FU module names */}
              {(verisimpleV?.children?.DUT_fu || 
                verisimpleV?.children?.ALU_FU_INST || 
                verisimpleV?.children?.MULT_FU_INST) && (
                <FUDebugger 
                  className="" 
                  signalFU={
                    verisimpleV.children.DUT_fu || 
                    verisimpleV.children.ALU_FU_INST || 
                    verisimpleV.children.MULT_FU_INST
                  } 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* All signals debugger */}
      <div className="space-y-4">
        {cpu && <SignalDebugger className="" signalData={cpu} />}
        <DebuggerOutput className="" signalData={signalData} />
      </div>
    </>
  );
};

export default DisplayAll;