# Subtitle Studio Pro

Pipeline implemented in sequence:

1. Supabase connection (`src/lib/supabase.ts`)
2. Real upload to Supabase Storage (`uploadToSupabase`)
3. SRT parser (`src/lib/srt.ts`)
4. Whisper API via Supabase Edge Function (`whisper-transcribe`)
5. Translation API via Supabase Edge Function (`translate-subtitles`)
6. Export engine to SRT (`toSrt`, `exportSrt`, `downloadSrt`)

## Environment variables

Create `.env` with:

```bash
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_SUPABASE_STORAGE_BUCKET=media
```

## Expected Supabase Edge Functions

- `whisper-transcribe`
  - input: `{ storageKey, sourceLanguage }`
  - output: `{ cues: SubtitleCue[] }`
- `translate-subtitles`
  - input: `{ cues, sourceLanguage, targetLanguage }`
  - output: `{ translatedCues: SubtitleCue[] }`
