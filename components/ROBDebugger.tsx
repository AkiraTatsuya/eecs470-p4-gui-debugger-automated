import React, { useState } from "react";
import {
  extractSignalValue,
  extractSignalValueToInt,
  parseROBData,
  parseCDBTags,
} from "@/lib/utils";
import { ScopeData } from "@/lib/tstypes";
import DisplayROBData from "./DisplayROBData";
import { Module, ModuleHeader, ModuleContent } from "./dui/Module";
import { DButton } from "./dui/DButton";
import { Card } from "./dui/Card";
import { SimpleValDisplay } from "./dui/SimpleValDisplay";

type ROBDebuggerProps = {
  className: string;
  signalData: ScopeData;
};

const ROBDebugger: React.FC<ROBDebuggerProps> = ({ className, signalData }) => {
  const write_data = extractSignalValue(signalData, "write_data")?.value || "";
  const ROB_dispatched_ins = parseROBData(write_data);
  
  const complete_inst = extractSignalValue(signalData, "complete_inst")?.value || "";
  const ROB_cdb = parseCDBTags(complete_inst);

  // internal signals - updated to match your VCD signal names
  const reset = extractSignalValueToInt(signalData, "reset");
  const head = extractSignalValueToInt(signalData, "dbg_head");
  const tail = extractSignalValueToInt(signalData, "dbg_tail");
  const available_spots = extractSignalValueToInt(signalData, "spots");
  
  // pure internal signals
  const head_n = extractSignalValueToInt(signalData, "head_n");
  const tail_n = extractSignalValueToInt(signalData, "tail_n");
  const full = extractSignalValueToInt(signalData, "full");
  const retire = extractSignalValueToInt(signalData, "retire");

  // entries - updated to match your VCD signal names
  const entries = extractSignalValue(signalData, "dbg_buf")?.value || "";
  const ROB_entries = parseROBData(entries);

  // State to control visibility of stuff
  const [showROBInternals, setShowROBInternals] = useState(false);
  const [showROBInputs, setShowROBInputs] = useState(true);

  return (
    <>
      <Module className={className}>
        <ModuleHeader label="ROB">
          <SimpleValDisplay label="(Avail. Spots: " className="pl-3">
            {Number.isNaN(available_spots) ? "X" : available_spots}
            {")"}
          </SimpleValDisplay>

          {/* Toggle buttons */}
          <div className="pl-3 space-x-2">
            <DButton onClick={() => setShowROBInputs(!showROBInputs)}>
              {showROBInputs ? "Hide ROB Inputs" : "Show ROB Inputs"}
            </DButton>
            <DButton onClick={() => setShowROBInternals(!showROBInternals)}>
              {showROBInternals ? "Hide ROB Internals" : "Show ROB Internals"}
            </DButton>
          </div>
        </ModuleHeader>

        <ModuleContent className="space-y-2 ">
          {/* display inputs */}
          {showROBInputs && (
            <Card>
              <p className="font-semibold">Dispatched Instructions</p>
              <DisplayROBData
                className="shadow-none p-0"
                ROBData={ROB_dispatched_ins}
                head={-1}
                tail={-1}
                isROB={false}
              />
            </Card>
          )}

          {/* display ROB internals */}
          {showROBInternals && (
            <Card className="flex space-x-4">
              <div>
                <SimpleValDisplay label="Retire Count: ">
                  {retire}
                </SimpleValDisplay>
              </div>

              <SimpleValDisplay label="Full: ">{full}</SimpleValDisplay>

              <div>
                <SimpleValDisplay label="Next Head: ">
                  {head_n}
                </SimpleValDisplay>

                <SimpleValDisplay label="Next Tail: ">
                  {tail_n}
                </SimpleValDisplay>
              </div>
            </Card>
          )}

          {/* display ROB entries */}
          <DisplayROBData
            className=""
            ROBData={ROB_entries}
            head={head}
            tail={tail}
            isROB={true}
          />

          {/* output signals */}
        </ModuleContent>
      </Module>
    </>
  );
};

export default ROBDebugger;