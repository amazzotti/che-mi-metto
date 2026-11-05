import { useLiveQuery } from 'dexie-react-hooks';
import { chiediArchivioPersistente, db } from '../../shared/db';
import type { Profilo } from '../../shared/tipi';

const CHIAVE = 'profilo';

export async function leggiProfilo(): Promise<Profilo | null> {
  const riga = await db.impostazioni.get(CHIAVE);
  return (riga?.valore as Profilo | undefined) ?? null;
}

export async function salvaProfilo(profilo: Profilo): Promise<void> {
  await db.impostazioni.put({ chiave: CHIAVE, valore: profilo });
  void chiediArchivioPersistente();
}

export async function aggiornaProfilo(modifiche: Partial<Profilo>): Promise<void> {
  const attuale = await leggiProfilo();
  if (!attuale) throw new Error('Profilo non ancora creato');
  await salvaProfilo({ ...attuale, ...modifiche });
}

/** undefined = sto ancora leggendo, null = primo avvio. */
export function useProfilo(): Profilo | null | undefined {
  return useLiveQuery(leggiProfilo, [], undefined);
}
