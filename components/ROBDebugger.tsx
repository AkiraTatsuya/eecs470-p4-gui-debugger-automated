// components/ROBDebugger.tsx
import React, { useState } from "react";
import {
  extractSignalValue,
  extractSignalValueToInt,
  parseSimpleROBData,
  SimpleROBEntry,
} from "@/lib/utils";
import { ScopeData } from "@/lib/tstypes";
import { Module, ModuleHeader, ModuleContent } from "./dui/Module";
import { DButton } from "./dui/DButton";
import { Card } from "./dui/Card";
import { SimpleValDisplay } from "./dui/SimpleValDisplay";
import DisplaySimpleROBData from "./DisplaySimpleROBData";

type ROBDebuggerProps = {
  className?: string;
  signalData: ScopeData; // should be the `rb` scope
};

const ROBDebugger: React.FC<ROBDebuggerProps> = ({
  className = "",
  signalData,
}) => {
  // Core scalar fields (all are regs/wires in the rb scope)
  const reset = extractSignalValueToInt(signalData, "reset"); // wire 1 ", reset
  const spots = extractSignalValueToInt(signalData, "spots"); // reg [5:0]
  const full = extractSignalValueToInt(signalData, "full");   // reg 1 %# full
  const head = extractSignalValueToInt(signalData, "dbg_head"); // reg [4:0]
  const tail = extractSignalValueToInt(signalData, "dbg_tail"); // reg [4:0]

  const retire = extractSignalValueToInt(signalData, "retire");           // reg [1:0]
  const squashes = extractSignalValueToInt(signalData, "rob_squashes");   // reg [1:0] if present

  // Entry-related vectors
  const dbg_buf = extractSignalValue(signalData, "dbg_buf")?.value || "";
  const entry_valid =
    extractSignalValue(signalData, "entry_valid")?.value || "";
  const completed_bits =
    extractSignalValue(signalData, "completed_bits")?.value || "";
  const exception_bits =
    extractSignalValue(signalData, "exception_bits")?.value || "";

  const entries: SimpleROBEntry[] = parseSimpleROBData(
    dbg_buf,
    entry_valid,
    completed_bits,
    exception_bits
  );

  const [showROBInternals, setShowROBInternals] = useState(true);

  return (
    <Module className={className}>
      <ModuleHeader label="ROB">
        <SimpleValDisplay label="(Open Spots: " className="pl-3">
          {Number.isNaN(spots) ? "X" : spots}
          {")"}
        </SimpleValDisplay>

        <div className="pl-3 space-x-2">
          <DButton onClick={() => setShowROBInternals((s) => !s)}>
            {showROBInternals ? "Hide ROB Internals" : "Show ROB Internals"}
          </DButton>
        </div>
      </ModuleHeader>

      <ModuleContent className="space-y-2">
        {showROBInternals && (
          <Card className="flex flex-wrap gap-4 text-xs">
            <SimpleValDisplay label="Reset: ">{reset}</SimpleValDisplay>
            <SimpleValDisplay label="Full: ">
              {Number.isNaN(full) ? "X" : full}
            </SimpleValDisplay>
            <SimpleValDisplay label="Open Spots: ">
              {Number.isNaN(spots) ? "X" : spots}
            </SimpleValDisplay>
            <SimpleValDisplay label="Retire: ">
              {Number.isNaN(retire) ? "X" : retire}
            </SimpleValDisplay>
            <SimpleValDisplay label="Squashes: ">
              {Number.isNaN(squashes) ? "X" : squashes}
            </SimpleValDisplay>
            <SimpleValDisplay label="Head: ">
              {Number.isNaN(head) ? "X" : head}
            </SimpleValDisplay>
            <SimpleValDisplay label="Tail: ">
              {Number.isNaN(tail) ? "X" : tail}
            </SimpleValDisplay>
          </Card>
        )}

        <DisplaySimpleROBData entries={entries} head={head} tail={tail} />
      </ModuleContent>
    </Module>
  );
};

export default ROBDebugger;
