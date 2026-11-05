import { describe, expect, it } from 'vitest';
import type { Capo } from '../../shared/tipi';
import { cambiaLucchetto } from '../giornata/VistaGiorno';
import type { Pezzo } from '../outfit/motore';
import { modelli, nomeConModello } from '../outfit/modelli';
import { nuovaCorrezione } from '../profilo/Riscontro';
import { calcolaStatistiche } from './Statistiche';

const capo = (id: string, usi?: number, altro: Partial<Capo> = {}): Capo => ({
  id,
  categoria: 'jeans',
  colore: '#4a6b8a',
  occasioni: ['casual'],
  impermeabile: false,
  creato: Number(id.replace(/\D/g, '')) || 0,
  usi,
  ...altro,
});

const pezzo = (slot: Pezzo['slot'], categoria: Pezzo['categoria'], bloccato = false): Pezzo => ({
  slot,
  categoria,
  nome: categoria,
  colore: '#151515',
  nomeColore: 'nero',
  bloccato: bloccato || undefined,
});

describe('statistiche armadio', () => {
  it('conta usati, mai messi, da lavare e i più messi', () => {
    const s = calcolaStatistiche([capo('c1', 5), capo('c2'), capo('c3', 2, { daLavare: true }), capo('c4', 9)]);
    expect(s).toMatchObject({ totale: 4, usati: 3, percentualeUsati: 75, daLavare: 1 });
    expect(s.piuMessi.map((c) => c.id)).toEqual(['c4', 'c1', 'c3']);
    expect(s.maiMessi.map((c) => c.id)).toEqual(['c2']);
    expect(calcolaStatistiche([]).percentualeUsati).toBe(0);
  });
});

describe('"Ieri com\'era?"', () => {
  it('sposta la correzione di mezzo grado, entro ±4°', () => {
    expect(nuovaCorrezione(undefined, 'freddo')).toBe(0.5);
    expect(nuovaCorrezione(1, 'caldo')).toBe(0.5);
    expect(nuovaCorrezione(2, 'giusto')).toBe(2);
    expect(nuovaCorrezione(4, 'freddo')).toBe(4);
    expect(nuovaCorrezione(-4, 'caldo')).toBe(-4);
  });
});

describe('lucchetto', () => {
  it('fissa un capo per parte dell’outfit e lo libera al secondo tocco', () => {
    let b = cambiaLucchetto([], pezzo('sotto', 'jeans'));
    expect(b).toHaveLength(1);
    expect(b[0].bloccato).toBe(true);
    b = cambiaLucchetto(b, pezzo('sotto', 'chino'));
    expect(b.map((p) => p.categoria)).toEqual(['chino']);
    b = cambiaLucchetto(b, pezzo('scarpe', 'sneakers'));
    expect(b).toHaveLength(2);
    b = cambiaLucchetto(b, pezzo('scarpe', 'sneakers', true));
    expect(b.map((p) => p.categoria)).toEqual(['chino']);
  });

  it('un vestito intero libera gonna/pantaloni e maglia, e viceversa', () => {
    let b = cambiaLucchetto([pezzo('sotto', 'gonna', true), pezzo('base', 'top', true), pezzo('scarpe', 'decollete', true)], pezzo('intero', 'vestito'));
    expect(b.map((p) => p.slot).sort()).toEqual(['intero', 'scarpe']);
    b = cambiaLucchetto(b, pezzo('sotto', 'gonna'));
    expect(b.map((p) => p.slot).sort()).toEqual(['scarpe', 'sotto']);
  });
});

describe('modelli delle sagome', () => {
  it('ha forme diverse per donna e uomo', () => {
    expect(modelli('jeans', 'donna').map((m) => m.nome)).toEqual(['skinny', 'a zampa']);
    expect(modelli('jeans', 'uomo').map((m) => m.nome)).toEqual([undefined, 'slim']);
    expect(modelli('gonna', 'donna')).toHaveLength(3);
    expect(nomeConModello('jeans', 'donna', 1)).toBe('Jeans a zampa');
    expect(nomeConModello('shorts', 'donna', 0)).toBe('Shorts');
    expect(nomeConModello('shorts', 'uomo', 0)).toBe('Bermuda');
    expect(nomeConModello('jeans', 'donna', 5)).toBe('Jeans a zampa');
  });
});
