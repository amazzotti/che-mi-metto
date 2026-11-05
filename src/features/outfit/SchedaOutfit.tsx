import { useEffect, useMemo } from 'react';
import { IconaMescola } from '../../shared/ui/Icone';
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

export function Figura({ pezzo, className }: { pezzo: Pick<Pezzo, 'categoria' | 'colore' | 'nome' | 'capo'>; className?: string }) {
  const url = useUrlFoto(pezzo.capo?.foto);
  if (url) return <img src={url} alt={pezzo.nome} className={`figura-foto ${className ?? ''}`} />;
  return <Sagoma id={categoria(pezzo.categoria).sagoma} colore={pezzo.colore} titolo={pezzo.nome} className={className} />;
}

function Tessera({ pezzo, piccola }: { pezzo: Pezzo; piccola?: boolean }) {
  return (
    <li className={`tessera${piccola ? ' piccola' : ''}${pezzo.mancante ? ' mancante' : ''}`} data-slot={pezzo.slot}>
      <div className="tessera-figura">
        <Figura pezzo={pezzo} />
        {pezzo.capo && <span className="etichetta-tuo">Tuo</span>}
        {pezzo.mancante && <span className="etichetta-manca">Ti manca</span>}
      </div>
      <div className="tessera-testo">
        <strong>{pezzo.nome}</strong>
        <span className="tessera-colore">
          <i style={{ background: pezzo.colore }} aria-hidden="true" />
          {pezzo.nomeColore}
        </span>
        {pezzo.nota && <em>{pezzo.nota}</em>}
      </div>
    </li>
  );
}

interface Props {
  outfit: Outfit;
  onAltraIdea?: () => void;
  compatta?: boolean;
}

export function SchedaOutfit({ outfit, onAltraIdea, compatta }: Props) {
  const mancanti = outfit.mancanti.map((p) => categoria(p.categoria).nome.toLowerCase());
  return (
    <div className={`outfit${compatta ? ' compatto' : ''}`} data-fascia={outfit.fascia}>
      <ul className="outfit-pezzi" aria-label="Capi consigliati">
        {outfit.pezzi.map((p) => (
          <Tessera key={`${p.slot}-${p.categoria}`} pezzo={p} piccola={compatta} />
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
      {onAltraIdea && (
        <button type="button" className="bottone secondario largo" onClick={onAltraIdea}>
          <IconaMescola /> Altra idea
        </button>
      )}
    </div>
  );
}
