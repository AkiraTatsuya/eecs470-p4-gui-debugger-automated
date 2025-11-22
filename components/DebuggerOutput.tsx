import React, { useState, useMemo, useEffect } from "react";
import { 
  Cpu, 
  Clock, 
  Database, 
  GitBranch, 
  Package, 
  Settings, 
  Search, 
  Copy, 
  CheckCircle,
  X,
  Eye,
  Download,
  Activity,
  Maximize2
} from "lucide-react";

type SignalType = {
  sigType: string;
  width: number;
};

type SignalData = {
  name: string;
  type: SignalType;
  value: string;
};

type ScopeData = {
  [key: string]: SignalData | { children: ScopeData };
};

type DebuggerOutputProps = {
  className?: string;
  signalData: {
    cycle: string;
    endpoint: string;
    signals: {
      children: ScopeData;
    };
  } | null;
  currentCycle?: number;
  verilogCycle?: number;
};

const DisplayFormat = {
  HEX: "HEX",
  BINARY: "BINARY",
  DECIMAL: "DECIMAL",
} as const;

// Flatten nested structure into modules
type FlatModule = {
  name: string;
  path: string[];
  signals: SignalData[];
  signalCount: number;
};

// Format value helper
const formatValue = (value: string, format: keyof typeof DisplayFormat, width: number = 32) => {
  try {
    const numValue = BigInt("0b" + value);
    
    if (format === DisplayFormat.HEX) {
      const hexStr = numValue.toString(16).toUpperCase();
      const padLength = Math.ceil(width / 4);
      return "0x" + hexStr.padStart(padLength, "0");
    } else if (format === DisplayFormat.DECIMAL) {
      return numValue.toString();
    } else {
      // Binary format with spacing every 4 bits
      const chunks = [];
      for (let i = value.length; i > 0; i -= 4) {
        chunks.unshift(value.substring(Math.max(0, i - 4), i));
      }
      return chunks.join(" ");
    }
  } catch {
    return value;
  }
};

// Modal Component for detailed module view
const ModuleModal: React.FC<{
  moduleName: string | null;
  currentModule: FlatModule | null;
  isOpen: boolean;
  onClose: () => void;
  displayFormat: keyof typeof DisplayFormat;
  onFormatChange: (format: keyof typeof DisplayFormat) => void;
  currentCycle?: number | string;
  verilogCycle?: number;
}> = ({ moduleName, currentModule, isOpen, onClose, displayFormat, onFormatChange, currentCycle, verilogCycle }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedSignal, setCopiedSignal] = useState<string | null>(null);
  
  // Reset search when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setCopiedSignal(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !currentModule) return null;

  const filteredSignals = currentModule.signals.filter(signal =>
    signal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signal.value.includes(searchTerm)
  );

  const handleCopy = (signal: SignalData) => {
    const formattedValue = formatValue(signal.value, displayFormat, signal.type?.width);
    navigator.clipboard.writeText(formattedValue);
    setCopiedSignal(signal.name);
    setTimeout(() => setCopiedSignal(null), 2000);
  };

  const handleCopyAll = () => {
    const allValues = filteredSignals.map(signal => 
      `${signal.name}: ${formatValue(signal.value, displayFormat, signal.type?.width)}`
    ).join('\n');
    navigator.clipboard.writeText(allValues);
  };

  const handleExport = () => {
    const data = filteredSignals.map(signal => ({
      name: signal.name,
      width: signal.type?.width || 1,
      value: formatValue(signal.value, displayFormat, signal.type?.width),
      cycle: currentCycle || 'unknown'
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentModule.name}_signals_cycle_${currentCycle || 'unknown'}.json`;
    a.click();
  };

  return (
    <>
      {/* Backdrop - lower z-index than header */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Full-screen Modal - positioned below header */}
      <div className="fixed top-16 left-2 right-2 bottom-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-40 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              {getModuleIcon(currentModule.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {currentModule.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentModule.signalCount} signals • Path: {currentModule.path.join(' / ')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyAll}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Copy all values"
            >
              Copy All
            </button>
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Export as JSON"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Controls Bar */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/25">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search signals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            {searchTerm && (
              <div className="absolute right-3 top-2.5 text-xs text-gray-500">
                {filteredSignals.length} / {currentModule.signalCount}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Format:</span>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {Object.entries(DisplayFormat).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => onFormatChange(value)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    displayFormat === value 
                      ? 'bg-white dark:bg-gray-700 shadow-sm' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Signal Table - Full Screen */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="min-w-full">
            <table className="w-full">
              <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 pr-8 text-sm font-semibold text-gray-700 dark:text-gray-300 w-2/5">
                    Signal Name
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 w-24">
                    Width
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1">
                    Value
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredSignals.map((signal, index) => (
                  <tr 
                    key={signal.name}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 pr-8">
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {signal.name}
                      </span>
                    </td>
                    <td className="text-center px-4 py-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        [{signal.type?.width || 1}]
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md break-all">
                          {formatValue(signal.value, displayFormat, signal.type?.width)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pl-2">
                      <button
                        onClick={() => handleCopy(signal)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Copy value"
                      >
                        {copiedSignal === signal.name ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredSignals.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg">No signals found matching "{searchTerm}"</p>
                <p className="text-sm mt-2">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Icon mapping
const getModuleIcon = (moduleName: string) => {
  const name = moduleName.toLowerCase();
  if (name.includes("clock")) return <Clock className="w-4 h-4" />;
  if (name.includes("branch")) return <GitBranch className="w-4 h-4" />;
  if (name.includes("reg")) return <Database className="w-4 h-4" />;
  if (name.includes("mem")) return <Database className="w-4 h-4" />;
  if (name.includes("fetch")) return <Package className="w-4 h-4" />;
  if (name.includes("pc") || name.includes("alu")) return <Cpu className="w-4 h-4" />;
  if (name.includes("decoder")) return <Settings className="w-4 h-4" />;
  if (name.includes("cdbarb")) return <Activity className="w-4 h-4" />;
  return <Settings className="w-4 h-4" />;
};

const flattenModules = (scope: ScopeData, path: string[] = []): FlatModule[] => {
  const modules: FlatModule[] = [];
  const signals: SignalData[] = [];
  
  Object.entries(scope).forEach(([key, value]) => {
    if ("children" in value) {
      const subModules = flattenModules(value.children, [...path, key]);
      modules.push(...subModules);
    } else {
      signals.push(value as SignalData);
    }
  });
  
  if (signals.length > 0 && path.length > 0) {
    modules.unshift({
      name: path[path.length - 1],
      path: path,
      signals: signals,
      signalCount: signals.length
    });
  }
  
  return modules;
};

// Module Grid Card Component
const ModuleCard: React.FC<{
  module: FlatModule;
  onClick: () => void;
}> = ({ module, onClick }) => {
  return (
    <div 
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 
        hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-600 
        cursor-pointer transition-all duration-200 
        bg-white dark:bg-gray-900 group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getModuleIcon(module.name)}
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {module.name}
          </h3>
        </div>
        <Maximize2 className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {module.signalCount} signals
      </p>
      
      {/* Signal Preview */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-2 space-y-1">
        {module.signals.slice(0, 3).map(signal => (
          <div key={signal.name} className="flex justify-between items-center text-xs">
            <span className="text-gray-600 dark:text-gray-400 truncate max-w-[70%]">
              {signal.name}
            </span>
            <span className="font-mono text-gray-500 dark:text-gray-500">
              [{signal.type?.width || 1}]
            </span>
          </div>
        ))}
        {module.signals.length > 3 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic pt-1">
            +{module.signals.length - 3} more signals
          </p>
        )}
      </div>
    </div>
  );
};

const DebuggerOutput: React.FC<DebuggerOutputProps> = ({
  signalData,
  className = "",
  currentCycle,
  verilogCycle
}) => {
  const [displayFormat, setDisplayFormat] = useState<keyof typeof DisplayFormat>(DisplayFormat.BINARY);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedModuleName, setSelectedModuleName] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const flatModules = useMemo(() => {
    if (!signalData) return [];
    return flattenModules(signalData.signals.children);
  }, [signalData]);

  const filteredModules = useMemo(() => {
    if (!globalSearch) return flatModules;
    const searchLower = globalSearch.toLowerCase();
    return flatModules.filter(module => 
      module.name.toLowerCase().includes(searchLower) ||
      module.signals.some(signal => 
        signal.name.toLowerCase().includes(searchLower)
      )
    );
  }, [flatModules, globalSearch]);

  const currentSelectedModule = useMemo(() => {
    if (!selectedModuleName) return null;
    return flatModules.find(m => m.name === selectedModuleName) || null;
  }, [flatModules, selectedModuleName]);

  const totalSignals = useMemo(() => 
    flatModules.reduce((acc, m) => acc + m.signalCount, 0), 
    [flatModules]
  );

  if (!signalData) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading signal data...</div>
      </div>
    );
  }

  const handleModuleClick = (module: FlatModule) => {
    setSelectedModuleName(module.name);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedModuleName(null), 300);
  };

  // Always pass currentCycle directly to modal - it will update live
  return (
    <div className={`${className}`}>
      <ModuleModal
        moduleName={selectedModuleName}
        currentModule={currentSelectedModule}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        displayFormat={displayFormat}
        onFormatChange={setDisplayFormat}
        currentCycle={currentCycle}  // This will update as you navigate
        verilogCycle={verilogCycle}
      />

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Signal Modules
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {flatModules.length} modules • {totalSignals} signals • Cycle {currentCycle !== undefined ? currentCycle : signalData.cycle}
          </p>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search modules or signals..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
              bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch("")}
              className="absolute right-2 top-2 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredModules.map((module) => (
          <ModuleCard
            key={module.name}
            module={module}
            onClick={() => handleModuleClick(module)}
          />
        ))}
      </div>
      
      {filteredModules.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No modules found matching "{globalSearch}"</p>
        </div>
      )}
    </div>
  );
};

export default DebuggerOutput;