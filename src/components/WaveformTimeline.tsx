import { useEffect, useRef } from "react";

type Props = {
  duration: number;
  currentTime: number;
  blocks: { start: number; end: number; index: number }[];
  onSeek: (t: number) => void;
  activeId?: string | null;
  blocksWithId?: { id: string; start: number; end: number }[];
};

// Deterministic pseudo-random waveform
function genPeaks(count: number, seed = 7): number[] {
  const peaks: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const env = Math.sin((i / count) * Math.PI * 4) * 0.3 + 0.6;
    peaks.push(Math.max(0.08, Math.min(1, r * 0.7 + env * 0.5)));
  }
  return peaks;
}

export function WaveformTimeline({ duration, currentTime, blocks, onSeek }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const peaks = useRef(genPeaks(280));

  useEffect(() => {
    const el = containerRef.current?.querySelector("[data-playhead]") as HTMLElement | null;
    if (el) el.style.left = `${(currentTime / duration) * 100}%`;
  }, [currentTime, duration]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(duration, ratio * duration)));
  };

  return (
    <div className="flex h-full flex-col bg-surface border-t border-border">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="timecode text-foreground">
            {formatT(currentTime)} <span className="text-muted-foreground">/ {formatT(duration)}</span>
          </span>
          <span className="h-3 w-px bg-border" />
          <span>{blocks.length} blocks</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Waveform</span>
        </div>
      </div>

      {/* Ruler */}
      <div className="relative h-5 border-b border-border/60 bg-surface-elevated/50">
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full border-l border-border/60 pl-1 text-[10px] text-muted-foreground timecode"
            style={{ left: `${i * 10}%` }}
          >
            {formatT((duration * i) / 10)}
          </div>
        ))}
      </div>

      {/* Track */}
      <div
        ref={containerRef}
        onClick={handleClick}
        className="relative flex-1 cursor-pointer overflow-hidden"
      >
        {/* Peaks */}
        <div className="absolute inset-0 flex items-center gap-[2px] px-1">
          {peaks.current.map((p, i) => {
            const t = (i / peaks.current.length) * duration;
            const inBlock = blocks.some((b) => t >= b.start && t <= b.end);
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm ${inBlock ? "bg-primary/70" : "bg-muted-foreground/25"}`}
                style={{ height: `${p * 70}%` }}
              />
            );
          })}
        </div>

        {/* Block overlays */}
        <div className="absolute inset-x-0 bottom-1 h-7">
          {blocks.map((b) => {
            const left = (b.start / duration) * 100;
            const width = ((b.end - b.start) / duration) * 100;
            return (
              <div
                key={b.index}
                className="absolute top-0 h-full rounded-md border border-primary/50 bg-primary/15 backdrop-blur-sm transition-smooth hover:bg-primary/25"
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`Block ${b.index}`}
              >
                <div className="truncate px-1.5 pt-0.5 text-[10px] font-medium text-foreground/80">
                  {b.index}
                </div>
              </div>
            );
          })}
        </div>

        {/* Playhead */}
        <div
          data-playhead
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary shadow-glow"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute -top-1 -left-[5px] h-2.5 w-2.5 rounded-full bg-primary shadow-glow" />
        </div>
      </div>
    </div>
  );
}

function formatT(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}
