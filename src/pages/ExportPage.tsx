import { Link } from "react-router-dom";
import { Download, FileText, Check, Copy, Languages } from "lucide-react";
import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { mockBlocks, formatTimecode } from "@/lib/subtitle-data";
import { cn } from "@/lib/utils";

function buildSrt(includeTranslation: boolean): string {
  return mockBlocks.map((b) => {
    const lines = [b.text];
    if (includeTranslation && b.translation) lines.push(b.translation);
    return `${b.index}\n${formatTimecode(b.start)} --> ${formatTimecode(b.end)}\n${lines.join("\n")}\n`;
  }).join("\n");
}

function buildVtt(includeTranslation: boolean): string {
  const body = mockBlocks.map((b) => {
    const lines = [b.text];
    if (includeTranslation && b.translation) lines.push(b.translation);
    const t = (s: number) => formatTimecode(s).replace(",", ".");
    return `${b.index}\n${t(b.start)} --> ${t(b.end)}\n${lines.join("\n")}\n`;
  }).join("\n");
  return `WEBVTT\n\n${body}`;
}

export default function ExportPage() {
  const [format, setFormat] = useState<"srt" | "vtt">("srt");
  const [bilingual, setBilingual] = useState(true);
  const [bom, setBom] = useState(false);
  const [copied, setCopied] = useState(false);

  const content = format === "srt" ? buildSrt(bilingual) : buildVtt(bilingual);

  const download = () => {
    const blob = new Blob([(bom ? "\uFEFF" : "") + content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subtitles.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8">
            <Link to="/editor" className="text-xs text-muted-foreground hover:text-foreground">← Back to editor</Link>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Export subtitles</h1>
            <p className="mt-1 text-muted-foreground">Choose a format and download your finished file.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            {/* Settings */}
            <div className="space-y-5">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Format</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {(["srt", "vtt"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-smooth",
                        format === f ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-surface hover:border-primary/40"
                      )}
                    >
                      <FileText className={cn("h-4 w-4 mb-2", format === f ? "text-primary" : "text-muted-foreground")} />
                      <div className="font-display text-lg font-semibold uppercase">.{f}</div>
                      <div className="text-xs text-muted-foreground">{f === "srt" ? "SubRip Subtitle" : "Web Video Text Tracks"}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
                <label className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Languages className="h-3.5 w-3.5 text-muted-foreground" />Include translation</span>
                  <Switch checked={bilingual} onCheckedChange={setBilingual} />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>UTF-8 BOM</span>
                  <Switch checked={bom} onCheckedChange={setBom} />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Reset numbering</span>
                  <Switch defaultChecked />
                </label>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4 text-xs text-muted-foreground space-y-1.5">
                <div className="flex justify-between"><span>Blocks</span><span className="font-mono text-foreground">{mockBlocks.length}</span></div>
                <div className="flex justify-between"><span>Encoding</span><span className="font-mono text-foreground">UTF-8{bom && " + BOM"}</span></div>
                <div className="flex justify-between"><span>Estimated size</span><span className="font-mono text-foreground">{(content.length / 1024).toFixed(1)} KB</span></div>
              </div>

              <div className="flex flex-col gap-2">
                <Button onClick={download} size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow">
                  <Download className="mr-2 h-4 w-4" /> Download .{format}
                </Button>
                <Button variant="outline" onClick={copy}>
                  {copied ? <Check className="mr-2 h-4 w-4 text-success" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "Copied!" : "Copy to clipboard"}
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-border bg-surface overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="ml-2 text-muted-foreground">subtitles.{format}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Preview</span>
              </div>
              <pre className="flex-1 overflow-auto p-5 text-xs font-mono leading-relaxed text-foreground/90 max-h-[600px]">
                {content}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
