import { Link } from "react-router-dom";
import { Plus, Clock, Languages, FileAudio, MoreHorizontal, Search, Sparkles } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockProjects, formatDuration } from "@/lib/subtitle-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  ready: "bg-success/15 text-success border-success/30",
  draft: "bg-muted text-muted-foreground border-border",
  transcribing: "bg-warning/15 text-warning border-warning/30",
  translating: "bg-accent/15 text-accent border-accent/30",
};

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 py-10">
          {/* Hero */}
          <section className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                AI-powered semantic chunking
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl text-balance">
                Craft perfect subtitles, <span className="bg-gradient-primary bg-clip-text text-transparent">faster than ever.</span>
              </h1>
              <p className="text-muted-foreground text-balance">
                Transcribe, translate, edit, and export professional captions with timeline precision.
              </p>
            </div>
            <Link to="/new">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </Link>
          </section>

          {/* Stats */}
          <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Projects", value: "12", icon: FileAudio },
              { label: "Hours transcribed", value: "47.2", icon: Clock },
              { label: "Languages", value: "8", icon: Languages },
              { label: "Subtitles edited", value: "3,841", icon: Sparkles },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-surface p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 font-display text-3xl font-semibold">{s.value}</div>
              </div>
            ))}
          </section>

          {/* Projects */}
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold">Recent projects</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search projects…" className="pl-9 w-64 bg-surface" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockProjects.map((p, i) => (
                <Link
                  key={p.id}
                  to="/editor"
                  className="group rounded-xl border border-border bg-surface overflow-hidden shadow-soft transition-smooth hover:border-primary/50 hover:shadow-elevated animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className={cn("relative h-32 bg-gradient-to-br", p.thumbnail)}>
                    <div className="absolute inset-0 grid-bg opacity-30" />
                    <div className="absolute bottom-3 left-3 flex items-end gap-0.5">
                      {Array.from({ length: 28 }).map((_, j) => (
                        <div
                          key={j}
                          className="w-1 rounded-sm bg-foreground/60"
                          style={{ height: `${10 + Math.abs(Math.sin(j * 0.7)) * 28}px` }}
                        />
                      ))}
                    </div>
                    <span className={cn("absolute top-3 right-3 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider backdrop-blur", statusStyles[p.status])}>
                      {p.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight line-clamp-1">{p.name}</h3>
                      <button className="text-muted-foreground hover:text-foreground" onClick={(e) => e.preventDefault()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(p.duration)}</span>
                      <span>•</span>
                      <span>{p.blocks} blocks</span>
                      <span>•</span>
                      <span>{p.language}{p.targetLanguage && ` → ${p.targetLanguage}`}</span>
                    </div>
                    <div className="mt-3 text-[11px] text-muted-foreground">Updated {p.updatedAt}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
