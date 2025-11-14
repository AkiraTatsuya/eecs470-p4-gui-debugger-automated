import React from "react"; // this shit is so broken i wanna die
import { ScopeData } from "@/lib/tstypes";
import { extractSignalValue, parseFreeList, parseReg_Map } from "@/lib/utils";
import { Module, ModuleHeader, ModuleContent } from "./dui/Module";
import DisplayFrizzyList from "./DisplayFrizzyList";
import DisplayMapTable from "./DisplayMapTable";
import { Card } from "./dui/Card";

type FNAFDebuggerProps = {
  className: string;
  signalFNAF: ScopeData;
  signalMT?: ScopeData;  // Optional Map Table module for new structure
};

const FNAFDebugger: React.FC<FNAFDebuggerProps> = ({
  className,
  signalFNAF,
  signalMT,
}) => {
  // Check if we have the module at all
  if (!signalFNAF) {
    return (
      <Module className={className}>
        <ModuleHeader label="Freddy" />
        <ModuleContent>
          <div>Free list module not found</div>
        </ModuleContent>
      </Module>
    );
  }

  let FNAF_free_list: any[] = [];
  let FNAF_ready_bits: any[] = [];
  let FNAF_reg_map: any[] = [];

  // Debug to see what structure we have
  console.log("=== FNAFDebugger Structure Detection ===");
  console.log("signalFNAF children:", signalFNAF.children ? Object.keys(signalFNAF.children) : "none");
  
  // Check if this is the OLD structure (with frizzy_table)
  const hasFrizzyTable = !!(signalFNAF?.children as unknown as ScopeData)?.frizzy_table;
  
  if (hasFrizzyTable) {
    console.log("Detected OLD structure with frizzy_table");
    // OLD STRUCTURE - with nested frizzy_table
    try {
      const signalFrizzy = (signalFNAF?.children as unknown as ScopeData)
        .frizzy_table as unknown as ScopeData;
      
      if (signalFrizzy) {
        const free_list = extractSignalValue(signalFrizzy, "free_list")?.value || "";
        FNAF_free_list = parseFreeList(free_list);
        
        const ready_bits = extractSignalValue(signalFrizzy, "ready_bits")?.value || "";
        FNAF_ready_bits = parseFreeList(ready_bits);
      }
      
      const reg_map = extractSignalValue(signalFNAF, "reg_map")?.value || "";
      FNAF_reg_map = parseReg_Map(reg_map);
    } catch (e) {
      console.error("Error parsing old structure:", e);
    }
  } else {
    console.log("Detected NEW structure without frizzy_table");
    // NEW STRUCTURE - fl module directly
    try {
      // For new structure, use valid_dbg as the free list indicator
      const valid_dbg = extractSignalValue(signalFNAF, "valid_dbg")?.value || "";
      const valid = extractSignalValue(signalFNAF, "valid")?.value || "";
      
      // Use whichever signal is available
      const valid_bits = valid_dbg || valid;
      FNAF_free_list = parseFreeList(valid_bits);
      
      // For ready bits, we might use the same valid bits or a different signal
      // You might need to adjust this based on your actual hardware design
      FNAF_ready_bits = parseFreeList(valid_bits);
      
      // For reg_map, check multiple possible locations
      // 1. Try the current module
      let reg_map = extractSignalValue(signalFNAF, "reg_map")?.value || "";
      
      // 2. If not found and we have a Map Table module, try there
      if (!reg_map && signalMT) {
        reg_map = extractSignalValue(signalMT, "reg_map")?.value || "";
      }
      
      FNAF_reg_map = parseReg_Map(reg_map);
      
      // Debug output
      console.log("New structure - valid_bits found:", !!valid_bits);
      console.log("New structure - reg_map found:", !!reg_map);
    } catch (e) {
      console.error("Error parsing new structure:", e);
    }
  }

  return (
    <Module className={className}>
      <ModuleHeader label="Freddy" />
      <ModuleContent className="">
        <Card className="flex space-x-3 rounded-xl pt-1">
          <DisplayFrizzyList
            className=""
            freeList={FNAF_free_list}
            readyBits={FNAF_ready_bits}
          />
          {FNAF_reg_map && FNAF_reg_map.length > 0 && (
            <DisplayMapTable className="" mapTable={FNAF_reg_map} />
          )}
        </Card>
      </ModuleContent>
    </Module>
  );
};

export default FNAFDebugger;