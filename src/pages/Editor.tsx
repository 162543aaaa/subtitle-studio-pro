import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Play, Pause, SkipBack, SkipForward, Plus, Trash2, Settings, Languages,
  Upload, Save, Download, Scissors, Wand2, FileAudio, ChevronRight, Volume2
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { WaveformTimeline } from "@/components/WaveformTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { mockBlocks, formatTimecode, type SubtitleBlock } from "@/lib/subtitle-data";
import { cn } from "@/lib/utils";

const TOTAL_DURATION = 42;

export default function Editor() {
  const [blocks, setBlocks] = useState<SubtitleBlock[]>(mockBlocks);
  const [activeId, setActiveId] = useState<string>(blocks[0].id);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [bilingual, setBilingual] = useState(true);
  const rafRef = useRef<number>();

  const active = blocks.find((b) => b.id === activeId) ?? blocks[0];

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setCurrentTime((c) => {
        const next = c + dt;
        if (next >= TOTAL_DURATION) { setPlaying(false); return 0; }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing]);

  // sync active block to playhead
  useEffect(() => {
    const b = blocks.find((x) => currentTime >= x.start && currentTime <= x.end);
    if (b && b.id !== activeId) setActiveId(b.id);
  }, [currentTime, blocks, activeId]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches("input, textarea")) return;
      if (e.code === "Space") { e.preventDefault(); setPlaying((p) => !p); }
      if (e.key === "ArrowDown") { e.preventDefault(); jump(1); }
      if (e.key === "ArrowUp") { e.preventDefault(); jump(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const jump = (delta: number) => {
    const idx = blocks.findIndex((b) => b.id === activeId);
    const next = blocks[Math.max(0, Math.min(blocks.length - 1, idx + delta))];
    if (next) { setActiveId(next.id); setCurrentTime(next.start); }
  };

  const updateBlock = (id: string, patch: Partial<SubtitleBlock>) => {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const addBlock = () => {
    const last = blocks[blocks.length - 1];
    const start = last ? last.end + 0.2 : 0;
    const nb: SubtitleBlock = {
      id: `b${Date.now()}`, index: blocks.length + 1,
      start, end: start + 2.5, text: "New subtitle", translation: "",
    };
    setBlocks((bs) => [...bs, nb]);
    setActiveId(nb.id);
  };

  const deleteBlock = (id: string) => {
    setBlocks((bs) => bs.filter((b) => b.id !== id).map((b, i) => ({ ...b, index: i + 1 })));
  };

  const visibleSubtitle = useMemo(() => {
    const b = blocks.find((x) => currentTime >= x.start && currentTime <= x.end);
    return b ?? null;
  }, [currentTime, blocks]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />

      {/* Editor toolbar */}
      <div className="flex h-12 items-center gap-2 border-b border-border bg-surface px-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Projects</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Podcast Ep. 42 — Future of AI</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface-elevated px-2 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">Saved</span>
          </div>
          <Button variant="ghost" size="sm"><Wand2 className="h-3.5 w-3.5 mr-1.5" />AI Refine</Button>
          <Button variant="ghost" size="sm"><Save className="h-3.5 w-3.5 mr-1.5" />Save</Button>
          <Link to="/export"><Button size="sm" className="bg-gradient-primary text-primary-foreground"><Download className="h-3.5 w-3.5 mr-1.5" />Export</Button></Link>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-72 shrink-0 border-r border-border bg-sidebar overflow-y-auto">
          <div className="p-4 space-y-5">
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Source</h3>
              <div className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <FileAudio className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">interview.mp3</div>
                    <div className="text-xs text-muted-foreground">42.0s • 16kHz</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Replace audio
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Languages</h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Source</Label>
                  <select className="mt-1 w-full rounded-md border border-input bg-surface px-2.5 py-1.5 text-sm">
                    <option>English</option><option>Spanish</option><option>French</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Target</Label>
                  <select className="mt-1 w-full rounded-md border border-input bg-surface px-2.5 py-1.5 text-sm">
                    <option>Spanish</option><option>French</option><option>German</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">View</h3>
              <div className="space-y-3 rounded-lg border border-border bg-surface p-3">
                <label className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Languages className="h-3.5 w-3.5 text-muted-foreground" />Bilingual mode</span>
                  <Switch checked={bilingual} onCheckedChange={setBilingual} />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Show timecodes</span>
                  <Switch defaultChecked />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Snap to waveform</span>
                  <Switch defaultChecked />
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Shortcuts</h3>
              <div className="space-y-1.5 text-xs">
                {[
                  ["Space", "Play / Pause"],
                  ["↑ / ↓", "Prev / Next block"],
                  ["⌘ S", "Save"],
                  ["⌘ E", "Export"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-muted-foreground">
                    <span>{v}</span>
                    <kbd className="font-mono rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-foreground">{k}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Center: subtitle list */}
        <section className="flex-1 flex flex-col min-w-0 bg-background">
          <div className="flex h-11 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={addBlock}><Plus className="h-3.5 w-3.5 mr-1.5" />Add block</Button>
              <Button size="sm" variant="ghost"><Scissors className="h-3.5 w-3.5 mr-1.5" />Split</Button>
              <Button size="sm" variant="ghost"><Settings className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="text-xs text-muted-foreground">{blocks.length} subtitles • {bilingual ? "Bilingual" : "Single"}</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {blocks.map((b) => {
              const isActive = b.id === activeId;
              return (
                <div
                  key={b.id}
                  onClick={() => { setActiveId(b.id); setCurrentTime(b.start); }}
                  className={cn(
                    "group rounded-lg border p-3 cursor-pointer transition-smooth",
                    isActive
                      ? "border-primary bg-primary/5 shadow-glow"
                      : "border-border bg-surface hover:border-primary/30 hover:bg-surface-hover"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground">#{b.index}</span>
                      <div className={cn("mt-1 h-6 w-1 rounded-full", isActive ? "bg-primary" : "bg-border")} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] timecode text-muted-foreground">
                        <span>{formatTimecode(b.start)}</span>
                        <span>→</span>
                        <span>{formatTimecode(b.end)}</span>
                        <span className="ml-auto text-[10px]">{(b.end - b.start).toFixed(2)}s</span>
                      </div>
                      {isActive ? (
                        <Textarea
                          value={b.text}
                          onChange={(e) => updateBlock(b.id, { text: e.target.value })}
                          className="min-h-[60px] resize-none bg-background/50 text-sm"
                        />
                      ) : (
                        <p className="text-sm leading-relaxed">{b.text}</p>
                      )}
                      {bilingual && (
                        isActive ? (
                          <Textarea
                            value={b.translation ?? ""}
                            onChange={(e) => updateBlock(b.id, { translation: e.target.value })}
                            placeholder="Translation…"
                            className="min-h-[50px] resize-none bg-background/50 text-sm text-accent"
                          />
                        ) : (
                          <p className="text-sm leading-relaxed text-accent/90">{b.translation}</p>
                        )
                      )}
                      {isActive && (
                        <div className="flex items-center gap-2 pt-1">
                          <Input
                            type="number" step="0.01" value={b.start.toFixed(2)}
                            onChange={(e) => updateBlock(b.id, { start: parseFloat(e.target.value) })}
                            className="h-8 w-24 font-mono text-xs"
                          />
                          <span className="text-xs text-muted-foreground">→</span>
                          <Input
                            type="number" step="0.01" value={b.end.toFixed(2)}
                            onChange={(e) => updateBlock(b.id, { end: parseFloat(e.target.value) })}
                            className="h-8 w-24 font-mono text-xs"
                          />
                          <Button variant="ghost" size="sm" className="ml-auto text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); deleteBlock(b.id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: preview */}
        <aside className="w-80 shrink-0 border-l border-border bg-sidebar flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Live preview</h3>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700 shadow-elevated">
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                {visibleSubtitle ? (
                  <div className="space-y-1.5 animate-fade-in-up" key={visibleSubtitle.id}>
                    <div className="inline-block rounded bg-black/70 px-2.5 py-1 text-sm font-medium text-white">
                      {visibleSubtitle.text}
                    </div>
                    {bilingual && visibleSubtitle.translation && (
                      <div className="inline-block rounded bg-black/70 px-2.5 py-1 text-xs text-white/80">
                        {visibleSubtitle.translation}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-white/40">— no subtitle at {currentTime.toFixed(1)}s —</div>
                )}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => jump(-1)}><SkipBack className="h-4 w-4" /></Button>
              <Button size="icon" onClick={() => setPlaying((p) => !p)} className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground shadow-glow">
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => jump(1)}><SkipForward className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Volume2 className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Active block</h3>
            <div className="rounded-lg border border-border bg-surface p-3 text-xs space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Index</span><span className="font-mono">#{active.index}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-mono">{(active.end - active.start).toFixed(2)}s</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Characters</span><span className="font-mono">{active.text.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">CPS</span><span className="font-mono">{(active.text.length / Math.max(0.1, active.end - active.start)).toFixed(1)}</span></div>
            </div>

            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground pt-2">AI suggestions</h3>
            <button className="w-full rounded-lg border border-border bg-surface p-3 text-left text-xs hover:border-primary/40 transition-smooth">
              <div className="flex items-center gap-1.5 text-primary mb-1"><Wand2 className="h-3 w-3" />Improve translation</div>
              <p className="text-muted-foreground">Tighten phrasing for natural flow.</p>
            </button>
            <button className="w-full rounded-lg border border-border bg-surface p-3 text-left text-xs hover:border-primary/40 transition-smooth">
              <div className="flex items-center gap-1.5 text-accent mb-1"><Scissors className="h-3 w-3" />Split long block</div>
              <p className="text-muted-foreground">Break #8 into two for readability.</p>
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom: waveform */}
      <div className="h-44 shrink-0">
        <WaveformTimeline
          duration={TOTAL_DURATION}
          currentTime={currentTime}
          blocks={blocks.map((b) => ({ start: b.start, end: b.end, index: b.index }))}
          onSeek={(t) => setCurrentTime(t)}
        />
      </div>
    </div>
  );
}
