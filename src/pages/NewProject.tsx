import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { processSrtText, transcribeWithWhisper, translateSubtitles, exportSrt } from "@/lib/pipeline";
import { uploadToSupabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { Upload, FileAudio, FileText, Languages, ArrowRight, Check, Sparkles } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const languages = ["English", "Spanish", "French", "German", "Japanese", "Portuguese", "Chinese", "Arabic"];

export default function NewProject() {
  const navigate = useNavigate();
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"transcribe" | "translate" | "bilingual">("transcribe");
  const [source, setSource] = useState("English");
  const [target, setTarget] = useState("Spanish");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const handleCreate = async () => {
    if (!file) {
      toast({ title: "Please choose a file", description: "Upload audio or SRT before continuing." });
      return;
    }

    setLoading(true);
    try {
      const upload = await uploadToSupabase(file);
      let cues = [];

      if (file.name.match(/\.srt$/i)) {
        const srtText = await file.text();
        cues = await processSrtText(srtText);
      } else {
        const transcription = await transcribeWithWhisper(upload.key, source);
        cues = transcription.cues;
      }

      if (mode !== "transcribe") {
        const translated = await translateSubtitles(cues, source, target);
        cues = mode === "bilingual"
          ? cues.map((cue, i) => ({ ...cue, text: `${cue.text}\n${translated.translatedCues[i]?.text ?? ""}`.trim() }))
          : translated.translatedCues;
      }

      const srt = exportSrt(cues);
      localStorage.setItem("latest_srt", srt);
      localStorage.setItem("latest_project_name", file.name.replace(/\.[^.]+$/, ""));

      toast({ title: "Project created", description: "Upload, parsing, AI and export pipeline completed." });
      navigate("/editor");
    } catch (error) {
      toast({
        title: "Pipeline failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-6 py-10">
          <div className="mb-8">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to dashboard</Link>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">New project</h1>
            <p className="mt-1 text-muted-foreground">Upload a file and choose how Subtitle Master should process it.</p>
          </div>

          {/* Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={cn(
              "relative rounded-2xl border-2 border-dashed p-10 text-center transition-smooth",
              drag ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-surface hover:border-primary/40"
            )}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
              <Upload className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold">Drop your file here</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Audio (.mp3, .wav, .m4a), subtitles (.srt), or text (.txt) — up to 500 MB
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <label>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                <Button asChild variant="outline"><span>Browse files</span></Button>
              </label>
              <span className="text-xs text-muted-foreground">or drag and drop</span>
            </div>

            {file && (
              <div className="mx-auto mt-6 flex max-w-sm items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                  {file.name.match(/\.(mp3|wav|m4a)$/i) ? <FileAudio className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
                <Check className="h-4 w-4 text-success" />
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="mt-8 grid gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Mode</Label>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {[
                  { id: "transcribe", title: "Transcribe", desc: "Audio → SRT", icon: Sparkles },
                  { id: "translate", title: "Translate", desc: "Convert language", icon: Languages },
                  { id: "bilingual", title: "Bilingual", desc: "Both languages", icon: ArrowRight },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as typeof mode)}
                    className={cn(
                      "group rounded-xl border p-4 text-left transition-smooth",
                      mode === m.id
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border bg-surface hover:border-primary/40"
                    )}
                  >
                    <m.icon className={cn("h-4 w-4", mode === m.id ? "text-primary" : "text-muted-foreground")} />
                    <div className="mt-2 font-semibold">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="src">Source language</Label>
                <select id="src" value={source} onChange={(e) => setSource(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm">
                  {languages.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              {mode !== "transcribe" && (
                <div>
                  <Label htmlFor="tgt">Target language</Label>
                  <select id="tgt" value={target} onChange={(e) => setTarget(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm">
                    {languages.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="name">Project name</Label>
              <Input id="name" placeholder="My subtitle project" className="mt-1 bg-surface" />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="text-xs text-muted-foreground">Autosave is on. You can edit settings anytime.</div>
              <Button onClick={handleCreate} disabled={loading} className="bg-gradient-primary text-primary-foreground shadow-glow">
                {loading ? "Processing…" : "Create project"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
