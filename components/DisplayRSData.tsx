import React from "react";
import * as Types from "@/lib/types";
import { ScopeData } from "@/lib/tstypes";
import DisplaySingleRS from "./DisplaySingleRS";
import { Card, CardContent, CardHeader } from "./dui/Card";
import {
  extractSignalValue,
  extractSignalValueToBool,
  extractSignalValueToInt,
  parseSQ_DATA_List,
} from "@/lib/utils";

type DisplayRSDataProps = {
  className: string;
  RSData: Types.RS_DATA[];
  EarlyCDB: Types.PHYS_REG_TAG[];
  signalSQ: ScopeData;
};

const DisplayRSData: React.FC<DisplayRSDataProps> = ({
  className,
  RSData,
  EarlyCDB,
  signalSQ,
}) => {
  // Check if signalSQ exists and has the necessary signals
  if (!signalSQ) {
    return (
      <Card className={className}>
        <CardHeader label="RS" className="text-sm no-underline" />
        <CardContent className="mt-1">
          <div>Store Queue signals not available</div>
        </CardContent>
      </Card>
    );
  }

  // SQ - updated signal names to match your VCD structure
  // You'll need to check what your actual SQ signal names are
  const sq_entries_signal = extractSignalValue(signalSQ, "sq_entries")?.value || 
                            extractSignalValue(signalSQ, "entries")?.value || 
                            extractSignalValue(signalSQ, "buffer")?.value || "";
  
  const SQ_entries = parseSQ_DATA_List(sq_entries_signal);
  
  // Try different possible signal names for head
  const SQ_head = extractSignalValueToInt(signalSQ, "head") || 
                  extractSignalValueToInt(signalSQ, "dbg_head") || 
                  extractSignalValueToInt(signalSQ, "heads") || 0;
  
  // Try different possible signal names for empty
  const SQ_empty = extractSignalValueToBool(signalSQ, "empty") ?? false;

  return (
    <>
      <Card className={className}>
        <CardHeader label="RS" className="text-sm no-underline" />
        <CardContent className="mt-1">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-1">
            {RSData.map((rs, idx) => (
              <div key={idx} className="items-center rounded-xl shadow-lg">
                <DisplaySingleRS
                  className=""
                  RSIdx={idx}
                  RSData={rs}
                  EarlyCDB={EarlyCDB}
                  SQ_entries={SQ_entries}
                  SQ_head={SQ_head}
                  SQ_empty={SQ_empty}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DisplayRSData;
