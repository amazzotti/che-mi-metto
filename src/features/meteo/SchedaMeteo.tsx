import type { Previsioni } from './openMeteo';
import { infoCodice } from './codiciMeteo';
import { IconaMeteo } from './IconaMeteo';
import { infoStagione } from './stagione';

interface Props {
  previsioni: Previsioni;
  oggi: string;
}

/** Il meteo di adesso, in grande in cima alla pagina "Oggi". */
export function SchedaMeteo({ previsioni, oggi }: Props) {
  const a = previsioni.attuale;
  const info = infoCodice(a.codice);
  const giorno = previsioni.giorni.find((g) => g.data === oggi) ?? previsioni.giorni[0];
  const stagione = infoStagione(oggi, previsioni.latitudine);
  return (
    <section className="scheda-meteo" aria-label="Meteo attuale">
      <div className="meteo-principale">
        <IconaMeteo icona={info.icona} giorno={a.giorno} dimensione={76} titolo={info.descrizione} />
        <div>
          <p className="temperatura">
            {Math.round(a.temperatura)}
            <span>°</span>
          </p>
          <p className="descrizione">{info.descrizione}</p>
        </div>
      </div>
      <dl className="meteo-dettagli">
        <div>
          <dt>Percepiti</dt>
          <dd>{Math.round(a.percepita)}°</dd>
        </div>
        <div>
          <dt>Min / max</dt>
          <dd>
            {Math.round(giorno.min)}° / {Math.round(giorno.max)}°
          </dd>
        </div>
        <div>
          <dt>Pioggia</dt>
          <dd>{Math.round(giorno.probPioggia)}%</dd>
        </div>
        <div>
          <dt>Vento</dt>
          <dd>{Math.round(a.vento)} km/h</dd>
        </div>
        <div>
          <dt>UV</dt>
          <dd>{Math.round(giorno.uvMax)}</dd>
        </div>
      </dl>
      <p className="stagione">{stagione.etichetta}</p>
    </section>
  );
}
