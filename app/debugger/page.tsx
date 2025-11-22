// app/debugger/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DisplayContextProvider } from "@/components/DisplayContext";
import DisplayAll from "@/components/DisplayAll";
import ShadDebuggerHeader from "@/components/ShadDebuggerHeader";
import { useConstantsStore } from "@/lib/constants-store";

export default function Debugger() {
  const [currentCycle, setCurrentCycle] = useState(0);
  const [isNegativeEdge, setIsNegativeEdge] = useState(false);
  const [includeNegativeEdges, setIncludeNegativeEdges] = useState(false);
  const [negedgeAllowed, setNegedgeAllowed] = useState(false);
  const [maxCycle, setMaxCycle] = useState(0);
  const [jumpCycle, setJumpCycle] = useState("");
  const [headerInfo, setHeaderInfo] = useState<any>(null);
  const [signalData, setSignalData] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "n":
          handleNextCycle();
          break;
        case "m":
          handleNext10Cycles();
          break;
        case "b":
          handlePreviousCycle();
          break;
        case "v":
          handlePrevious10Cycles();
          break;
        case "c":
          // handleStart();
          break;
        case ",":
          handleEnd();
          break;
        case "j":
          document.getElementById("jumpCycleInput")?.focus();
          break;
        case "t":
          if (negedgeAllowed) {
            setIncludeNegativeEdges((prev) => !prev);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCycle, maxCycle, isNegativeEdge, includeNegativeEdges, negedgeAllowed]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleJumpToCycle();
    }
  };

  const fetchSignalData = async (cycle: number, edge: "pos" | "neg") => {
    try {
      const response = await fetch(`/api/get_signals/${cycle}/${edge}`);
      if (!response.ok) {
        throw new Error("Failed to fetch signal data");
      }
      const data = await response.json();
      setSignalData(data);
    } catch (error) {
      console.error("Error fetching signal data:", error);
    }
  };

  useEffect(() => {
    const headerInfoParam = searchParams.get("headerInfo");
    if (headerInfoParam) {
      const parsedHeaderInfo = JSON.parse(headerInfoParam);
      setHeaderInfo(parsedHeaderInfo);
      setMaxCycle(parsedHeaderInfo.num_cycles - 1 || 0);
      setNegedgeAllowed(parsedHeaderInfo.include_negedge as boolean);
    }

    fetchSignalData(0, "pos");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleNextCycle = () => {
    if (includeNegativeEdges) {
      if (!isNegativeEdge) {
        setIsNegativeEdge(true);
        fetchSignalData(currentCycle, "neg");
      } else {
        const next = Math.min(currentCycle + 1, maxCycle);
        setIsNegativeEdge(false);
        setCurrentCycle(next);
        fetchSignalData(next, "pos");
      }
    } else {
      const next = Math.min(currentCycle + 1, maxCycle);
      setCurrentCycle(next);
      setIsNegativeEdge(false);
      fetchSignalData(next, "pos");
    }
  };

  const handleNext10Cycles = () => {
    if (includeNegativeEdges) {
      if (!isNegativeEdge) {
        setIsNegativeEdge(true);
        fetchSignalData(currentCycle, "neg");
      } else {
        const next = Math.min(currentCycle + 10, maxCycle);
        setIsNegativeEdge(false);
        setCurrentCycle(next);
        fetchSignalData(next, "pos");
      }
    } else {
      const next = Math.min(currentCycle + 10, maxCycle);
      setCurrentCycle(next);
      setIsNegativeEdge(false);
      fetchSignalData(next, "pos");
    }
  };

  const handlePreviousCycle = () => {
    if (includeNegativeEdges) {
      if (isNegativeEdge) {
        setIsNegativeEdge(false);
        fetchSignalData(currentCycle, "pos");
      } else if (currentCycle > 0 || (currentCycle === 0 && isNegativeEdge)) {
        const prev = Math.max(currentCycle - 1, -1);
        setIsNegativeEdge(true);
        setCurrentCycle(prev);
        fetchSignalData(prev, "neg");
      }
    } else {
      const prev = Math.max(currentCycle - 1, 0);
      setCurrentCycle(prev);
      setIsNegativeEdge(false);
      fetchSignalData(prev, "pos");
    }
  };

  const handlePrevious10Cycles = () => {
    if (includeNegativeEdges) {
      if (isNegativeEdge) {
        setIsNegativeEdge(false);
        fetchSignalData(currentCycle, "pos");
      } else if (currentCycle > 0 || (currentCycle === 0 && isNegativeEdge)) {
        const prev = Math.max(currentCycle - 10, -1);
        setIsNegativeEdge(true);
        setCurrentCycle(prev);
        fetchSignalData(prev, "neg");
      }
    } else {
      const prev = Math.max(currentCycle - 10, 0);
      setCurrentCycle(prev);
      setIsNegativeEdge(false);
      fetchSignalData(prev, "pos");
    }
  };

  const handleStart = () => {
    setCurrentCycle(0);
    setIsNegativeEdge(false);
    fetchSignalData(0, "pos");
  };

  const handleEnd = () => {
    setCurrentCycle(maxCycle);
    setIsNegativeEdge(includeNegativeEdges);
    fetchSignalData(maxCycle, includeNegativeEdges ? "neg" : "pos");
  };

  const handleJumpToCycle = () => {
    const cycle = parseInt(jumpCycle);
    if (!isNaN(cycle)) {
      const boundedCycle = Math.max(-1, Math.min(cycle, maxCycle));
      setCurrentCycle(boundedCycle);
      setIsNegativeEdge(false);
      setJumpCycle("");
      fetchSignalData(boundedCycle, "pos");
    }
  };

  const [hasRunAutoDetect, setHasRunAutoDetect] = useState(false);
  const { autoDetectConstants } = useConstantsStore();

  useEffect(() => {
    if (signalData && !hasRunAutoDetect) {
      autoDetectConstants(signalData);
      setHasRunAutoDetect(true);
    }
  }, [signalData, hasRunAutoDetect, autoDetectConstants]);

  const testbench = signalData?.signals.children.testbench;

  const verilogCycle = testbench?.children?.clock_count?.value
    ? parseInt(testbench.children.clock_count.value.slice(1), 2)
    : undefined;

  return (
  <DisplayContextProvider signalData={signalData}>
    <div className="min-h-screen w-full bg-background
        bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent)]
        text-foreground">

      {/* FULL-WIDTH FLEX LAYOUT */}
      <div className="w-full px-6 py-6">

        {/* MAIN PANEL — full width but with rounded edges */}
        <div className="w-full rounded-2xl border border-border/40 
          bg-card/40 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.50)]
          overflow-hidden">

          {/* HEADER */}
          <ShadDebuggerHeader
            signalData={signalData}
            verilogCycle={verilogCycle}
            currentCycle={currentCycle}
            negEgdesAvailable={headerInfo?.include_negedge as boolean}
            isNegativeEdge={isNegativeEdge}
            includeNegativeEdges={includeNegativeEdges}
            setIncludeNegativeEdges={setIncludeNegativeEdges}
            negedgeAllowed={negedgeAllowed}
            maxCycle={maxCycle}
            jumpCycle={jumpCycle}
            setJumpCycle={setJumpCycle}
            handleStart={handleStart}
            handlePreviousCycle={handlePreviousCycle}
            handlePrevious10Cycles={handlePrevious10Cycles}
            handleNextCycle={handleNextCycle}
            handleNext10Cycles={handleNext10Cycles}
            handleEnd={handleEnd}
            handleJumpToCycle={handleJumpToCycle}
            handleKeyDown={handleKeyDown}
          />

          {/* SIGNAL DISPLAY */}
          <div className="p-6">
            {signalData && (
              <DisplayAll className="w-full" signalData={signalData} />
            )}
          </div>
        </div>
      </div>
    </div>
  </DisplayContextProvider>
);
}
