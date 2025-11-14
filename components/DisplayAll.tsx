import React from "react";
import { ScopeData } from "@/lib/tstypes";
import DebuggerOutput from "@/components/DebuggerOutput";
import ROBDebugger from "@/components/ROBDebugger";
import RSDebugger from "@/components/RSDebugger";
import FNAFDebugger from "@/components/FNAFDebugger";
import RegfileDebugger from "@/components/RegfileDebugger";
import ShadDebuggerHeader from "@/components/ShadDebuggerHeader";
import FUDebugger from "@/components/FUDebugger";
import SignalDebugger from "@/components/SignalDebugger";
import { Module, ModuleHeader, ModuleContent } from "@/components/dui/Module";

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
    console.log("fl module:", verisimpleV.children?.fl);
    console.log("mt module:", verisimpleV.children?.mt);
    console.log("amt module:", verisimpleV.children?.amt);
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-x-2">
          {/* First row of debuggers if needed */}
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
            {/* ROB */}
            {verisimpleV?.children?.rb ? (
              <ROBDebugger 
                className="" 
                signalData={verisimpleV.children.rb} 
              />
            ) : (
              <div className="text-red-500">ROB module not found</div>
            )}
            
            {/* Free List + Map Table (Freddy) - Single component */}
            {verisimpleV?.children?.fl ? (
              <FNAFDebugger
                className=""
                signalFNAF={verisimpleV.children.fl}
                signalMT={verisimpleV.children?.mt || verisimpleV.children?.amt}
              />
            ) : (
              <div className="text-red-500">
                <Module className="">
                  <ModuleHeader label="Freddy" />
                  <ModuleContent>
                    <div>Free list module not found</div>
                  </ModuleContent>
                </Module>
              </div>
            )}
          </div>

          <div className="justify-items-center space-y-4">
            {/* Reservation Station */}
            {verisimpleV?.children?.reservationStation ? (
              <RSDebugger
                className=""
                signalRS={verisimpleV.children.reservationStation}
                signalSQ={verisimpleV?.children?.DUT_sq}
              />
            ) : (
              <div className="text-red-500">Reservation Station not found</div>
            )}
            
            <div className="flex gap-x-2">
              {/* Functional Units */}
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