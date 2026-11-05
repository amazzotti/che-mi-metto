import type { Occasione } from '../../shared/tipi';
import type { Stagione } from '../meteo/stagione';
import type { CategoriaId } from './catalogo';
import { eChiaro, nomeColore } from './colori';
import type { Palette } from './palette';

export type Fantasia = 'unita' | 'righe' | 'quadri' | 'pois' | 'fiori';

export const FANTASIE: { id: Fantasia; nome: string }[] = [
  { id: 'unita', nome: 'Tinta unita' },
  { id: 'righe', nome: 'Righe' },
  { id: 'quadri', nome: 'Quadri' },
  { id: 'pois', nome: 'Pois' },
  { id: 'fiori', nome: 'Fiori' },
];

export function eFantasia(x: unknown): x is Fantasia {
  return FANTASIE.some((f) => f.id === x);
}

const NOME_DESCRITTIVO: Record<Exclude<Fantasia, 'unita'>, string> = {
  righe: 'a righe',
  quadri: 'a quadri',
  pois: 'a pois',
  fiori: 'a fiori',
};

/** "bianco a righe blu navy", oppure solo "bianco" se è in tinta unita. */
export function descriviColore(colore: string, fantasia?: Fantasia, colore2?: string): string {
  const base = nomeColore(colore);
  if (!fantasia || fantasia === 'unita' || !colore2) return base;
  return `${base} ${NOME_DESCRITTIVO[fantasia]} ${nomeColore(colore2)}`;
}

/** Quali fantasie stanno bene su quali capi (le prime sono le più tipiche). */
const PER_CAPO: Partial<Record<CategoriaId, Exclude<Fantasia, 'unita'>[]>> = {
  camicia: ['righe', 'quadri'],
  'camicia-lino': ['righe'],
  tshirt: ['righe'],
  maglia: ['righe'],
  maglione: ['righe', 'quadri'],
  blusa: ['pois', 'fiori'],
  top: ['fiori', 'pois'],
  'vestito-estivo': ['fiori', 'pois'],
  vestito: ['pois'],
  gonna: ['quadri', 'fiori'],
  'gonna-lunga': ['fiori', 'pois'],
  sciarpa: ['quadri', 'righe'],
};

const PER_STAGIONE: Record<Stagione, Exclude<Fantasia, 'unita'>[]> = {
  inverno: ['righe', 'quadri', 'pois'],
  autunno: ['righe', 'quadri', 'pois'],
  primavera: ['righe', 'pois', 'fiori'],
  estate: ['righe', 'pois', 'fiori'],
};

const PER_OCCASIONE: Record<Occasione, Exclude<Fantasia, 'unita'>[]> = {
  casual: ['righe', 'quadri', 'pois', 'fiori'],
  aperitivo: ['righe', 'pois', 'fiori'],
  appuntamento: ['pois', 'fiori', 'righe'],
  lavoro: ['righe', 'quadri', 'pois'],
  elegante: ['pois'],
  sport: [],
};

/** Fantasie possibili per un capo, in base a stagione e occasione. */
export function fantasiePossibili(id: CategoriaId, stagione: Stagione, occasione: Occasione): Exclude<Fantasia, 'unita'>[] {
  return (PER_CAPO[id] ?? []).filter((f) => PER_STAGIONE[stagione].includes(f) && PER_OCCASIONE[occasione].includes(f));
}

/** Secondo colore della fantasia: deve staccare dal colore di fondo e stare nella palette. */
export function secondoColore(colore: string, pal: Palette, variante: number): string {
  const candidati = eChiaro(colore)
    ? [...pal.neutri, ...pal.accenti].filter((c) => !eChiaro(c))
    : [...pal.chiari, ...pal.accenti].filter((c) => eChiaro(c));
  const liberi = candidati.filter((c) => c !== colore);
  if (liberi.length === 0) return eChiaro(colore) ? '#1f2a44' : '#ffffff';
  return liberi[variante % liberi.length];
}
