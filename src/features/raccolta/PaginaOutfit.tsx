import { useState } from 'react';
import { useApp } from '../../app/contesto';
import { giornoEsteso } from '../../shared/date';
import { nomeOccasione } from '../../shared/tipi';
import { Foglio } from '../../shared/ui/Foglio';
import type { Pezzo } from '../outfit/motore';
import { Figura, SchedaOutfit } from '../outfit/SchedaOutfit';
import { condividiImmagine, creaCollage } from './collage';
import { FoglioValigia } from './FoglioValigia';
import {
  eliminaDalDiario,
  eliminaOutfit,
  type OutfitSalvato,
  ripristina,
  useDiario,
  useOutfitSalvati,
  type VoceDiario,
} from './raccolta';

const MESE = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function nomeMese(data: string): string {
  const m = MESE.format(new Date(`${data}T12:00:00Z`));
  return m.charAt(0).toUpperCase() + m.slice(1);
}

/** Miniatura: i primi quattro capi in una griglia 2×2. */
function Miniatura({ pezzi }: { pezzi: Pezzo[] }) {
  return (
    <div className="miniatura" aria-hidden="true">
      {pezzi.slice(0, 4).map((p) => (
        <span key={`${p.slot}-${p.categoria}`}>
          <Figura pezzo={p} />
        </span>
      ))}
    </div>
  );
}

type Aperto = { tipo: 'salvato'; voce: OutfitSalvato } | { tipo: 'diario'; voce: VoceDiario } | null;

export function PaginaOutfit() {
  const { armadio, profilo } = useApp();
  const salvati = useOutfitSalvati();
  const diario = useDiario();
  const [aperto, setAperto] = useState<Aperto>(null);
  const [valigia, setValigia] = useState(false);
  const [condivido, setCondivido] = useState(false);

  const mesi = new Map<string, VoceDiario[]>();
  for (const v of diario) {
    const m = nomeMese(v.data);
    mesi.set(m, [...(mesi.get(m) ?? []), v]);
  }

  const dettaglio = aperto && {
    titolo: aperto.tipo === 'salvato' ? aperto.voce.titolo : `${giornoEsteso(aperto.voce.data)}`,
    sottotitolo:
      aperto.tipo === 'salvato'
        ? `${nomeOccasione(aperto.voce.occasione)} · salvato per ${giornoEsteso(aperto.voce.data).toLowerCase()}`
        : nomeOccasione(aperto.voce.occasione),
    pezzi: ripristina(aperto.voce.pezzi, armadio),
    accessori: ripristina(aperto.voce.accessori, armadio),
  };

  return (
    <>
      <section className="sezione valigia-invito" aria-labelledby="titolo-valigia">
        <h2 id="titolo-valigia">Parti?</h2>
        <p className="testo">Dimmi dove e quando: guardo il meteo della meta e ti preparo la lista dei vestiti da portare.</p>
        <button type="button" className="bottone primario largo" onClick={() => setValigia(true)}>
          Prepara la valigia
        </button>
      </section>

      <section className="sezione" aria-labelledby="titolo-salvati">
        <div className="sezione-testa">
          <h2 id="titolo-salvati">Outfit salvati</h2>
          <span className="conteggio">{salvati.length}</span>
        </div>
        {salvati.length === 0 ? (
          <p className="vuoto">Tocca ♡ Salva sotto un&apos;idea che ti piace: la ritrovi qui quando vuoi.</p>
        ) : (
          <ul className="griglia-outfit">
            {salvati.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => setAperto({ tipo: 'salvato', voce: o })}>
                  <Miniatura pezzi={ripristina(o.pezzi, armadio)} />
                  <strong>{o.titolo}</strong>
                  <span>{giornoEsteso(o.data)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sezione" aria-labelledby="titolo-diario">
        <h2 id="titolo-diario">Diario</h2>
        {diario.length === 0 ? (
          <p className="vuoto">Quando tocchi &quot;Lo metto oggi&quot;, l&apos;outfit finisce qui: così ricordi cosa hai messo e quando.</p>
        ) : (
          [...mesi.entries()].map(([mese, voci]) => (
            <div key={mese} className="diario-mese">
              <h3>{mese}</h3>
              <ul className="lista-diario">
                {voci.map((v) => (
                  <li key={v.id}>
                    <button type="button" onClick={() => setAperto({ tipo: 'diario', voce: v })}>
                      <span className="diario-data">
                        <strong>{Number(v.data.slice(8, 10))}</strong>
                        <small>{giornoEsteso(v.data).split(' ')[0].slice(0, 3)}</small>
                      </span>
                      <span className="diario-capi">
                        {ripristina(v.pezzi, armadio)
                          .slice(0, 5)
                          .map((p) => (
                            <span key={`${p.slot}-${p.categoria}`}>
                              <Figura pezzo={p} />
                            </span>
                          ))}
                      </span>
                      <small className="diario-occasione">{nomeOccasione(v.occasione)}</small>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <Foglio aperto={Boolean(dettaglio)} titolo={dettaglio ? dettaglio.titolo : ''} onChiudi={() => setAperto(null)}>
        {dettaglio && aperto && (
          <div className="modulo">
            <p className="nota-piccola">{dettaglio.sottotitolo}</p>
            <SchedaOutfit outfit={{ pezzi: dettaglio.pezzi, accessori: dettaglio.accessori, motivi: [], daPortare: [], fascia: 'mite', temperatura: 0, dalTuoArmadio: 0, mancanti: [] }} />
            <div className="idee-azioni">
              <button
                type="button"
                className="bottone"
                disabled={condivido}
                onClick={() => {
                  setCondivido(true);
                  void creaCollage(dettaglio.pezzi, dettaglio.accessori, dettaglio.titolo, dettaglio.sottotitolo, profilo.genere)
                    .then((img) => condividiImmagine(img, 'outfit.png', dettaglio.titolo))
                    .finally(() => setCondivido(false));
                }}
              >
                {condivido ? 'Preparo…' : 'Condividi'}
              </button>
              <button
                type="button"
                className="bottone pericolo"
                onClick={() => {
                  if (!confirm('Eliminare questo outfit?')) return;
                  void (aperto.tipo === 'salvato' ? eliminaOutfit(aperto.voce.id) : eliminaDalDiario(aperto.voce.id));
                  setAperto(null);
                }}
              >
                Elimina
              </button>
            </div>
          </div>
        )}
      </Foglio>
      <FoglioValigia aperto={valigia} onChiudi={() => setValigia(false)} />
    </>
  );
}
