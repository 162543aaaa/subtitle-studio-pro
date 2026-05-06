import { parseSrt, toSrt, type SubtitleCue } from "@/lib/srt";
import { supabaseRpc } from "@/lib/supabase";

export async function transcribeWithWhisper(storageKey: string, sourceLanguage: string) {
  return supabaseRpc<{ cues: SubtitleCue[] }>("whisper-transcribe", {
    storageKey,
    sourceLanguage,
  });
}

export async function translateSubtitles(cues: SubtitleCue[], sourceLanguage: string, targetLanguage: string) {
  return supabaseRpc<{ translatedCues: SubtitleCue[] }>("translate-subtitles", {
    cues,
    sourceLanguage,
    targetLanguage,
  });
}

export async function processSrtText(srtContent: string) {
  return parseSrt(srtContent);
}

export function exportSrt(cues: SubtitleCue[]) {
  return toSrt(cues);
}

export function downloadSrt(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/x-subrip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
