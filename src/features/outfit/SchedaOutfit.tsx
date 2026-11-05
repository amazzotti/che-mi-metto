import { useEffect, useMemo } from 'react';
import { categoria } from './catalogo';
import type { Outfit, Pezzo } from './motore';
import { Sagoma } from './Sagoma';

/** Crea (e poi libera) l'indirizzo temporaneo per mostrare una foto salvata. */
export function useUrlFoto(foto: Blob | undefined): string | undefined {
  const url = useMemo(() => (foto && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(foto) : undefined), [foto]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url;
}

type DatiFigura = Pick<Pezzo, 'categoria' | 'colore' | 'nome' | 'capo'> & Partial<Pick<Pezzo, 'fantasia' | 'colore2' | 'modello'>>;

export function Figura({ pezzo, className }: { pezzo: DatiFigura; className?: string }) {
  const url = useUrlFoto(pezzo.capo?.foto);
  if (url) return <img src={url} alt={pezzo.nome} className={`figura-foto ${className ?? ''}`} />;
  return (
    <Sagoma
      id={categoria(pezzo.categoria).sagoma}
      colore={pezzo.colore}
      fantasia={pezzo.fantasia}
      colore2={pezzo.colore2}
      modello={pezzo.modello ?? pezzo.capo?.modello}
      titolo={pezzo.nome}
      className={className}
    />
  );
}

/** Pallino del colore: diviso in due se il capo ha una fantasia. */
export function PallinoColore({ colore, colore2, fantasia }: { colore: string; colore2?: string; fantasia?: string }) {
  const sfondo = fantasia && fantasia !== 'unita' && colore2 ? `linear-gradient(135deg, ${colore} 50%, ${colore2} 50%)` : colore;
  return <i style={{ background: sfondo }} aria-hidden="true" />;
}

function IconaLucchetto({ chiuso }: { chiuso: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2.5" fill={chiuso ? 'currentColor' : 'none'} />
      <path d={chiuso ? 'M8 11V8a4 4 0 0 1 8 0v3' : 'M8 11V8a4 4 0 0 1 7.6-1.8'} />
    </svg>
  );
}

function Tessera({ pezzo, piccola, onBlocca }: { pezzo: Pezzo; piccola?: boolean; onBlocca?: (p: Pezzo) => void }) {
  return (
    <li
      className={`tessera${piccola ? ' piccola' : ''}${pezzo.mancante ? ' mancante' : ''}${pezzo.bloccato ? ' bloccata' : ''}`}
      data-slot={pezzo.slot}
    >
      <div className="tessera-figura">
        <Figura pezzo={pezzo} />
        {pezzo.capo && <span className="etichetta-tuo">Tuo</span>}
        {pezzo.mancante && <span className="etichetta-manca">Ti manca</span>}
        {onBlocca && (
          <button
            type="button"
            className="lucchetto"
            aria-pressed={Boolean(pezzo.bloccato)}
            aria-label={pezzo.bloccato ? `Sblocca ${pezzo.nome}` : `Tieni fisso ${pezzo.nome}`}
            onClick={() => onBlocca(pezzo)}
          >
            <IconaLucchetto chiuso={Boolean(pezzo.bloccato)} />
          </button>
        )}
      </div>
      <div className="tessera-testo">
        <strong>{pezzo.nome}</strong>
        <span className="tessera-colore">
          <PallinoColore colore={pezzo.colore} colore2={pezzo.colore2} fantasia={pezzo.fantasia} />
          {pezzo.nomeColore}
        </span>
        {pezzo.nota && <em>{pezzo.nota}</em>}
      </div>
    </li>
  );
}

interface Props {
  outfit: Outfit;
  compatta?: boolean;
  /** Lucchetto: fissa o libera un capo nelle prossime idee. */
  onBlocca?: (p: Pezzo) => void;
}

export function SchedaOutfit({ outfit, compatta, onBlocca }: Props) {
  const mancanti = outfit.mancanti.map((p) => categoria(p.categoria).nome.toLowerCase());
  return (
    <div className={`outfit${compatta ? ' compatto' : ''}`} data-fascia={outfit.fascia}>
      <ul className="outfit-pezzi" aria-label="Capi consigliati">
        {outfit.pezzi.map((p) => (
          <Tessera key={`${p.slot}-${p.categoria}`} pezzo={p} piccola={compatta} onBlocca={onBlocca} />
        ))}
      </ul>
      {outfit.accessori.length > 0 && (
        <ul className="outfit-accessori" aria-label="Accessori">
          {outfit.accessori.map((p) => (
            <li key={p.categoria} className="accessorio" title={p.nome}>
              <Figura pezzo={p} />
              <span>{p.nome}</span>
            </li>
          ))}
        </ul>
      )}
      {outfit.daPortare.length > 0 && (
        <div className="da-portare">
          <strong>In borsa</strong>
          <ul>
            {outfit.daPortare.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      {mancanti.length > 0 && (
        <p className="suggerimento-armadio">
          Nel tuo armadio non ho trovato: <strong>{mancanti.join(', ')}</strong>.{' '}
          {mancanti.length === 1 ? 'Te lo propongo' : 'Te li propongo'} in versione generica.
        </p>
      )}
      {compatta ? (
        <details className="motivi">
          <summary>Perché questo outfit</summary>
          <ul>
            {outfit.motivi.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </details>
      ) : (
        <ul className="motivi" aria-label="Perché questo outfit">
          {outfit.motivi.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
