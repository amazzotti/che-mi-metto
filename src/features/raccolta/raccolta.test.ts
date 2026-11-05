import { beforeEach, describe, expect, it } from 'vitest';
import { svuotaDati } from '../../test/aiuti';
import type { Capo } from '../../shared/tipi';
import type { Condizioni } from '../meteo/condizioni';
import { proponiOutfit } from '../outfit/motore';
import { disposizione } from './collage';
import { aggiungiAlDiario, elencoDiario, elencoOutfit, eliminaOutfit, inSalvati, ripristina, salvaOutfit } from './raccolta';
import { preparaValigia, quantitaPer, valigiaInTesto } from './valigia';

function meteo(percepita: number, altro: Partial<Condizioni> = {}): Condizioni {
  return {
    percepita,
    percepitaMin: percepita - 3,
    percepitaMax: percepita + 3,
    temperaturaMin: percepita - 2,
    temperaturaMax: percepita + 4,
    probPioggia: 5,
    pioggia: 0,
    vento: 10,
    uv: 3,
    neve: false,
    codice: 2,
    dalle: '08:00',
    alle: '20:00',
    sera: false,
    ...altro,
  };
}

const capo: Capo = { id: 'c1', categoria: 'jeans', colore: '#4a6b8a', occasioni: ['casual'], impermeabile: false, creato: 1 };

const outfit = () =>
  proponiOutfit({ condizioni: meteo(12), genere: 'donna', sensibilita: 'normale', occasione: 'casual', data: '2026-11-05', latitudine: 44, armadio: [capo] });

describe('outfit salvati e diario', () => {
  beforeEach(svuotaDati);

  it('salva solo il riferimento ai capi e li ricollega', () => {
    const o = outfit();
    const salvati = inSalvati(o.pezzi);
    const jeans = salvati.find((p) => p.capoId === 'c1')!;
    expect(jeans).toBeDefined();
    expect('capo' in jeans).toBe(false);
    expect(ripristina(salvati, [capo]).find((p) => p.categoria === 'jeans')?.capo).toBe(capo);
    expect(ripristina(salvati, []).find((p) => p.categoria === 'jeans')?.capo).toBeUndefined();
  });

  it('salva, elenca ed elimina gli outfit', async () => {
    const s = await salvaOutfit(outfit(), { titolo: 'Domenica', occasione: 'casual', data: '2026-11-05' });
    expect((await elencoOutfit()).map((x) => x.titolo)).toEqual(['Domenica']);
    await eliminaOutfit(s.id);
    expect(await elencoOutfit()).toHaveLength(0);
  });

  it('nel diario tiene un outfit per giorno e occasione', async () => {
    await aggiungiAlDiario(outfit(), '2026-11-05', 'casual');
    await aggiungiAlDiario(outfit(), '2026-11-05', 'casual');
    await aggiungiAlDiario(outfit(), '2026-11-05', 'sport');
    await aggiungiAlDiario(outfit(), '2026-11-04', 'casual');
    const diario = await elencoDiario();
    expect(diario).toHaveLength(3);
    expect(diario[0].data).toBe('2026-11-05');
  });
});

describe('collage', () => {
  it('dispone i capi su due colonne e centra l’ultimo se sono dispari', () => {
    const d = disposizione(5, 3);
    expect(d.larghezza).toBe(1080);
    expect(d.celle).toHaveLength(5);
    expect(d.celle[0].x).toBeLessThan(d.celle[1].x);
    expect(d.celle[4].x + d.celle[4].w / 2).toBeCloseTo(540);
    expect(d.piccoli).toHaveLength(3);
    expect(d.altezza).toBeGreaterThan(d.piccoli[2].y + d.piccoli[2].h);
  });
});

describe('valigia', () => {
  const giorni = ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'].map((data, i) => ({
    data,
    condizioni: meteo(i === 2 ? 6 : 12, i === 3 ? { probPioggia: 80, pioggia: 4, codice: 63 } : {}),
  }));
  const opzioni = { genere: 'donna' as const, sensibilita: 'normale' as const, armadio: [], latitudine: 44, extra: [] };

  it('conta i capi: una maglia al giorno, pantaloni ogni tre giorni, una giacca', () => {
    expect(quantitaPer('base', 5)).toBe(5);
    expect(quantitaPer('base', 12)).toBe(7);
    expect(quantitaPer('sotto', 5)).toBe(2);
    expect(quantitaPer('capospalla', 5)).toBe(1);
  });

  it('prepara l’elenco con meteo, ombrello ed essenziali', () => {
    const v = preparaValigia(giorni, opzioni);
    expect(v.giorni).toBe(5);
    expect(v.riepilogo).toContain('5 giorni');
    expect(v.riepilogo).toContain('Pioggia prevista in 1 giorno');
    expect(v.voci.some((x) => x.pezzo.categoria === 'ombrello')).toBe(true);
    expect(v.voci.reduce((s, x) => s + (x.slot === 'base' ? x.quantita : 0), 0)).toBeGreaterThanOrEqual(5);
    expect(v.essenziali).toContain('Biancheria × 5');
    expect(v.essenziali).toContain('Sacchetto per i panni sporchi');
    // Le voci seguono l'ordine dell'outfit: prima i capispalla, alla fine gli accessori.
    expect(v.voci[0].slot).toBe('capospalla');
    expect(v.voci[v.voci.length - 1].slot).toBe('accessorio');
  });

  it('aggiunge le occasioni speciali e usa i capi dell’armadio', () => {
    const v = preparaValigia(giorni, { ...opzioni, armadio: [capo], extra: ['elegante'] });
    expect(v.voci.some((x) => x.pezzo.capo?.id === 'c1')).toBe(true);
    expect(v.voci.some((x) => ['vestito', 'pantaloni-eleganti', 'gonna-lunga', 'palazzo', 'tuta-intera'].includes(x.pezzo.categoria))).toBe(true);
    const testo = valigiaInTesto(v, 'Parigi');
    expect(testo.split('\n')[0]).toBe('Valigia per Parigi');
    expect(testo).toContain('☐ Pigiama');
  });

  it('con il caldo ricorda la crema solare', () => {
    const v = preparaValigia([{ data: '2026-07-10', condizioni: meteo(29, { uv: 8 }) }], opzioni);
    expect(v.essenziali).toContain('Crema solare');
    expect(v.riepilogo).toContain('1 giorno');
    expect(preparaValigia([], opzioni).riepilogo).toContain('Nessun giorno');
  });
});
