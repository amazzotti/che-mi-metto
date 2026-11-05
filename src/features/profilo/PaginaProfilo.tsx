import { type ChangeEvent, useState } from 'react';
import { useApp } from '../../app/contesto';
import type { Genere, Sensibilita } from '../../shared/tipi';
import { IconaPosizione } from '../../shared/ui/Icone';
import { Scelta } from '../../shared/ui/Scelta';
import { cancellaTutto, fileBackup, ripristinaBackup, validaBackup } from './backup';
import { aggiornaProfilo } from './profilo';

export const GENERI: { id: Genere; nome: string }[] = [
  { id: 'donna', nome: 'Donna' },
  { id: 'uomo', nome: 'Uomo' },
];

export const SENSIBILITA: { id: Sensibilita; nome: string }[] = [
  { id: 'freddoloso', nome: 'Soffro il freddo' },
  { id: 'normale', nome: 'Nella media' },
  { id: 'caloroso', nome: 'Soffro il caldo' },
];

export function PaginaProfilo() {
  const { profilo, armadio, apriPosizione } = useApp();
  const [messaggio, setMessaggio] = useState<string | null>(null);

  const esporta = async () => {
    const { nome, blob } = await fileBackup();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    setMessaggio(`Backup creato: ${nome}. Su iPhone lo trovi nell'app File.`);
  };

  const importa = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dati = validaBackup(JSON.parse(await file.text()));
      if (!confirm(`Sostituire i dati attuali con il backup (${dati.capi.length} capi, ${dati.impegni.length} impegni)?`)) return;
      await ripristinaBackup(dati);
      setMessaggio('Backup ripristinato.');
    } catch (err) {
      setMessaggio(err instanceof Error ? err.message : 'File non valido');
    }
  };

  const cancella = async () => {
    if (confirm('Cancellare profilo, armadio e impegni da questo telefono? Non si può annullare.')) {
      await cancellaTutto();
    }
  };

  return (
    <>
      <section className="sezione" aria-labelledby="titolo-profilo">
        <h2 id="titolo-profilo">Profilo</h2>
        <div className="campo">
          <span>Consigli per</span>
          <Scelta etichetta="Genere" opzioni={GENERI} valore={profilo.genere} onCambia={(genere) => void aggiornaProfilo({ genere })} />
        </div>
        <div className="campo">
          <span>Come senti la temperatura?</span>
          <Scelta
            etichetta="Sensibilità al freddo"
            opzioni={SENSIBILITA}
            valore={profilo.sensibilita}
            onCambia={(sensibilita) => void aggiornaProfilo({ sensibilita })}
          />
        </div>
        <div className="campo">
          <span>Luogo per il meteo</span>
          <button type="button" className="bottone secondario largo" onClick={apriPosizione}>
            <IconaPosizione /> {profilo.posizione?.nome ?? 'Scegli il luogo'}
          </button>
        </div>
      </section>

      <section className="sezione" aria-labelledby="titolo-dati">
        <h2 id="titolo-dati">I tuoi dati</h2>
        <p className="testo">
          Armadio, foto e impegni restano <strong>solo su questo telefono</strong>: niente account, niente server. Fai ogni tanto un
          backup, così non perdi nulla se cambi telefono o cancelli i dati di Safari.
        </p>
        <p className="nota-piccola">{armadio.length} capi nell&apos;armadio.</p>
        <div className="azioni-colonna">
          <button type="button" className="bottone secondario largo" onClick={() => void esporta()}>
            Esporta backup
          </button>
          <label className="bottone secondario largo">
            Importa backup
            <input type="file" accept="application/json,.json" className="nascosto" onChange={importa} aria-label="File di backup" />
          </label>
          <button type="button" className="bottone pericolo largo" onClick={() => void cancella()}>
            Cancella tutti i dati
          </button>
        </div>
        {messaggio && (
          <p className="nota-colore" role="status">
            {messaggio}
          </p>
        )}
      </section>

      <section className="sezione" aria-labelledby="titolo-info">
        <h2 id="titolo-info">Informazioni</h2>
        <p className="testo">
          I consigli nascono da regole su temperatura percepita, pioggia, vento, sole, stagione e occasione. Le sagome sono disegnate a
          mano e prendono il colore dei capi.
        </p>
        <ul className="crediti">
          <li>
            Meteo: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo.com</a> (CC BY 4.0)
          </li>
          <li>
            Nomi dei luoghi: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
          </li>
          <li>Versione {__VERSIONE__}</li>
        </ul>
      </section>
    </>
  );
}
