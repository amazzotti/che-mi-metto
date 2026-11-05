import { describe, expect, it } from 'vitest';
import type { Condizioni } from '../meteo/condizioni';
import { proponiIdee, semeDelGiorno, somiglianza } from './idee';
import type { RichiestaOutfit } from './motore';

function richiesta(percepita: number, altro: Partial<RichiestaOutfit> = {}): Omit<RichiestaOutfit, 'variante'> {
  const condizioni: Condizioni = {
    percepita,
    percepitaMin: percepita - 2,
    percepitaMax: percepita + 2,
    temperaturaMin: percepita - 1,
    temperaturaMax: percepita + 3,
    probPioggia: 5,
    pioggia: 0,
    vento: 10,
    uv: 2,
    neve: false,
    codice: 2,
    dalle: '08:00',
    alle: '18:00',
    sera: false,
  };
  return { condizioni, genere: 'donna', sensibilita: 'normale', occasione: 'casual', data: '2026-04-20', latitudine: 44, ...altro };
}

const firmaTesto = (o: { pezzi: { categoria: string; colore: string }[] }) => o.pezzi.map((p) => `${p.categoria}:${p.colore}`).join('|');

describe('idee multiple', () => {
  it('misura la somiglianza tra due outfit', () => {
    expect(somiglianza(new Set(['a', 'b']), new Set(['a', 'b']))).toBe(1);
    expect(somiglianza(new Set(['a', 'b']), new Set(['c']))).toBe(0);
    expect(somiglianza(new Set(['a', 'b']), new Set(['b', 'c']))).toBeCloseTo(1 / 3);
  });

  it('propone tre idee diverse con titoli diversi', () => {
    for (const occasione of ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante'] as const) {
      for (const t of [4, 12, 18, 24, 30]) {
        const idee = proponiIdee(richiesta(t, { occasione }));
        expect(idee, `${occasione} ${t}°`).toHaveLength(3);
        expect(new Set(idee.map((i) => firmaTesto(i.outfit))).size).toBe(3);
        expect(new Set(idee.map((i) => i.titolo)).size).toBe(3);
        expect(idee[0].titolo).toBe('La più adatta');
      }
    }
  });

  it('"Altre idee" passa a un nuovo gruppo di proposte', () => {
    const primo = proponiIdee(richiesta(15)).map((i) => i.chiave);
    const secondo = proponiIdee(richiesta(15), 1);
    expect(secondo[0].titolo).toMatch(/^Con /);
    expect(secondo.map((i) => i.chiave).some((k) => primo.includes(k))).toBe(false);
  });

  it('cambia proposta da un giorno all’altro ma non nello stesso giorno', () => {
    const giorni = ['2026-04-20', '2026-04-21', '2026-04-22', '2026-04-23', '2026-04-24'];
    const prime = giorni.map((data) => firmaTesto(proponiIdee(richiesta(14, { data }))[0].outfit));
    expect(new Set(prime).size).toBeGreaterThan(2);
    expect(firmaTesto(proponiIdee(richiesta(14))[0].outfit)).toBe(firmaTesto(proponiIdee(richiesta(14))[0].outfit));
    expect(semeDelGiorno('2026-04-20', 'casual')).toBe(semeDelGiorno('2026-04-20', 'casual'));
  });

  it('per la donna propone anche gonne, vestiti e modelli diversi', () => {
    const tutte = ['2026-04-20', '2026-04-21', '2026-04-22', '2026-04-23'].flatMap((data) =>
      [0, 1].flatMap((gruppo) => proponiIdee(richiesta(19, { data }), gruppo)),
    );
    const capi = tutte.flatMap((i) => i.outfit.pezzi);
    expect(capi.some((p) => ['gonna', 'gonna-lunga', 'vestito', 'vestito-estivo', 'tuta-intera'].includes(p.categoria))).toBe(true);
    expect(new Set(capi.map((p) => p.nome)).size).toBeGreaterThan(10);
  });

  it('il lucchetto tiene fermo un capo in tutte le idee', () => {
    const prima = proponiIdee(richiesta(12))[0].outfit;
    const fisso = prima.pezzi.find((p) => p.slot === 'sotto')!;
    const idee = [0, 1, 2].flatMap((gruppo) => proponiIdee(richiesta(12, { bloccati: [fisso] }), gruppo));
    for (const idea of idee) {
      const sotto = idea.outfit.pezzi.find((p) => p.slot === 'sotto')!;
      expect(sotto).toMatchObject({ categoria: fisso.categoria, colore: fisso.colore, bloccato: true });
      expect(idea.outfit.pezzi.some((p) => p.slot === 'intero')).toBe(false);
    }
  });

  it('con un armadio piccolo non inventa doppioni', () => {
    const armadio = [
      { id: 'a', categoria: 'jeans' as const, colore: '#4a6b8a', occasioni: ['casual' as const], impermeabile: false, creato: 1 },
      { id: 'b', categoria: 'tshirt' as const, colore: '#ffffff', occasioni: ['casual' as const], impermeabile: false, creato: 2 },
      { id: 'c', categoria: 'sneakers' as const, colore: '#ffffff', occasioni: ['casual' as const], impermeabile: false, creato: 3 },
    ];
    const idee = proponiIdee(richiesta(24, { armadio }));
    expect(new Set(idee.map((i) => firmaTesto(i.outfit))).size).toBe(idee.length);
  });
});
