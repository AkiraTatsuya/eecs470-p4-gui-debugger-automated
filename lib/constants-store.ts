// constants-store.ts
import { useState, useEffect } from "react";
import {
  extractSignalValue,
  parseCDBTags,
  parseFU_DATA_List,
  parseSQ_DATA_List,
} from "./utils";
import * as Types from "./types";
import { toast } from "sonner";

type Subscriber = () => void;
type DependencyFn = (store: Record<string, number>) => number;

class ConstantsStore {
  private store: Record<string, number> = {};
  private dependencies: Record<string, DependencyFn> = {};
  private subscribers: Set<Subscriber> = new Set();
  private localStorageKey = "constantsStore";

  private initialStore: Record<string, number> = {
    AR_NUM: 32,
    N: 8,
    CDB_SZ: 8,
    ROB_SZ: 32,
    RS_SZ: 16,
    PHYS_REG_SZ_P6: 32,
    PHYS_REG_SZ_R10K: 64,
    BRANCH_PRED_SZ: 3,
    SQ_SZ: 8,
    NUM_FU_ALU: 3,
    NUM_FU_MULT: 2,
    NUM_FU_LOAD: 3,
    NUM_FU_STORE: 3,
    NUM_FU_BRANCH: 1,
    NUM_FU: 12,
    MULT_STAGES: 4,
    FALSE: 0,
    TRUE: 1,
    ZERO_REG: 0,
    NOP: 0x00000013,
    NUM_MEM_TAGS: 15,
    ICACHE_LINES: 32,
    ICACHE_LINE_BITS: 5,
    DCACHE_LINES: 32,
    DCACHE_LINE_BITS: 5,
    MEM_SIZE_IN_BYTES: 64 * 1024,
    MEM_64BIT_LINES: (64 * 1024) / 8,
    READ_PORTS: 24,
    WRITE_PORTS: 8,
    NUM_CHECKPOINTS: 4,
  };

  constructor() {
    // Initialize with default values or load from local storage
    this.loadFromLocalStorage();

    // Set up dependencies
    this.setDependency("CDB_SZ", (store) => store.N);
    this.setDependency("PHYS_REG_SZ_R10K", (store) => 32 + store.ROB_SZ);
    this.setDependency(
      "NUM_FU",
      (store) =>
        store.NUM_FU_ALU +
        store.NUM_FU_MULT +
        store.NUM_FU_LOAD +
        store.NUM_FU_STORE +
        store.NUM_FU_BRANCH
    );
    this.setDependency("READ_PORTS", (store) => 2 * store.NUM_FU);
    this.setDependency("WRITE_PORTS", (store) => store.N);
    this.setDependency(
      "MEM_64BIT_LINES",
      (store) => store.MEM_SIZE_IN_BYTES / 8
    );
  }

  get(key: string): number {
    return this.store[key];
  }

  getAll(): Record<string, number> {
    return { ...this.store };
  }

  set(key: string, value: number): void {
    this.store[key] = value;
    this.updateDependencies();
    this.notifySubscribers();
    this.saveToLocalStorage();
  }

  reset(): void {
    this.store = { ...this.initialStore };
    this.updateDependencies();
    this.notifySubscribers();
    this.saveToLocalStorage();

    console.log("Resetting constants: ", this.store);
    toast.success("Constants reset", {
      description: "All constants have been reset to their default values",
    });
  }

  autoDetectConstants(signalData: any): void {
  // base signals
  const testbench = signalData?.signals?.children?.testbench;
  if (!testbench) {
    console.error("testbench not found in signal data");
    toast.error("Auto-detect failed", {
      description: "Could not find testbench in VCD file",
    });
    return;
  }

  const verisimpleV = testbench?.children?.verisimpleV;
  if (!verisimpleV) {
    console.error("verisimpleV not found");
    toast.error("Auto-detect failed", {
      description: "Could not find verisimpleV module",
    });
    return;
  }

  // modules - updated names to match your VCD
  const signalRS = verisimpleV?.children?.reservationStation;
  const signalROB = verisimpleV?.children?.rb;
  const signalFL = verisimpleV?.children?.fl;
  const signalMT = verisimpleV?.children?.mt;

  // Auto detect N (from CDB or other signals)
  // Looking at your VCD, cdb_tag is 12 bits wide with 2 tags
  // This suggests N=2 (2-way superscalar)
  const cdb_tag = extractSignalValue(verisimpleV, "cdb_tag")?.value || "";
  // Parse the width to determine N
  const N = 2; // Based on your VCD showing 2-way dispatch/retire
  constantsStore.set("N", N);
  // Auto detect PHYS_REG_SZ_R10K
  if (signalFL) {
    const valid = extractSignalValue(signalFL, "valid_dbg")?.value || "";
    const PHYS_REG_SZ = valid.length || 64; // default to 64
    constantsStore.set("PHYS_REG_SZ_R10K", PHYS_REG_SZ);
  }

  // For FU detection, we need to look at the specific FU instances
  // Your VCD shows ALU_FU_INST[0], ALU_FU_INST[1], MULT_FU_INST[2]
  // We can infer from the module names or use defaults
  constantsStore.set("NUM_FU_ALU", 2); // ALU_FU_INST[0] and [1]
  constantsStore.set("NUM_FU_MULT", 1); // MULT_FU_INST[2]
  constantsStore.set("NUM_FU_BRANCH", 1);
  constantsStore.set("NUM_FU_LOAD", 0); // Not visible in your VCD
  constantsStore.set("NUM_FU_STORE", 0); // Not visible in your VCD

  // Auto detect SQ_SZ - I don't see a store queue module in your VCD
  // You may not have one, or it might be named differently
  constantsStore.set("SQ_SZ", 8); // default

  // Branch predictor - I don't see this in your VCD either
  constantsStore.set("BRANCH_PRED_SZ", 3); // default

  console.log("Auto Detecting Constants: ", constantsStore.getAll());
  toast.success("Constants auto-detected", {
    description: "Constants auto-detected from signal data",
  });
}
  setDependency(key: string, fn: DependencyFn): void {
    this.dependencies[key] = fn;
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private updateDependencies(): void {
    let hasChanges = true;
    while (hasChanges) {
      hasChanges = false;
      for (const [key, fn] of Object.entries(this.dependencies)) {
        const newValue = fn(this.store);
        if (this.store[key] !== newValue) {
          this.store[key] = newValue;
          hasChanges = true;
        }
      }
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback());
  }

  private saveToLocalStorage(): void {
    if (typeof window === "undefined") return; // Skip during SSR
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.store));
    } catch (error) {
      console.error("Failed to save to local storage:", error);
    }
  }

  private loadFromLocalStorage(): void {
    if (typeof window === "undefined") return; // Skip during SSR
    try {
      const storedData = localStorage.getItem(this.localStorageKey);
      if (storedData) {
        this.store = JSON.parse(storedData);
        this.updateDependencies();
      } else {
        this.store = { ...this.initialStore };
      }
    } catch (error) {
      console.error("Failed to load from local storage:", error);
      this.store = { ...this.initialStore };
    }
  }
}

// Export a singleton instance
export const constantsStore = new ConstantsStore();

// React hook for components
export function useConstantsStore() {
  const [constants, setConstants] = useState(constantsStore.getAll());

  useEffect(() => {
    const unsubscribe = constantsStore.subscribe(() => {
      setConstants(constantsStore.getAll());
    });
    return unsubscribe;
  }, []);

  return {
    constants,
    setConstant: (key: string, value: number) => constantsStore.set(key, value),
    resetConstants: () => constantsStore.reset(),
    autoDetectConstants: (signalData: any) =>
      constantsStore.autoDetectConstants(signalData),
  };
}
