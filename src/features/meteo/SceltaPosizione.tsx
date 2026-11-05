import { useEffect, useState } from 'react';
import type { Posizione } from '../../shared/tipi';
import { IconaPosizione } from '../../shared/ui/Icone';
import { cercaCitta, posizioneGps } from './posizione';

interface Props {
  onScelta: (p: Posizione) => void;
}

type Risultato = Posizione & { dettaglio: string };

/** Posizione dal GPS del telefono oppure cercando la città. */
export function SceltaPosizione({ onScelta }: Props) {
  const [testo, setTesto] = useState('');
  const [risultati, setRisultati] = useState<Risultato[]>([]);
  const [cerco, setCerco] = useState(false);
  const [gps, setGps] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    if (testo.trim().length < 2) return;
    const controllo = new AbortController();
    const attesa = window.setTimeout(() => {
      setCerco(true);
      cercaCitta(testo, controllo.signal)
        .then((r) => {
          setRisultati(r);
          setErrore(r.length === 0 ? 'Nessuna città trovata con questo nome.' : null);
        })
        .catch((e: unknown) => {
          if (!controllo.signal.aborted) setErrore(e instanceof Error ? e.message : 'Ricerca non riuscita');
        })
        .finally(() => {
          if (!controllo.signal.aborted) setCerco(false);
        });
    }, 350);
    return () => {
      window.clearTimeout(attesa);
      controllo.abort();
    };
  }, [testo]);

  const usaGps = async () => {
    setGps(true);
    setErrore(null);
    try {
      onScelta(await posizioneGps());
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'Posizione non disponibile');
    } finally {
      setGps(false);
    }
  };

  const mostraRisultati = testo.trim().length >= 2 ? risultati : [];
  return (
    <div className="scelta-posizione">
      <button type="button" className="bottone primario largo" onClick={usaGps} disabled={gps}>
        <IconaPosizione dimensione={18} /> {gps ? 'Cerco la posizione…' : 'Usa la mia posizione'}
      </button>
      <div className="separatore">
        <span>oppure</span>
      </div>
      <label className="campo">
        <span>Cerca la città</span>
        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Es. Rimini"
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
        />
      </label>
      {cerco && <p className="nota-piccola">Cerco…</p>}
      {errore && (
        <p className="avviso" role="alert">
          {errore}
        </p>
      )}
      {mostraRisultati.length > 0 && (
        <ul className="risultati-citta">
          {mostraRisultati.map((r) => (
            <li key={`${r.lat},${r.lon}`}>
              <button type="button" onClick={() => onScelta({ nome: r.nome, lat: r.lat, lon: r.lon, origine: 'ricerca' })}>
                <strong>{r.nome}</strong>
                <span>{r.dettaglio}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
