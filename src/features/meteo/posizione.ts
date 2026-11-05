import type { Posizione } from '../../shared/tipi';

/** Ricerca città gratuita di Open-Meteo. */
export async function cercaCitta(testo: string, segnale?: AbortSignal): Promise<(Posizione & { dettaglio: string })[]> {
  const q = testo.trim();
  if (q.length < 2) return [];
  const p = new URLSearchParams({ name: q, count: '6', language: 'it', format: 'json' });
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${p}`, { signal: segnale });
  if (!r.ok) throw new Error(`Ricerca città non riuscita (${r.status})`);
  const dati = (await r.json()) as {
    results?: { name: string; latitude: number; longitude: number; admin1?: string; country?: string }[];
  };
  return (dati.results ?? []).map((c) => ({
    nome: c.name,
    lat: c.latitude,
    lon: c.longitude,
    origine: 'ricerca' as const,
    dettaglio: [c.admin1, c.country].filter(Boolean).join(', '),
  }));
}

/** Nome del luogo dalle coordinate, con Nominatim (OpenStreetMap). Se fallisce non è un problema. */
export async function nomeLuogo(lat: number, lon: number): Promise<string> {
  try {
    const p = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      format: 'jsonv2',
      zoom: '10',
      'accept-language': 'it',
    });
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?${p}`);
    if (!r.ok) return 'La tua posizione';
    const dati = (await r.json()) as { address?: Record<string, string>; name?: string };
    const a = dati.address ?? {};
    return a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? dati.name ?? 'La tua posizione';
  } catch {
    return 'La tua posizione';
  }
}

export function messaggioErroreGps(codice: number): string {
  if (codice === 1) return 'Non hai dato il permesso per la posizione: cerca la tua città qui sotto.';
  if (codice === 3) return 'Il telefono non ha trovato la posizione in tempo. Riprova o cerca la città.';
  return 'Posizione non disponibile: cerca la tua città qui sotto.';
}

/** Chiede la posizione al browser (su iPhone serve https e il permesso dell'utente). */
export function posizioneGps(): Promise<Posizione> {
  return new Promise((risolvi, rifiuta) => {
    if (!('geolocation' in navigator)) {
      rifiuta(new Error(messaggioErroreGps(2)));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const lat = Math.round(p.coords.latitude * 1000) / 1000;
        const lon = Math.round(p.coords.longitude * 1000) / 1000;
        risolvi({ nome: await nomeLuogo(lat, lon), lat, lon, origine: 'gps' });
      },
      (e) => rifiuta(new Error(messaggioErroreGps(e.code))),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
