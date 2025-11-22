// components/DisplayAll.tsx
import React from "react";
import DebuggerOutput from "@/components/DebuggerOutput";

type DisplayAllProps = {
  className?: string;
  signalData: {
    cycle: string;
    endpoint: string;
    signals: {
      children: any;
    };
  } | null;
};

const DisplayAll: React.FC<DisplayAllProps> = ({
  className = "",
  signalData,
}) => {
  if (!signalData) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <div className="text-lg font-medium text-gray-600 dark:text-gray-400">
              No signal data loaded
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Upload a VCD file or connect to the debugger to view signals
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <DebuggerOutput 
        signalData={signalData} 
        className="w-full"
      />
    </div>
  );
};

export default DisplayAll;