export type SubtitleBlock = {
  id: string;
  index: number;
  start: number; // seconds
  end: number;
  text: string;
  translation?: string;
};

export type Project = {
  id: string;
  name: string;
  language: string;
  targetLanguage?: string;
  duration: number;
  blocks: number;
  status: "draft" | "transcribing" | "translating" | "ready";
  updatedAt: string;
  thumbnail: string;
};

export const mockProjects: Project[] = [
  {
    id: "p1",
    name: "Documentary — Northern Lights",
    language: "English",
    targetLanguage: "Spanish",
    duration: 1843,
    blocks: 248,
    status: "ready",
    updatedAt: "2 hours ago",
    thumbnail: "from-cyan-500/30 to-blue-600/30",
  },
  {
    id: "p2",
    name: "Podcast Ep. 42 — Future of AI",
    language: "English",
    duration: 3621,
    blocks: 512,
    status: "translating",
    updatedAt: "Yesterday",
    thumbnail: "from-purple-500/30 to-pink-500/30",
  },
  {
    id: "p3",
    name: "Tutorial — Motion Design",
    language: "French",
    targetLanguage: "English",
    duration: 902,
    blocks: 124,
    status: "draft",
    updatedAt: "3 days ago",
    thumbnail: "from-emerald-500/30 to-teal-500/30",
  },
  {
    id: "p4",
    name: "Interview — Marie Laurent",
    language: "French",
    duration: 2410,
    blocks: 318,
    status: "transcribing",
    updatedAt: "1 week ago",
    thumbnail: "from-amber-500/30 to-orange-500/30",
  },
];

export const mockBlocks: SubtitleBlock[] = [
  { id: "b1", index: 1, start: 0.42, end: 3.18, text: "Welcome back to the show, today we have something special.", translation: "Bienvenidos de nuevo al programa, hoy tenemos algo especial." },
  { id: "b2", index: 2, start: 3.45, end: 6.92, text: "We're diving into the future of artificial intelligence.", translation: "Nos sumergimos en el futuro de la inteligencia artificial." },
  { id: "b3", index: 3, start: 7.10, end: 10.55, text: "And how it will reshape the way we work and create.", translation: "Y cómo remodelará la forma en que trabajamos y creamos." },
  { id: "b4", index: 4, start: 10.80, end: 14.20, text: "My guest today has been working in this space for a decade.", translation: "Mi invitado de hoy lleva una década trabajando en este campo." },
  { id: "b5", index: 5, start: 14.45, end: 17.90, text: "Please welcome Dr. Sarah Chen to the studio.", translation: "Por favor, demos la bienvenida a la Dra. Sarah Chen al estudio." },
  { id: "b6", index: 6, start: 18.20, end: 21.45, text: "Thanks for having me, it's great to be here.", translation: "Gracias por invitarme, es genial estar aquí." },
  { id: "b7", index: 7, start: 21.70, end: 25.30, text: "So let's start with the basics — where are we right now?", translation: "Empecemos por lo básico, ¿dónde estamos ahora?" },
  { id: "b8", index: 8, start: 25.55, end: 29.80, text: "We're at an inflection point that few people fully appreciate.", translation: "Estamos en un punto de inflexión que pocos aprecian del todo." },
  { id: "b9", index: 9, start: 30.10, end: 34.25, text: "The models are getting smarter, but more importantly, cheaper.", translation: "Los modelos son más inteligentes, pero sobre todo, más baratos." },
  { id: "b10", index: 10, start: 34.50, end: 38.40, text: "And that combination is going to unlock entirely new applications.", translation: "Y esa combinación desbloqueará aplicaciones completamente nuevas." },
];

export function formatTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
