export type SubtitleCue = {
  id: number;
  startMs: number;
  endMs: number;
  text: string;
};

const TIME = /(?<h>\d{2}):(?<m>\d{2}):(?<s>\d{2})[,.](?<ms>\d{3})/;

export function parseTimestamp(input: string) {
  const m = input.trim().match(TIME)?.groups;
  if (!m) throw new Error(`Invalid SRT timestamp: ${input}`);
  return Number(m.h) * 3600000 + Number(m.m) * 60000 + Number(m.s) * 1000 + Number(m.ms);
}

export function toSrtTimestamp(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const rem = ms % 1000;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":") + `,${String(rem).padStart(3, "0")}`;
}

export function parseSrt(content: string): SubtitleCue[] {
  return content
    .trim()
    .split(/\n\s*\n/g)
    .map((block, idx) => {
      const lines = block.split(/\r?\n/).filter(Boolean);
      const timing = lines.find((line) => line.includes("-->"));
      if (!timing) throw new Error(`Missing timing at cue ${idx + 1}`);
      const [start, end] = timing.split("-->").map((t) => t.trim());
      return {
        id: Number(lines[0]) || idx + 1,
        startMs: parseTimestamp(start),
        endMs: parseTimestamp(end),
        text: lines.slice(lines.indexOf(timing) + 1).join("\n").trim(),
      };
    })
    .filter((cue) => cue.text.length > 0);
}

export function toSrt(cues: SubtitleCue[]) {
  return cues
    .map((cue, idx) => `${idx + 1}\n${toSrtTimestamp(cue.startMs)} --> ${toSrtTimestamp(cue.endMs)}\n${cue.text}`)
    .join("\n\n");
}
