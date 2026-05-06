const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const storageBucket = (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined) ?? "media";

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing ${name}. Add it to your .env file.`);
  }
  return value;
}

export function getSupabaseConfig() {
  return {
    url: requireEnv("VITE_SUPABASE_URL", supabaseUrl),
    anonKey: requireEnv("VITE_SUPABASE_ANON_KEY", supabaseAnonKey),
    storageBucket,
  };
}

export async function supabaseRpc<T>(functionName: string, payload: Record<string, unknown>): Promise<T> {
  const { url, anonKey } = getSupabaseConfig();
  const res = await fetch(`${url}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase function ${functionName} failed: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function uploadToSupabase(file: File, folder = "raw") {
  const { url, anonKey, storageBucket } = getSupabaseConfig();
  const path = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  const res = await fetch(`${url}/storage/v1/object/${storageBucket}/${encodeURIComponent(path)}`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "x-upsert": "true",
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${text}`);
  }

  const { Key } = (await res.json()) as { Key: string };
  return { key: Key ?? path, bucket: storageBucket };
}
