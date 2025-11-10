import React, { useState } from "react";
import { ScopeData } from "@/lib/tstypes";
import { extractSignalValue, parseFreeList, parseReg_Map } from "@/lib/utils";
import { Module, ModuleHeader, ModuleContent } from "./dui/Module";
import DisplayFrizzyList from "./DisplayFrizzyList";
import DisplayMapTable from "./DisplayMapTable";
import { Card } from "./dui/Card";

type FNAFDebuggerProps = {
  className: string;
  signalFNAF: ScopeData;
};

const FNAFDebugger: React.FC<FNAFDebuggerProps> = ({
  className,
  signalFNAF,
}) => {
  // Access the fl (freelist) module directly from signalFNAF
  const signalFL = (signalFNAF?.children as unknown as ScopeData)
    ?.fl as unknown as ScopeData;

  // Check if fl module exists
  if (!signalFL) {
    return (
      <Module className={className}>
        <ModuleHeader label="Freddy" />
        <ModuleContent>
          <div>Free list module not found</div>
        </ModuleContent>
      </Module>
    );
  }

  // Extract signals from the fl module using your new signal names
  const valid_bits = extractSignalValue(signalFL, "valid_dbg")?.value || "";
  const FNAF_free_list = parseFreeList(valid_bits);

  // For ready bits, you might need to use a different signal or derive it
  // If you don't have ready bits in your new structure, you may need to adjust
  // Using valid_dbg for both for now - adjust as needed
  const FNAF_ready_bits = parseFreeList(valid_bits);

  // Extract reg_map from the parent FNAF scope
  const reg_map = extractSignalValue(signalFNAF, "reg_map")?.value || "";
  const FNAF_reg_map = parseReg_Map(reg_map);

  return (
    <>
      <Module className={className}>
        <ModuleHeader label="Freddy" />
        <ModuleContent className="">
          <Card className="flex space-x-3 rounded-xl pt-1">
            <DisplayFrizzyList
              className=""
              freeList={FNAF_free_list}
              readyBits={FNAF_ready_bits}
            />
            <DisplayMapTable className="" mapTable={FNAF_reg_map} />
          </Card>
        </ModuleContent>
      </Module>
    </>
  );
};

export default FNAFDebugger;