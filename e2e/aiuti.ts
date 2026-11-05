import type { Page } from '@playwright/test';
import { curvaGiornaliera, rispostaMeteoFinta, type OpzioniMeteoFinto } from '../src/test/meteoFinto';

export const OGGI = '2026-11-05';

/** Giornate d'autunno a Rimini: fresco, pioggia sabato pomeriggio, freddo domenica. */
export const AUTUNNO: Partial<OpzioniMeteoFinto> = {
  temperatura: (g, h) => {
    const base = [
      [9, 16],
      [10, 15],
      [8, 13],
      [3, 9],
      [5, 12],
      [7, 14],
      [8, 15],
    ][g] as [number, number];
    return curvaGiornaliera(base[0], base[1])(g, h);
  },
  probPioggia: (g, h) => (g === 2 && h >= 13 ? 80 : g === 1 && h >= 18 ? 40 : 5),
  codice: (g, h) => (g === 2 && h >= 13 ? 63 : g === 3 ? 3 : h >= 8 && h <= 16 ? 1 : 2),
  vento: (g) => (g === 3 ? 28 : 11),
};

/** Ferma l'orologio della pagina e simula Open-Meteo, la ricerca città e Nominatim. */
export async function preparaPagina(page: Page, meteo: Partial<OpzioniMeteoFinto> = AUTUNNO, ora = '10:00') {
  await page.clock.setFixedTime(new Date(`${OGGI}T${ora}:00+01:00`));
  await page.route('**/api.open-meteo.com/**', (r) =>
    r.fulfill({ json: rispostaMeteoFinta({ inizio: OGGI, oraAttuale: ora, ...meteo }) }),
  );
  await page.route('**/geocoding-api.open-meteo.com/**', (r) =>
    r.fulfill({
      json: {
        results: [
          { name: 'Rimini', latitude: 44.06, longitude: 12.57, admin1: 'Emilia-Romagna', country: 'Italia' },
          { name: 'Rimini', latitude: 39.6, longitude: 16.3, admin1: 'Calabria', country: 'Italia' },
        ],
      },
    }),
  );
  await page.route('**/nominatim.openstreetmap.org/**', (r) => r.fulfill({ json: { address: { city: 'Bologna' } } }));
}

/** Completa il primo avvio scegliendo genere e città. */
export async function primoAvvio(page: Page, genere: 'Donna' | 'Uomo' = 'Donna') {
  await page.goto('./');
  await page.getByRole('button', { name: genere, exact: true }).click();
  await page.getByRole('searchbox', { name: 'Cerca la città' }).fill('Rimini');
  await page.getByRole('button', { name: /Rimini\s*Emilia-Romagna/ }).click();
  await page.getByRole('button', { name: 'Iniziamo' }).click();
  await page.getByRole('region', { name: 'Meteo attuale' }).waitFor();
}
