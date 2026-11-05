import { useState } from 'react';
import { useApp } from '../../app/contesto';
import { giornoBreve, numeroGiorno } from '../../shared/date';
import { IconaAggiorna } from '../../shared/ui/Icone';
import { useContaImpegni } from '../impegni/impegni';
import { infoCodice } from '../meteo/codiciMeteo';
import { IconaMeteo } from '../meteo/IconaMeteo';
import { SchedaMeteo } from '../meteo/SchedaMeteo';
import { VistaGiorno } from './VistaGiorno';

function StatoMeteo() {
  const { meteo } = useApp();
  if (meteo.previsioni && !meteo.errore) return null;
  if (meteo.caricamento && !meteo.previsioni) {
    return (
      <div className="caricamento" role="status">
        <span className="rotella" aria-hidden="true" /> Guardo il cielo…
      </div>
    );
  }
  if (!meteo.errore) return null;
  return (
    <div className="avviso riga" role="alert">
      <span>{meteo.vecchie ? 'Sei offline: ti mostro le ultime previsioni salvate.' : meteo.errore}</span>
      <button type="button" className="bottone piccolo" onClick={meteo.aggiorna}>
        <IconaAggiorna dimensione={16} /> Riprova
      </button>
    </div>
  );
}

export function PaginaOggi() {
  const { meteo, oggi } = useApp();
  const p = meteo.previsioni;
  return (
    <>
      <StatoMeteo />
      {p && (
        <>
          <SchedaMeteo previsioni={p} oggi={oggi} />
          <VistaGiorno key={oggi} data={oggi} previsioni={p} />
        </>
      )}
    </>
  );
}

export function PaginaSettimana() {
  const { meteo, oggi } = useApp();
  const p = meteo.previsioni;
  const conta = useContaImpegni();
  const giorni = p?.giorni.filter((g) => g.data >= oggi) ?? [];
  const [scelto, setScelto] = useState<string | null>(null);
  const attivo = giorni.find((g) => g.data === scelto)?.data ?? giorni[0]?.data;
  return (
    <>
      <StatoMeteo />
      {p && (
        <>
          <div className="striscia-giorni" role="tablist" aria-label="Giorni della settimana">
            {giorni.map((g) => {
              const info = infoCodice(g.codice);
              return (
                <button
                  key={g.data}
                  type="button"
                  role="tab"
                  aria-selected={g.data === attivo}
                  className={`giorno${g.data === attivo ? ' attivo' : ''}`}
                  onClick={() => setScelto(g.data)}
                >
                  <span className="giorno-nome">{g.data === oggi ? 'Oggi' : giornoBreve(g.data)}</span>
                  <span className="giorno-numero">{numeroGiorno(g.data)}</span>
                  <IconaMeteo icona={info.icona} dimensione={34} titolo={info.descrizione} />
                  <span className="giorno-temp">
                    <strong>{Math.round(g.max)}°</strong> {Math.round(g.min)}°
                  </span>
                  <span className="giorno-pioggia">{g.probPioggia >= 20 ? `${Math.round(g.probPioggia)}%` : ' '}</span>
                  {conta[g.data] ? <span className="pallino" aria-label={`${conta[g.data]} impegni`} /> : null}
                </button>
              );
            })}
          </div>
          {attivo && <VistaGiorno key={attivo} data={attivo} previsioni={p} />}
        </>
      )}
    </>
  );
}
