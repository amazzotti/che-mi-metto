import { db } from '../../shared/db';
import type { Capo, Impegno, Profilo } from '../../shared/tipi';
import { elencoCapi, inSalvato } from '../armadio/armadio';
import { esisteCategoria } from '../outfit/catalogo';

type CapoEsportato = Omit<Capo, 'foto'> & { foto?: string };

export interface DatiBackup {
  app: 'che-mi-metto';
  versione: 1;
  esportato: string;
  profilo: Profilo | null;
  capi: CapoEsportato[];
  impegni: Impegno[];
}

export async function blobInDataUrl(blob: Blob): Promise<string> {
  const byte = new Uint8Array(await blob.arrayBuffer());
  let binario = '';
  for (let i = 0; i < byte.length; i += 0x8000) binario += String.fromCharCode(...byte.subarray(i, i + 0x8000));
  return `data:${blob.type || 'application/octet-stream'};base64,${btoa(binario)}`;
}

export function dataUrlInBlob(url: string): Blob {
  const m = /^data:([^;,]+)?;base64,(.*)$/.exec(url);
  if (!m) throw new Error('Foto non valida nel backup');
  const binario = atob(m[2]);
  const byte = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) byte[i] = binario.charCodeAt(i);
  return new Blob([byte], { type: m[1] ?? 'image/jpeg' });
}

export async function datiBackup(adesso = new Date()): Promise<DatiBackup> {
  const [riga, capi, impegni] = await Promise.all([db.impostazioni.get('profilo'), elencoCapi(), db.impegni.toArray()]);
  return {
    app: 'che-mi-metto',
    versione: 1,
    esportato: adesso.toISOString(),
    profilo: (riga?.valore as Profilo | undefined) ?? null,
    capi: await Promise.all(
      capi.map(async ({ foto, ...resto }) => (foto ? { ...resto, foto: await blobInDataUrl(foto) } : resto)),
    ),
    impegni,
  };
}

export async function fileBackup(adesso = new Date()): Promise<{ nome: string; blob: Blob }> {
  const dati = await datiBackup(adesso);
  return {
    nome: `che-mi-metto-backup-${adesso.toISOString().slice(0, 10)}.json`,
    blob: new Blob([JSON.stringify(dati)], { type: 'application/json' }),
  };
}

/** Controlla che il file sia davvero un backup di questa app prima di toccare i dati. */
export function validaBackup(dati: unknown): DatiBackup {
  const d = dati as Partial<DatiBackup> | null;
  if (!d || d.app !== 'che-mi-metto' || d.versione !== 1 || !Array.isArray(d.capi) || !Array.isArray(d.impegni)) {
    throw new Error('Questo file non è un backup di "Che mi metto?"');
  }
  for (const c of d.capi) {
    if (typeof c?.id !== 'string' || !esisteCategoria(String(c.categoria)) || !/^#[0-9a-f]{6}$/i.test(String(c.colore))) {
      throw new Error('Il backup contiene un capo non valido');
    }
  }
  for (const i of d.impegni) {
    if (typeof i?.id !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(String(i.data)) || !/^\d{2}:\d{2}$/.test(String(i.ora))) {
      throw new Error('Il backup contiene un impegno non valido');
    }
  }
  return d as DatiBackup;
}

/** Sostituisce tutti i dati con quelli del backup. */
export async function ripristinaBackup(dati: DatiBackup): Promise<void> {
  const capi: Capo[] = dati.capi.map(({ foto, ...resto }) => (foto ? { ...resto, foto: dataUrlInBlob(foto) } : resto));
  // Le conversioni vanno fatte prima: dentro una transazione IndexedDB si può aspettare solo il database.
  const salvati = await Promise.all(capi.map(inSalvato));
  await db.transaction('rw', db.capi, db.impegni, db.impostazioni, async () => {
    await Promise.all([db.capi.clear(), db.impegni.clear()]);
    await db.capi.bulkAdd(salvati);
    await db.impegni.bulkAdd(dati.impegni);
    if (dati.profilo) await db.impostazioni.put({ chiave: 'profilo', valore: dati.profilo });
  });
}

export async function cancellaTutto(): Promise<void> {
  await db.transaction('rw', db.capi, db.impegni, db.impostazioni, async () => {
    await Promise.all([db.capi.clear(), db.impegni.clear(), db.impostazioni.clear()]);
  });
  try {
    localStorage.clear();
  } catch {
    /* niente */
  }
}
