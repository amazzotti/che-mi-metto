import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../shared/db';
import { PROFILO, svuotaDati } from '../../test/aiuti';
import { aggiungiCapo, elencoCapi } from '../armadio/armadio';
import { aggiungiImpegno, eliminaImpegniPassati, impegniDelGiorno } from '../impegni/impegni';
import { blobInDataUrl, cancellaTutto, dataUrlInBlob, datiBackup, fileBackup, ripristinaBackup, validaBackup } from './backup';
import { aggiornaProfilo, leggiProfilo, salvaProfilo } from './profilo';

describe('dati locali', () => {
  beforeEach(svuotaDati);

  it('salva e aggiorna il profilo', async () => {
    expect(await leggiProfilo()).toBeNull();
    await expect(aggiornaProfilo({ genere: 'uomo' })).rejects.toThrow();
    await salvaProfilo(PROFILO);
    await aggiornaProfilo({ sensibilita: 'freddoloso' });
    expect(await leggiProfilo()).toMatchObject({ genere: 'donna', sensibilita: 'freddoloso' });
  });

  it('ordina gli impegni per ora e cancella quelli passati', async () => {
    await aggiungiImpegno({ data: '2026-11-05', ora: '20:00', titolo: 'Cena', occasione: 'elegante' });
    await aggiungiImpegno({ data: '2026-11-05', ora: '08:30', titolo: '  Ufficio  ', occasione: 'lavoro' });
    await aggiungiImpegno({ data: '2026-11-03', ora: '10:00', titolo: 'Vecchio', occasione: 'casual' });
    const oggi = await impegniDelGiorno('2026-11-05');
    expect(oggi.map((i) => i.titolo)).toEqual(['Ufficio', 'Cena']);
    expect(await eliminaImpegniPassati('2026-11-05')).toBe(1);
    expect(await db.impegni.count()).toBe(2);
    await expect(aggiungiImpegno({ data: 'domani', ora: '10:00', titolo: 'x', occasione: 'casual' })).rejects.toThrow('Data');
    await expect(aggiungiImpegno({ data: '2026-11-05', ora: '10', titolo: 'x', occasione: 'casual' })).rejects.toThrow('Ora');
  });
});

describe('backup', () => {
  beforeEach(svuotaDati);

  it('converte le foto in testo e ritorno', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3, 250])], { type: 'image/jpeg' });
    const url = await blobInDataUrl(blob);
    expect(url).toBe('data:image/jpeg;base64,AQID+g==');
    const indietro = dataUrlInBlob(url);
    expect(indietro.type).toBe('image/jpeg');
    expect(Array.from(new Uint8Array(await indietro.arrayBuffer()))).toEqual([1, 2, 3, 250]);
    expect(() => dataUrlInBlob('ciao')).toThrow();
  });

  it('esporta e ripristina tutto, foto comprese', async () => {
    await salvaProfilo(PROFILO);
    await aggiungiCapo({
      categoria: 'jeans',
      colore: '#4a6b8a',
      occasioni: ['casual'],
      impermeabile: false,
      foto: new Blob([new Uint8Array([9, 8, 7])], { type: 'image/jpeg' }),
    });
    await aggiungiImpegno({ data: '2026-11-06', ora: '19:00', titolo: 'Aperitivo', occasione: 'aperitivo' });

    const { nome, blob } = await fileBackup(new Date('2026-11-05T10:00:00Z'));
    expect(nome).toBe('che-mi-metto-backup-2026-11-05.json');
    const dati = validaBackup(JSON.parse(await blob.text()));
    expect(dati.capi[0].foto).toMatch(/^data:image\/jpeg;base64,/);

    await cancellaTutto();
    expect(await elencoCapi()).toHaveLength(0);
    expect(await leggiProfilo()).toBeNull();

    await ripristinaBackup(dati);
    const capi = await elencoCapi();
    expect(capi).toHaveLength(1);
    expect(capi[0].foto).toBeInstanceOf(Blob);
    expect(Array.from(new Uint8Array(await capi[0].foto!.arrayBuffer()))).toEqual([9, 8, 7]);
    expect(await leggiProfilo()).toEqual(PROFILO);
    expect(await impegniDelGiorno('2026-11-06')).toHaveLength(1);
  });

  it('rifiuta file che non sono backup validi', async () => {
    expect(() => validaBackup(null)).toThrow('non è un backup');
    expect(() => validaBackup({ app: 'altro' })).toThrow('non è un backup');
    const base = await datiBackup();
    expect(() => validaBackup({ ...base, capi: [{ id: 'x', categoria: 'astronave', colore: '#000000' }] })).toThrow('capo non valido');
    expect(() => validaBackup({ ...base, impegni: [{ id: 'x', data: 'ieri', ora: '10:00' }] })).toThrow('impegno non valido');
    expect(validaBackup(base).versione).toBe(1);
  });
});
