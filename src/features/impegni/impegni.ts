import { useLiveQuery } from 'dexie-react-hooks';
import { db, nuovoId } from '../../shared/db';
import type { Impegno } from '../../shared/tipi';

export async function aggiungiImpegno(dati: Omit<Impegno, 'id'>): Promise<Impegno> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dati.data)) throw new Error('Data non valida');
  if (!/^\d{2}:\d{2}$/.test(dati.ora)) throw new Error('Ora non valida');
  const impegno: Impegno = { ...dati, titolo: dati.titolo.trim(), id: nuovoId() };
  await db.impegni.add(impegno);
  return impegno;
}

export async function aggiornaImpegno(id: string, modifiche: Partial<Omit<Impegno, 'id'>>): Promise<void> {
  await db.impegni.update(id, modifiche);
}

export async function eliminaImpegno(id: string): Promise<void> {
  await db.impegni.delete(id);
}

export async function impegniDelGiorno(data: string): Promise<Impegno[]> {
  const lista = await db.impegni.where('data').equals(data).toArray();
  return lista.sort((a, b) => a.ora.localeCompare(b.ora));
}

/** Gli impegni dei giorni passati non servono più. */
export async function eliminaImpegniPassati(oggi: string): Promise<number> {
  return db.impegni.where('data').below(oggi).delete();
}

export function useImpegni(data: string): Impegno[] | undefined {
  return useLiveQuery(() => impegniDelGiorno(data), [data], undefined);
}

/** Numero di impegni per giorno, per i pallini nella vista settimana. */
export function useContaImpegni(): Record<string, number> {
  return (
    useLiveQuery(
      async () => {
        const conta: Record<string, number> = {};
        await db.impegni.each((i) => {
          conta[i.data] = (conta[i.data] ?? 0) + 1;
        });
        return conta;
      },
      [],
      {},
    ) ?? {}
  );
}
