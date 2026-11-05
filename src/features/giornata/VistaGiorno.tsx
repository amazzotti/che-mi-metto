import { useState } from 'react';
import { useApp } from '../../app/contesto';
import { giornoEsteso, nomeRelativo } from '../../shared/date';
import { type Impegno, nomeOccasione, OCCASIONI, type Occasione } from '../../shared/tipi';
import { IconaCestino, IconaPiu } from '../../shared/ui/Icone';
import { Scelta } from '../../shared/ui/Scelta';
import { eliminaImpegno, useImpegni } from '../impegni/impegni';
import { FoglioImpegno } from '../impegni/FoglioImpegno';
import { condizioniGiorno, condizioniOra } from '../meteo/condizioni';
import type { Previsioni } from '../meteo/openMeteo';
import { segnaIndossati } from '../armadio/armadio';
import { type Idea, proponiIdee } from '../outfit/idee';
import { IdeeOutfit } from '../outfit/IdeeOutfit';
import { type Pezzo, pezzoDalCapo } from '../outfit/motore';
import { condividiImmagine, creaCollage } from '../raccolta/collage';
import { aggiungiAlDiario, salvaOutfit } from '../raccolta/raccolta';
import type { Genere } from '../../shared/tipi';

/** Azioni comuni alle idee del giorno e a quelle degli impegni. */
function azioniIdee(opzioni: {
  data: string;
  oggi: string;
  occasione: Occasione;
  etichetta: string;
  etichettaBreve: string;
  luogo: string;
  genere: Genere;
}) {
  const { data, oggi, occasione, etichetta, etichettaBreve, luogo, genere } = opzioni;
  return {
    onIndossa:
      data === oggi
        ? async (idea: Idea) => {
            await segnaIndossati(idea.outfit, data);
            await aggiungiAlDiario(idea.outfit, data, occasione);
          }
        : undefined,
    onSalva: async (idea: Idea) => {
      // "Casual · Con gonna midi": si capisce subito quale idea era.
      const titolo = idea.titolo === 'La più adatta' ? etichettaBreve : `${etichettaBreve} · ${idea.titolo}`;
      await salvaOutfit(idea.outfit, { titolo, occasione, data });
    },
    onCondividi: async (idea: Idea) => {
      const immagine = await creaCollage(idea.outfit.pezzi, idea.outfit.accessori, etichetta, `${giornoEsteso(data)} · ${luogo}`, genere);
      await condividiImmagine(immagine, `outfit-${data}.png`, etichetta);
    },
  };
}

/** Apre o chiude il lucchetto su un capo: uno solo per parte dell'outfit. */
export function cambiaLucchetto(bloccati: Pezzo[], pezzo: Pezzo): Pezzo[] {
  const altri = bloccati.filter((p) => p.slot !== pezzo.slot);
  if (pezzo.bloccato) return altri;
  // Vestito intero e gonna/pantaloni o maglia non stanno insieme.
  const compatibili = pezzo.slot === 'intero' ? altri.filter((p) => p.slot !== 'sotto' && p.slot !== 'base') : pezzo.slot === 'sotto' || pezzo.slot === 'base' ? altri.filter((p) => p.slot !== 'intero') : altri;
  return [...compatibili, { ...pezzo, bloccato: true }];
}

interface Props {
  data: string;
  previsioni: Previsioni;
}

/** Outfit della giornata + impegni del giorno, ognuno con il suo outfit. */
export function VistaGiorno({ data, previsioni }: Props) {
  const { profilo, armadio, oggi, adesso, daAbbinare } = useApp();
  // "Abbinalo" dall'armadio: si parte con quel capo già fissato.
  const abbinaQui = data === oggi ? daAbbinare : undefined;
  const [occasione, setOccasione] = useState<Occasione>(() =>
    abbinaQui && !abbinaQui.occasioni.includes('casual') ? (abbinaQui.occasioni[0] ?? 'casual') : 'casual',
  );
  const [gruppo, setGruppo] = useState(0);
  const [bloccati, setBloccati] = useState<Pezzo[]>(() => (abbinaQui ? [pezzoDalCapo(abbinaQui, profilo.genere)] : []));
  const impegni = useImpegni(data) ?? [];
  const [modulo, setModulo] = useState<{ aperto: boolean; impegno?: Impegno }>({ aperto: false });

  const condizioni = condizioniGiorno(previsioni, data, adesso);
  // Il motore è veloce e deterministico: si ricalcola a ogni render senza problemi.
  const idee = condizioni
    ? proponiIdee(
        {
          condizioni,
          genere: profilo.genere,
          sensibilita: profilo.sensibilita,
          correzione: profilo.correzione,
          occasione,
          data,
          latitudine: previsioni.latitudine,
          armadio,
          bloccati,
        },
        gruppo,
      )
    : [];
  const azioni = azioniIdee({
    data,
    oggi,
    occasione,
    etichetta: `Il mio outfit · ${nomeOccasione(occasione)}`,
    etichettaBreve: nomeOccasione(occasione),
    luogo: profilo.posizione?.nome ?? '',
    genere: profilo.genere,
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
            setGruppo(0);
            setBloccati([]);
          }}
          stile="chip"
          scorrevole
        />
        {idee.length > 0 ? (
          <IdeeOutfit
            key={occasione}
            idee={idee}
            onAltreIdee={() => setGruppo((g) => g + 1)}
            onBlocca={(p) => setBloccati((b) => cambiaLucchetto(b, p))}
            {...azioni}
          />
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
  const { profilo, armadio, oggi } = useApp();
  const [gruppo, setGruppo] = useState(0);
  const [bloccati, setBloccati] = useState<Pezzo[]>([]);
  const condizioni = condizioniOra(previsioni, impegno.data, impegno.ora);
  const idee = condizioni
    ? proponiIdee(
        {
          condizioni,
          genere: profilo.genere,
          sensibilita: profilo.sensibilita,
          correzione: profilo.correzione,
          occasione: impegno.occasione,
          data: impegno.data,
          latitudine: previsioni.latitudine,
          armadio,
          bloccati,
        },
        gruppo,
      )
    : [];
  const azioni = azioniIdee({
    data: impegno.data,
    oggi,
    occasione: impegno.occasione,
    etichetta: impegno.titolo,
    etichettaBreve: impegno.titolo,
    luogo: profilo.posizione?.nome ?? '',
    genere: profilo.genere,
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
      {idee.length > 0 ? (
        <IdeeOutfit
          idee={idee}
          compatta
          onAltreIdee={() => setGruppo((g) => g + 1)}
          onBlocca={(p) => setBloccati((b) => cambiaLucchetto(b, p))}
          {...azioni}
        />
      ) : (
        <p className="vuoto">Le previsioni per quell&apos;ora non sono ancora disponibili.</p>
      )}
    </li>
  );
}
