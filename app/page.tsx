"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useConstantsStore } from "@/lib/constants-store";
import { Label } from "@/components/ui/label";
import { DestructiveSwitch } from "@/components/ui/switch";

export default function Home() {
  const [localFilename, setLocalFilename] = useState("");
  const [includeNegativeEdges, setIncludeNegativeEdges] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { resetConstants } = useConstantsStore();

  const handleParseLocalFile = async () => {
    if (!localFilename) {
      alert("Kindly provide a local filename before proceeding.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/parse_local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localFilename, includeNegativeEdges }),
      });

      const data = await response.json();

      router.push(
        `/debugger?headerInfo=${encodeURIComponent(JSON.stringify(data))}`
      );
    } catch (error) {
      console.error("Error parsing local file:", error);
      toast.error("Unable to parse local file", {
        description:
          "Something appears to have gone awry whilst parsing the specified file.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card/50 flex items-center justify-center">
      <div className="bg-background p-8 rounded-lg shadow-md m-10 w-full max-w-4xl">
        <div className="flex items-center justify-center gap-x-9 mb-6">
          <Image
            src="/image.png"
            alt="royal emblem"
            width={80}
            height={80}
            className="rounded-lg"
          />

          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl font-bold text-center">
              Coronado Island Debugger
            </h1>

            <Button
              variant="destructive"
              size="sm"
              className="ml-3 text-sm"
              onClick={() => {
                resetConstants();
                toast.success("Constants Restored", {
                  description:
                    "All constants have been returned to their original, proper state.",
                });
              }}
            >
              Reset Constants
            </Button>

            <div className="flex flex-col items-center justify-center">
              <Label
                htmlFor="include-negedges"
                className="text-[12px] text-muted-foreground underline-fade mb-1"
              >
                Include Negedges
              </Label>
              <DestructiveSwitch
                id="include-negedges"
                checked={includeNegativeEdges}
                onCheckedChange={setIncludeNegativeEdges}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 w-full">
          <label
            htmlFor="localFilename"
            className="block text-sm font-medium mb-2"
          >
            Local VCD filename (by royal decree):
          </label>

          <Input
            id="localFilename"
            type="text"
            name="localFilename"
            value={localFilename}
            onChange={(e) => setLocalFilename(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleParseLocalFile();
              }
            }}
            className="h-12"
            placeholder="e.g. coronado_trace_01 (without .vcd)"
          />

          <Button
            onClick={handleParseLocalFile}
            className="w-full mt-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Parsing, one moment please…
              </>
            ) : (
              "Parse Local File"
            )}
          </Button>

          <p className="mt-3 text-xs text-muted-foreground text-center">
            Ensure your <code>.vcd</code> file resides in{" "}
            <code>/uploads</code> on the server, with the name provided above.
          </p>
        </div>
      </div>
    </div>
  );
}
