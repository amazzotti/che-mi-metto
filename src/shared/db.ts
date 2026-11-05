import Dexie, { type Table } from 'dexie';
import type { OutfitSalvato, VoceDiario } from '../features/raccolta/raccolta';
import type { Capo, Impegno } from './tipi';

/** Un capo come sta nel database: la foto è un ArrayBuffer con il suo tipo. */
export type CapoSalvato = Omit<Capo, 'foto'> & { foto?: { dati: ArrayBuffer; tipo: string } };

export interface Impostazione {
  chiave: string;
  valore: unknown;
}

/**
 * Tutti i dati restano nel browser (IndexedDB): niente account, niente server.
 * Per aggiungere in futuro funzioni condivise (es. spese di coppia) basta una nuova tabella
 * qui, oppure un altro "repository" che parla con un backend, senza toccare il resto.
 */
export class DbCheMiMetto extends Dexie {
  capi!: Table<CapoSalvato, string>;
  impegni!: Table<Impegno, string>;
  impostazioni!: Table<Impostazione, string>;
  outfit!: Table<OutfitSalvato, string>;
  diario!: Table<VoceDiario, string>;

  constructor(nome = 'che-mi-metto') {
    super(nome);
    this.version(1).stores({
      capi: 'id, categoria, creato',
      impegni: 'id, data',
      impostazioni: 'chiave',
    });
    // Versione 2: outfit salvati e diario di cosa hai indossato.
    this.version(2).stores({
      outfit: 'id, creato',
      diario: 'id, data',
    });
  }
}

export const db = new DbCheMiMetto();

/** Chiede al browser di non cancellare i dati da solo (importante su iPhone). */
export async function chiediArchivioPersistente(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

export function nuovoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // crypto.randomUUID esiste solo su https: in rete locale usiamo un ripiego.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
