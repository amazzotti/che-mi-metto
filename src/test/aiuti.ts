import { vi } from 'vitest';
import { db } from '../shared/db';
import type { Profilo } from '../shared/tipi';
import { istanteLocale, rispostaMeteoFinta, type OpzioniMeteoFinto } from './meteoFinto';

export const OGGI = '2026-11-05';

export const PROFILO: Profilo = {
  genere: 'donna',
  sensibilita: 'normale',
  posizione: { nome: 'Rimini', lat: 44.06, lon: 12.57, origine: 'ricerca' },
};

export async function svuotaDati() {
  await Promise.all([db.capi.clear(), db.impegni.clear(), db.impostazioni.clear()]);
  localStorage.clear();
}

/** Ferma l'orologio (solo Date, i timer restano veri) a un'ora locale di Rimini. */
export function fermaOrologio(ora = '10:00', data = OGGI) {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(istanteLocale(data, ora));
}

/** fetch finto: risponde come Open-Meteo e come la ricerca città. */
export function fetchFinto(meteo: Partial<OpzioniMeteoFinto> = {}) {
  const f = vi.fn(async (url: string | URL) => {
    const u = String(url);
    if (u.includes('geocoding-api')) {
      return new Response(
        JSON.stringify({ results: [{ name: 'Rimini', latitude: 44.06, longitude: 12.57, admin1: 'Emilia-Romagna', country: 'Italia' }] }),
      );
    }
    if (u.includes('api.open-meteo.com')) {
      return new Response(JSON.stringify(rispostaMeteoFinta({ inizio: OGGI, ...meteo })));
    }
    return new Response('{}', { status: 404 });
  });
  vi.stubGlobal('fetch', f);
  return f;
}
