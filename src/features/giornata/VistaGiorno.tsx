import { useState } from 'react';
import { useApp } from '../../app/contesto';
import { nomeRelativo } from '../../shared/date';
import { type Impegno, nomeOccasione, OCCASIONI, type Occasione } from '../../shared/tipi';
import { IconaCestino, IconaPiu } from '../../shared/ui/Icone';
import { Scelta } from '../../shared/ui/Scelta';
import { eliminaImpegno, useImpegni } from '../impegni/impegni';
import { FoglioImpegno } from '../impegni/FoglioImpegno';
import { condizioniGiorno, condizioniOra } from '../meteo/condizioni';
import type { Previsioni } from '../meteo/openMeteo';
import { proponiOutfit } from '../outfit/motore';
import { SchedaOutfit } from '../outfit/SchedaOutfit';

interface Props {
  data: string;
  previsioni: Previsioni;
}

/** Outfit della giornata + impegni del giorno, ognuno con il suo outfit. */
export function VistaGiorno({ data, previsioni }: Props) {
  const { profilo, armadio, oggi, adesso } = useApp();
  const [occasione, setOccasione] = useState<Occasione>('casual');
  const [variante, setVariante] = useState(0);
  const impegni = useImpegni(data) ?? [];
  const [modulo, setModulo] = useState<{ aperto: boolean; impegno?: Impegno }>({ aperto: false });

  const condizioni = condizioniGiorno(previsioni, data, adesso);
  // Il motore è veloce e deterministico: si ricalcola a ogni render senza problemi.
  const outfit =
    condizioni &&
    proponiOutfit({
      condizioni,
      genere: profilo.genere,
      sensibilita: profilo.sensibilita,
      occasione,
      data,
      latitudine: previsioni.latitudine,
      variante,
      armadio,
    });

  const quando = nomeRelativo(data, oggi);
  return (
    <div className="vista-giorno">
      <section className="sezione" aria-labelledby={`outfit-${data}`}>
        <div className="sezione-testa">
          <h2 id={`outfit-${data}`}>{quando === 'Oggi' || quando === 'Domani' ? `Outfit per ${quando.toLowerCase()}` : quando}</h2>
          {condizioni && (
            <span className="fascia-orari">
              {condizioni.dalle}–{condizioni.alle}
            </span>
          )}
        </div>
        <Scelta
          etichetta="Occasione"
          opzioni={OCCASIONI.map((o) => ({ id: o.id, nome: o.breve }))}
          valore={occasione}
          onCambia={(o) => {
            setOccasione(o);
            setVariante(0);
          }}
          stile="chip"
          scorrevole
        />
        {outfit ? (
          <SchedaOutfit outfit={outfit} onAltraIdea={() => setVariante((v) => v + 1)} />
        ) : (
          <p className="vuoto">Per questo giorno non ci sono ancora previsioni orarie.</p>
        )}
      </section>

      <section className="sezione" aria-labelledby={`impegni-${data}`}>
        <div className="sezione-testa">
          <h2 id={`impegni-${data}`}>Impegni</h2>
          <button type="button" className="bottone piccolo" onClick={() => setModulo({ aperto: true })}>
            <IconaPiu dimensione={16} /> Aggiungi
          </button>
        </div>
        {impegni.length === 0 && (
          <p className="vuoto">
            Hai un appuntamento, una cena elegante o la palestra? Aggiungilo: ti preparo l&apos;outfit giusto per quell&apos;ora.
          </p>
        )}
        <ul className="lista-impegni">
          {impegni.map((i) => (
            <SchedaImpegno key={i.id} impegno={i} previsioni={previsioni} onModifica={() => setModulo({ aperto: true, impegno: i })} />
          ))}
        </ul>
      </section>
      <FoglioImpegno aperto={modulo.aperto} data={data} impegno={modulo.impegno} onChiudi={() => setModulo({ aperto: false })} />
    </div>
  );
}

function SchedaImpegno({ impegno, previsioni, onModifica }: { impegno: Impegno; previsioni: Previsioni; onModifica: () => void }) {
  const { profilo, armadio } = useApp();
  const [variante, setVariante] = useState(0);
  const condizioni = condizioniOra(previsioni, impegno.data, impegno.ora);
  const outfit =
    condizioni &&
    proponiOutfit({
      condizioni,
      genere: profilo.genere,
      sensibilita: profilo.sensibilita,
      occasione: impegno.occasione,
      data: impegno.data,
      latitudine: previsioni.latitudine,
      variante,
      armadio,
    });
  return (
    <li className="impegno">
      <div className="impegno-testa">
        <button type="button" className="impegno-titolo" onClick={onModifica} aria-label={`Modifica ${impegno.titolo}`}>
          <span className="ora">{impegno.ora}</span>
          <span>
            <strong>{impegno.titolo}</strong>
            <small>
              {[
                impegno.titolo !== nomeOccasione(impegno.occasione) && nomeOccasione(impegno.occasione),
                condizioni && `percepiti ${Math.round(condizioni.percepita)}°`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </small>
          </span>
        </button>
        <button
          type="button"
          className="bottone-icona"
          aria-label={`Elimina ${impegno.titolo}`}
          onClick={() => {
            if (confirm(`Eliminare "${impegno.titolo}"?`)) void eliminaImpegno(impegno.id);
          }}
        >
          <IconaCestino />
        </button>
      </div>
      {outfit ? (
        <SchedaOutfit outfit={outfit} compatta onAltraIdea={() => setVariante((v) => v + 1)} />
      ) : (
        <p className="vuoto">Le previsioni per quell&apos;ora non sono ancora disponibili.</p>
      )}
    </li>
  );
}
