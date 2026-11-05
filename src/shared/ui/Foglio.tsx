import { type ReactNode, useEffect, useId, useRef } from 'react';
import { IconaChiudi } from './Icone';

interface Props {
  aperto: boolean;
  titolo: string;
  onChiudi: () => void;
  children: ReactNode;
}

/** Pannello che sale dal basso, comodo da usare con il pollice. */
export function Foglio({ aperto, titolo, onChiudi, children }: Props) {
  const idTitolo = useId();
  const pannello = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aperto) return;
    const precedente = document.activeElement as HTMLElement | null;
    pannello.current?.focus();
    const tasto = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChiudi();
    };
    document.addEventListener('keydown', tasto);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tasto);
      document.body.style.overflow = overflow;
      precedente?.focus?.();
    };
  }, [aperto, onChiudi]);

  if (!aperto) return null;
  return (
    <div className="foglio-sfondo" onClick={onChiudi}>
      <div
        className="foglio"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitolo}
        tabIndex={-1}
        ref={pannello}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="foglio-maniglia" aria-hidden="true" />
        <header className="foglio-testa">
          <h2 id={idTitolo}>{titolo}</h2>
          <button type="button" className="bottone-icona" onClick={onChiudi} aria-label="Chiudi">
            <IconaChiudi />
          </button>
        </header>
        <div className="foglio-corpo">{children}</div>
      </div>
    </div>
  );
}
