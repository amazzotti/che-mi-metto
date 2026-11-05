import { useState } from 'react';
import { useApp } from '../../app/contesto';
import { aggiungiGiorni, giornoEsteso } from '../../shared/date';
import type { Occasione, Posizione } from '../../shared/tipi';
import { Foglio } from '../../shared/ui/Foglio';
import { SceltaMultipla } from '../../shared/ui/Scelta';
import { condizioniGiorno } from '../meteo/condizioni';
import { scaricaPrevisioni } from '../meteo/openMeteo';
import { SceltaPosizione } from '../meteo/SceltaPosizione';
import { Figura, PallinoColore } from '../outfit/SchedaOutfit';
import { type GiornoViaggio, preparaValigia, type Valigia, valigiaInTesto } from './valigia';

/** Open-Meteo dà le previsioni fino a 16 giorni (oggi compreso). */
const GIORNI_MASSIMI = 15;

const EXTRA: { id: Occasione; nome: string }[] = [
  { id: 'elegante', nome: 'Una serata elegante' },
  { id: 'lavoro', nome: 'Lavoro' },
  { id: 'aperitivo', nome: 'Aperitivo' },
  { id: 'sport', nome: 'Palestra / sport' },
];

export function FoglioValigia({ aperto, onChiudi }: { aperto: boolean; onChiudi: () => void }) {
  return (
    <Foglio aperto={aperto} titolo="Prepara la valigia" onChiudi={onChiudi}>
      {aperto && <Valigiatore />}
    </Foglio>
  );
}

function Valigiatore() {
  const { oggi, profilo, armadio } = useApp();
  const [meta, setMeta] = useState<Posizione | null>(null);
  const [dal, setDal] = useState(aggiungiGiorni(oggi, 1));
  const [al, setAl] = useState(aggiungiGiorni(oggi, 3));
  const [extra, setExtra] = useState<Occasione[]>([]);
  const [lavoro, setLavoro] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [valigia, setValigia] = useState<Valigia | null>(null);
  const [spuntati, setSpuntati] = useState<string[]>([]);
  const ultimo = aggiungiGiorni(oggi, GIORNI_MASSIMI);

  const prepara = async () => {
    if (!meta) return;
    if (al < dal) {
      setErrore('La data di ritorno viene prima di quella di partenza.');
      return;
    }
    setLavoro(true);
    setErrore(null);
    try {
      const previsioni = await scaricaPrevisioni(meta.lat, meta.lon, undefined, GIORNI_MASSIMI + 1);
      const giorni: GiornoViaggio[] = [];
      for (let d = dal; d <= al; d = aggiungiGiorni(d, 1)) {
        const condizioni = condizioniGiorno(previsioni, d, 0);
        if (condizioni) giorni.push({ data: d, condizioni });
      }
      setValigia(
        preparaValigia(giorni, {
          genere: profilo.genere,
          sensibilita: profilo.sensibilita,
          correzione: profilo.correzione,
          armadio,
          latitudine: previsioni.latitudine,
          extra,
        }),
      );
      setSpuntati([]);
    } catch (e) {
      setErrore(`Non riesco a scaricare il meteo di ${meta.nome}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLavoro(false);
    }
  };

  const spunta = (chiave: string) => setSpuntati((s) => (s.includes(chiave) ? s.filter((x) => x !== chiave) : [...s, chiave]));

  const condividi = async () => {
    if (!valigia || !meta) return;
    const testo = valigiaInTesto(valigia, meta.nome);
    try {
      if (typeof navigator.share === 'function') await navigator.share({ title: `Valigia per ${meta.nome}`, text: testo });
      else await navigator.clipboard.writeText(testo);
    } catch {
      /* condivisione annullata */
    }
  };

  if (valigia && meta) {
    const totale = valigia.voci.length + valigia.essenziali.length;
    return (
      <div className="modulo valigia">
        <p className="valigia-meta">
          <strong>{meta.nome}</strong> · {giornoEsteso(dal)} – {giornoEsteso(al)}
        </p>
        <p className="nota-colore">{valigia.riepilogo}</p>
        <p className="nota-piccola">
          Spuntati {spuntati.length} su {totale}
        </p>
        <ul className="valigia-elenco" aria-label="Capi da mettere in valigia">
          {valigia.voci.map((v) => (
            <li key={v.chiave}>
              <label className={spuntati.includes(v.chiave) ? 'spuntato' : undefined}>
                <input type="checkbox" checked={spuntati.includes(v.chiave)} onChange={() => spunta(v.chiave)} />
                <span className="valigia-figura">
                  <Figura pezzo={v.pezzo} />
                </span>
                <span className="valigia-testo">
                  <strong>
                    {v.pezzo.nome}
                    {v.quantita > 1 ? ` × ${v.quantita}` : ''}
                  </strong>
                  <span className="tessera-colore">
                    <PallinoColore colore={v.pezzo.colore} colore2={v.pezzo.colore2} fantasia={v.pezzo.fantasia} />
                    {v.pezzo.nomeColore}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <h3>Da non dimenticare</h3>
        <ul className="valigia-elenco semplice" aria-label="Da non dimenticare">
          {valigia.essenziali.map((e) => (
            <li key={e}>
              <label className={spuntati.includes(e) ? 'spuntato' : undefined}>
                <input type="checkbox" checked={spuntati.includes(e)} onChange={() => spunta(e)} />
                <span>{e}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="idee-azioni">
          <button type="button" className="bottone" onClick={() => setValigia(null)}>
            Cambia viaggio
          </button>
          <button type="button" className="bottone" onClick={() => void condividi()}>
            Condividi elenco
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modulo">
      <div className="campo">
        <span>Dove vai?</span>
        {meta ? (
          <div className="posizione-scelta">
            <strong>{meta.nome}</strong>
            <button type="button" className="bottone piccolo" onClick={() => setMeta(null)}>
              Cambia
            </button>
          </div>
        ) : (
          <SceltaPosizione onScelta={setMeta} conGps={false} />
        )}
      </div>
      <div className="date-viaggio">
        <label className="campo">
          <span>Partenza</span>
          <input type="date" value={dal} min={oggi} max={ultimo} onChange={(e) => setDal(e.target.value)} />
        </label>
        <label className="campo">
          <span>Ritorno</span>
          <input type="date" value={al} min={dal} max={ultimo} onChange={(e) => setAl(e.target.value)} />
        </label>
      </div>
      <p className="nota-piccola">Le previsioni arrivano fino a due settimane da oggi.</p>
      <div className="campo">
        <span>Ci sarà anche…</span>
        <SceltaMultipla etichetta="Occasioni del viaggio" opzioni={EXTRA} valori={extra} onCambia={setExtra} />
      </div>
      {errore && (
        <p className="avviso" role="alert">
          {errore}
        </p>
      )}
      <button type="button" className="bottone primario largo" disabled={!meta || lavoro} onClick={() => void prepara()}>
        {lavoro ? 'Guardo il meteo della meta…' : 'Prepara la valigia'}
      </button>
    </div>
  );
}
