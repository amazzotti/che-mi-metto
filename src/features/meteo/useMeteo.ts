import { useCallback, useEffect, useState } from 'react';
import type { Posizione } from '../../shared/tipi';
import { type Previsioni, scaricaPrevisioni } from './openMeteo';

/** Dopo quanto le previsioni vanno riscaricate. */
export const VALIDITA_MS = 30 * 60 * 1000;

function chiave(p: Pick<Posizione, 'lat' | 'lon'>): string {
  return `meteo:${p.lat.toFixed(2)},${p.lon.toFixed(2)}`;
}

export function leggiCache(p: Pick<Posizione, 'lat' | 'lon'>): Previsioni | null {
  try {
    const testo = localStorage.getItem(chiave(p));
    return testo ? (JSON.parse(testo) as Previsioni) : null;
  } catch {
    return null;
  }
}

function scriviCache(p: Pick<Posizione, 'lat' | 'lon'>, previsioni: Previsioni) {
  try {
    localStorage.setItem(chiave(p), JSON.stringify(previsioni));
  } catch {
    /* spazio pieno o modalità privata: pazienza */
  }
}

export interface StatoMeteo {
  previsioni: Previsioni | null;
  caricamento: boolean;
  errore: string | null;
  /** Le previsioni mostrate sono quelle salvate perché la rete non risponde. */
  vecchie: boolean;
  aggiorna: () => void;
}

interface Interno {
  chiave: string;
  previsioni: Previsioni | null;
  caricamento: boolean;
  errore: string | null;
  vecchie: boolean;
}

function fresca(p: Previsioni | null): boolean {
  return Boolean(p && Date.now() - p.scaricato < VALIDITA_MS);
}

function statoIniziale(k: string, posizione: Posizione | undefined): Interno {
  const previsioni = posizione ? leggiCache(posizione) : null;
  return { chiave: k, previsioni, caricamento: Boolean(posizione) && !fresca(previsioni), errore: null, vecchie: false };
}

export function useMeteo(posizione: Posizione | undefined): StatoMeteo {
  const k = posizione ? chiave(posizione) : '';
  const [giro, setGiro] = useState(0);
  const [stato, setStato] = useState<Interno>(() => statoIniziale(k, posizione));

  // Cambio di luogo: si riparte dalla cache di quel luogo (stato derivato dalle props).
  if (stato.chiave !== k) {
    setStato(statoIniziale(k, posizione));
  }

  const lat = posizione?.lat;
  const lon = posizione?.lon;
  useEffect(() => {
    if (lat === undefined || lon === undefined) return;
    const pos = { lat, lon };
    const cache = leggiCache(pos);
    // Previsioni salvate da meno di mezz'ora: nessun bisogno di riscaricarle.
    if (giro === 0 && fresca(cache)) return;
    const controllo = new AbortController();
    scaricaPrevisioni(lat, lon, controllo.signal)
      .then((previsioni) => {
        scriviCache(pos, previsioni);
        setStato((s) => ({ ...s, previsioni, caricamento: false, errore: null, vecchie: false }));
      })
      .catch((e: unknown) => {
        if (controllo.signal.aborted) return;
        const messaggio = e instanceof Error ? e.message : String(e);
        setStato((s) => ({
          ...s,
          previsioni: s.previsioni ?? cache,
          caricamento: false,
          errore: `Meteo non disponibile: ${messaggio}`,
          vecchie: Boolean(s.previsioni ?? cache),
        }));
      });
    return () => controllo.abort();
  }, [lat, lon, giro]);

  const aggiorna = useCallback(() => {
    setStato((s) => ({ ...s, caricamento: true }));
    setGiro((g) => g + 1);
  }, []);
  return { previsioni: stato.previsioni, caricamento: stato.caricamento, errore: stato.errore, vecchie: stato.vecchie, aggiorna };
}

/** L'ora che avanza (ogni minuto), per aggiornare "oggi" e le ore rimaste. */
export function useAdesso(intervallo = 60_000): number {
  const [adesso, setAdesso] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setAdesso(Date.now()), intervallo);
    return () => window.clearInterval(id);
  }, [intervallo]);
  return adesso;
}
