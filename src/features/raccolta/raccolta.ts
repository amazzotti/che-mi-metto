/**
 * Outfit salvati (come i "lookbook" delle app di armadio digitale) e diario di cosa hai indossato.
 * Si salva una fotografia dell'outfit: i capi dell'armadio sono richiamati per id, così se cambi
 * la foto di un capo cambia anche negli outfit salvati.
 */
import { useLiveQuery } from 'dexie-react-hooks';
import { db, nuovoId } from '../../shared/db';
import type { Capo, Occasione } from '../../shared/tipi';
import type { Outfit, Pezzo } from '../outfit/motore';

export type PezzoSalvato = Omit<Pezzo, 'capo' | 'mancante' | 'bloccato'> & { capoId?: string };

export interface OutfitSalvato {
  id: string;
  creato: number;
  titolo: string;
  occasione: Occasione;
  /** Giorno per cui era stato proposto, "AAAA-MM-GG". */
  data: string;
  pezzi: PezzoSalvato[];
  accessori: PezzoSalvato[];
}

export interface VoceDiario {
  id: string;
  /** Giorno in cui l'hai indossato, "AAAA-MM-GG". */
  data: string;
  occasione: Occasione;
  pezzi: PezzoSalvato[];
  accessori: PezzoSalvato[];
}

export function inSalvati(pezzi: Pezzo[]): PezzoSalvato[] {
  // Togliamo il capo intero (foto comprese): basta il suo id.
  return pezzi.map((p) => {
    const { capo, ...resto } = p;
    const pulito: PezzoSalvato = { ...resto, capoId: capo?.id };
    delete (pulito as Partial<Pezzo>).mancante;
    delete (pulito as Partial<Pezzo>).bloccato;
    return pulito;
  });
}

/** Ricollega i pezzi salvati ai capi dell'armadio (se un capo è stato eliminato resta la sagoma). */
export function ripristina(pezzi: PezzoSalvato[], armadio: Capo[]): Pezzo[] {
  return pezzi.map(({ capoId, ...resto }) => {
    const capo = capoId ? armadio.find((c) => c.id === capoId) : undefined;
    return capo ? { ...resto, capo } : resto;
  });
}

export async function salvaOutfit(outfit: Pick<Outfit, 'pezzi' | 'accessori'>, dati: { titolo: string; occasione: Occasione; data: string }) {
  const nuovo: OutfitSalvato = {
    id: nuovoId(),
    creato: Date.now(),
    ...dati,
    pezzi: inSalvati(outfit.pezzi),
    accessori: inSalvati(outfit.accessori),
  };
  await db.outfit.add(nuovo);
  return nuovo;
}

export async function eliminaOutfit(id: string) {
  await db.outfit.delete(id);
}

/** Un solo outfit per giorno e occasione: se lo segni di nuovo, sostituisce il precedente. */
export async function aggiungiAlDiario(outfit: Pick<Outfit, 'pezzi' | 'accessori'>, data: string, occasione: Occasione) {
  await db.transaction('rw', db.diario, async () => {
    await db.diario.where('data').equals(data).filter((v) => v.occasione === occasione).delete();
    await db.diario.add({ id: nuovoId(), data, occasione, pezzi: inSalvati(outfit.pezzi), accessori: inSalvati(outfit.accessori) });
  });
}

export async function eliminaDalDiario(id: string) {
  await db.diario.delete(id);
}

export function elencoOutfit(): Promise<OutfitSalvato[]> {
  return db.outfit.orderBy('creato').reverse().toArray();
}

export function elencoDiario(): Promise<VoceDiario[]> {
  return db.diario.orderBy('data').reverse().toArray();
}

export function useOutfitSalvati(): OutfitSalvato[] {
  return useLiveQuery(elencoOutfit, [], []) ?? [];
}

export function useDiario(): VoceDiario[] {
  return useLiveQuery(elencoDiario, [], []) ?? [];
}
