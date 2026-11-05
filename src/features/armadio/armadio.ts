import { useLiveQuery } from 'dexie-react-hooks';
import { type CapoSalvato, chiediArchivioPersistente, db, nuovoId } from '../../shared/db';
import type { Capo } from '../../shared/tipi';
import type { Outfit } from '../outfit/motore';

export type NuovoCapo = Omit<Capo, 'id' | 'creato'>;

/*
 * Le foto vengono salvate come ArrayBuffer e non come Blob: alcuni WebKit non sanno
 * mettere un Blob in IndexedDB, mentre un ArrayBuffer funziona ovunque.
 */
async function fotoInDati(foto: Blob | undefined): Promise<CapoSalvato['foto']> {
  if (!foto) return undefined;
  return { dati: await foto.arrayBuffer(), tipo: foto.type || 'image/jpeg' };
}

export async function inSalvato(capo: Capo): Promise<CapoSalvato> {
  const { foto, ...resto } = capo;
  const dati = await fotoInDati(foto);
  return dati ? { ...resto, foto: dati } : resto;
}

export function daSalvato(capo: CapoSalvato): Capo {
  const { foto, ...resto } = capo;
  return foto ? { ...resto, foto: new Blob([foto.dati], { type: foto.tipo }) } : resto;
}

export async function aggiungiCapo(dati: NuovoCapo): Promise<Capo> {
  const capo: Capo = { ...dati, id: nuovoId(), creato: Date.now() };
  await db.capi.add(await inSalvato(capo));
  void chiediArchivioPersistente();
  return capo;
}

export async function aggiornaCapo(id: string, modifiche: Partial<NuovoCapo>): Promise<void> {
  const attuale = await db.capi.get(id);
  if (!attuale) throw new Error('Capo non trovato');
  await db.capi.put(await inSalvato({ ...daSalvato(attuale), ...modifiche }));
}

/** "Lo metto oggi": conta un uso e ricorda il giorno, per variare nei giorni seguenti. */
export async function segnaIndossati(outfit: Pick<Outfit, 'pezzi' | 'accessori'>, data: string): Promise<void> {
  const ids = [...outfit.pezzi, ...outfit.accessori].flatMap((p) => (p.capo ? [p.capo.id] : []));
  await db.transaction('rw', db.capi, async () => {
    for (const id of ids) {
      const capo = await db.capi.get(id);
      // Lo stesso giorno conta una volta sola.
      if (capo && capo.ultimoUso !== data) await db.capi.update(id, { usi: (capo.usi ?? 0) + 1, ultimoUso: data });
    }
  });
}

export async function eliminaCapo(id: string): Promise<void> {
  await db.capi.delete(id);
}

export async function elencoCapi(): Promise<Capo[]> {
  return (await db.capi.orderBy('creato').toArray()).map(daSalvato);
}

export function useArmadio(): Capo[] | undefined {
  return useLiveQuery(elencoCapi, [], undefined);
}
