import { useRef, useState } from 'react';
import { IconaMescola } from '../../shared/ui/Icone';
import type { Idea } from './idee';
import type { Pezzo } from './motore';
import { SchedaOutfit } from './SchedaOutfit';

interface Props {
  idee: Idea[];
  /** Mostra un nuovo gruppo di idee. */
  onAltreIdee?: () => void;
  /** "Lo metto oggi": registra i capi dell'armadio usati in questa idea. */
  onIndossa?: (idea: Idea) => Promise<void>;
  /** Lucchetto sui capi. */
  onBlocca?: (p: Pezzo) => void;
  /** Salva l'idea tra gli outfit preferiti. */
  onSalva?: (idea: Idea) => Promise<void>;
  /** Crea il collage dell'outfit e lo condivide. */
  onCondividi?: (idea: Idea) => Promise<void>;
  compatta?: boolean;
}

/** Più proposte affiancate: si sfogliano col dito o toccando le etichette. */
export function IdeeOutfit({ idee, onAltreIdee, onIndossa, onBlocca, onSalva, onCondividi, compatta }: Props) {
  const [attiva, setAttiva] = useState(0);
  const [indossata, setIndossata] = useState<string | null>(null);
  const [salvate, setSalvate] = useState<string[]>([]);
  const [condivido, setCondivido] = useState(false);
  const striscia = useRef<HTMLDivElement>(null);
  const indice = Math.min(attiva, idee.length - 1);
  const ideaAttiva = idee[indice];

  const vaiA = (i: number) => {
    setAttiva(i);
    const el = striscia.current;
    // scrollTo non esiste in jsdom (test): in quel caso basta lo stato.
    el?.scrollTo?.({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  const alloScorrimento = () => {
    const el = striscia.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== attiva) setAttiva(i);
  };

  if (!ideaAttiva) return null;
  const salvata = salvate.includes(ideaAttiva.chiave);
  return (
    <div className={`idee${compatta ? ' compatte' : ''}`}>
      {idee.length > 1 && (
        <div className="idee-schede" role="tablist" aria-label="Idee di outfit">
          {idee.map((idea, i) => (
            <button
              key={idea.chiave}
              type="button"
              role="tab"
              aria-selected={i === indice}
              className={i === indice ? 'attiva' : undefined}
              onClick={() => vaiA(i)}
            >
              <span className="idea-numero">{i + 1}</span>
              {idea.titolo}
            </button>
          ))}
        </div>
      )}
      <div className="idee-striscia" ref={striscia} onScroll={alloScorrimento}>
        {idee.map((idea, i) => (
          <div
            key={idea.chiave}
            className="idea"
            role="tabpanel"
            aria-label={`Idea ${i + 1}: ${idea.titolo}`}
            aria-hidden={i !== indice}
            inert={i !== indice}
          >
            <SchedaOutfit outfit={idea.outfit} compatta={compatta} onBlocca={onBlocca} />
          </div>
        ))}
      </div>
      {ideaAttiva.outfit.pezzi.some((p) => p.bloccato) && (
        <p className="nota-lucchetto">
          Con il lucchetto chiuso il capo resta in tutte le idee: tocca &quot;Altre idee&quot; per vedere cosa ci abbino.
        </p>
      )}
      {(onSalva || onCondividi) && (
        <div className="idee-azioni">
          {onSalva && (
            <button
              type="button"
              className={`bottone${salvata ? ' salvata' : ''}`}
              disabled={salvata}
              onClick={() => void onSalva(ideaAttiva).then(() => setSalvate((s) => [...s, ideaAttiva.chiave]))}
            >
              {salvata ? '♥ Salvato' : '♡ Salva'}
            </button>
          )}
          {onCondividi && (
            <button
              type="button"
              className="bottone"
              disabled={condivido}
              onClick={() => {
                setCondivido(true);
                void onCondividi(ideaAttiva).finally(() => setCondivido(false));
              }}
            >
              {condivido ? 'Preparo…' : 'Condividi'}
            </button>
          )}
        </div>
      )}
      {onIndossa && (
        <button
          type="button"
          className="bottone primario largo"
          disabled={indossata === ideaAttiva.chiave}
          onClick={() => void onIndossa(ideaAttiva).then(() => setIndossata(ideaAttiva.chiave))}
        >
          {indossata === ideaAttiva.chiave ? 'Segnato nel diario: nei prossimi giorni ti propongo altro' : 'Lo metto oggi'}
        </button>
      )}
      {onAltreIdee && (
        <button
          type="button"
          className="bottone secondario largo"
          onClick={() => {
            onAltreIdee();
            vaiA(0);
          }}
        >
          <IconaMescola /> Altre idee
        </button>
      )}
    </div>
  );
}
