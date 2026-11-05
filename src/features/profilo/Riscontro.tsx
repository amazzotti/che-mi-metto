import { useEffect, useState } from 'react';
import { useApp } from '../../app/contesto';
import { aggiornaProfilo } from './profilo';

const ULTIMO_GIORNO = 'ultimo-giorno-aperto';
const CHIESTO = 'riscontro-chiesto';

function leggi(chiave: string): string | null {
  try {
    return localStorage.getItem(chiave);
  } catch {
    return null;
  }
}

function scrivi(chiave: string, valore: string) {
  try {
    localStorage.setItem(chiave, valore);
  } catch {
    /* modalità privata: pazienza */
  }
}

/** Ogni riscontro sposta la correzione personale di mezzo grado, fino a ±4°. */
export function nuovaCorrezione(attuale: number | undefined, risposta: 'freddo' | 'giusto' | 'caldo'): number {
  const passo = risposta === 'freddo' ? 0.5 : risposta === 'caldo' ? -0.5 : 0;
  return Math.max(-4, Math.min(4, (attuale ?? 0) + passo));
}

/**
 * "Ieri com'era?": se hai usato l'app in un giorno precedente, la mattina dopo chiede com'è andata
 * e regola da sola la temperatura su cui ragiona (come fanno le app meteo-outfit più curate).
 */
export function Riscontro() {
  const { oggi, profilo } = useApp();
  const [stato, setStato] = useState<'domanda' | 'grazie' | 'nascosto'>(() => {
    const precedente = leggi(ULTIMO_GIORNO);
    return precedente && precedente < oggi && leggi(CHIESTO) !== oggi ? 'domanda' : 'nascosto';
  });

  useEffect(() => {
    scrivi(ULTIMO_GIORNO, oggi);
  }, [oggi]);

  if (stato === 'nascosto') return null;
  const rispondi = (risposta: 'freddo' | 'giusto' | 'caldo') => {
    scrivi(CHIESTO, oggi);
    setStato('grazie');
    void aggiornaProfilo({ correzione: nuovaCorrezione(profilo.correzione, risposta) });
  };
  const trovata = profilo.genere === 'donna' ? 'trovata' : 'trovato';
  return (
    <section className="riscontro" aria-label="Com'era ieri">
      {stato === 'domanda' ? (
        <>
          <p>
            <strong>Ieri come ti sei {trovata} con i vestiti?</strong> Mi aiuta a consigliarti meglio.
          </p>
          <div className="riscontro-scelte">
            <button type="button" className="bottone piccolo" onClick={() => rispondi('freddo')}>
              🥶 Avevo freddo
            </button>
            <button type="button" className="bottone piccolo" onClick={() => rispondi('giusto')}>
              👌 Giusto
            </button>
            <button type="button" className="bottone piccolo" onClick={() => rispondi('caldo')}>
              🥵 Avevo caldo
            </button>
          </div>
          <button
            type="button"
            className="riscontro-salta"
            onClick={() => {
              scrivi(CHIESTO, oggi);
              setStato('nascosto');
            }}
          >
            Non ricordo
          </button>
        </>
      ) : (
        <p role="status">Grazie! Ne terrò conto nei prossimi consigli.</p>
      )}
    </section>
  );
}
