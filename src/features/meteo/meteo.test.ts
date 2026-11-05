import { afterEach, describe, expect, it, vi } from 'vitest';
import { istanteLocale, rispostaMeteoFinta } from '../../test/meteoFinto';
import { codiceNeve, codicePioggia, infoCodice } from './codiciMeteo';
import { condizioniGiorno, condizioniOra, piove, riassumi } from './condizioni';
import { interpretaPrevisioni, oraLocale, scaricaPrevisioni, urlPrevisioni } from './openMeteo';

const finta = () => rispostaMeteoFinta({ inizio: '2026-11-05', oraAttuale: '10:00' });

describe('Open-Meteo', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("costruisce l'URL senza chiavi", () => {
    const url = new URL(urlPrevisioni(44.0612, 12.5656));
    expect(url.hostname).toBe('api.open-meteo.com');
    expect(url.searchParams.get('latitude')).toBe('44.061');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('hourly')).toContain('apparent_temperature');
    expect(url.searchParams.has('apikey')).toBe(false);
  });

  it('interpreta la risposta', () => {
    const p = interpretaPrevisioni(finta(), 123);
    expect(p.giorni).toHaveLength(7);
    expect(p.orarie).toHaveLength(7 * 24);
    expect(p.attuale.ora).toBe('2026-11-05T10:00');
    expect(p.giorni[0].data).toBe('2026-11-05');
    expect(p.scaricato).toBe(123);
    expect(() => interpretaPrevisioni({})).toThrow('Risposta meteo non valida');
  });

  it('scarica con fetch e segnala gli errori', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => finta() }));
    const p = await scaricaPrevisioni(44, 12);
    expect(p.giorni[0].data).toBe('2026-11-05');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(scaricaPrevisioni(44, 12)).rejects.toThrow('503');
  });

  it("calcola l'ora locale del luogo", () => {
    expect(oraLocale({ scartoUtc: 3600 }, istanteLocale('2026-11-05', '10:30'))).toBe('2026-11-05T10:30');
  });
});

describe('condizioni', () => {
  it('riassume la giornata da ora in poi', () => {
    const p = interpretaPrevisioni(finta());
    const c = condizioniGiorno(p, '2026-11-05', istanteLocale('2026-11-05', '14:20'))!;
    expect(c.dalle).toBe('14:00');
    expect(c.alle).toBe('20:00');
    expect(c.sera).toBe(true);
  });

  it('usa 8-20 per i giorni futuri e la sera tardi per oggi', () => {
    const p = interpretaPrevisioni(finta());
    const domani = condizioniGiorno(p, '2026-11-06', istanteLocale('2026-11-05', '10:00'))!;
    expect([domani.dalle, domani.alle]).toEqual(['08:00', '20:00']);
    const tardi = condizioniGiorno(p, '2026-11-05', istanteLocale('2026-11-05', '21:10'))!;
    expect([tardi.dalle, tardi.alle]).toEqual(['21:00', '23:00']);
  });

  it('guarda le ore attorno a un impegno', () => {
    const p = interpretaPrevisioni(finta());
    const c = condizioniOra(p, '2026-11-06', '20:30')!;
    expect([c.dalle, c.alle]).toEqual(['19:00', '22:00']);
    expect(condizioniOra(p, '2030-01-01', '10:00')).toBeNull();
    expect(riassumi([])).toBeNull();
  });

  it('riconosce pioggia e neve', () => {
    const p = interpretaPrevisioni(
      rispostaMeteoFinta({
        inizio: '2026-11-05',
        probPioggia: (_g, h) => (h >= 15 ? 80 : 5),
        codice: (g) => (g === 2 ? 73 : 3),
      }),
    );
    const c = condizioniGiorno(p, '2026-11-05', istanteLocale('2026-11-05', '08:00'))!;
    expect(piove(c)).toBe(true);
    expect(condizioniGiorno(p, '2026-11-07')!.neve).toBe(true);
    expect(piove({ probPioggia: 10, pioggia: 0, codice: 2 })).toBe(false);
    expect(codiceNeve(75)).toBe(true);
    expect(codicePioggia(63)).toBe(true);
    expect(codicePioggia(3)).toBe(false);
    expect(infoCodice(95).icona).toBe('temporale');
    expect(infoCodice(1234).descrizione).toBe('Variabile');
  });
});
