interface Opzione<T extends string> {
  id: T;
  nome: string;
}

interface Props<T extends string> {
  etichetta: string;
  opzioni: Opzione<T>[];
  valore: T | undefined;
  onCambia: (v: T) => void;
  /** "segmenti" = pulsanti uniti, "chip" = pillole che vanno a capo/scorrono. */
  stile?: 'segmenti' | 'chip';
  scorrevole?: boolean;
}

/** Gruppo di pulsanti a scelta singola. */
export function Scelta<T extends string>({ etichetta, opzioni, valore, onCambia, stile = 'segmenti', scorrevole }: Props<T>) {
  return (
    <div
      className={`scelta scelta-${stile}${scorrevole ? ' scorrevole' : ''}`}
      role="group"
      aria-label={etichetta}
    >
      {opzioni.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={valore === o.id}
          className={valore === o.id ? 'attivo' : undefined}
          onClick={() => onCambia(o.id)}
        >
          {o.nome}
        </button>
      ))}
    </div>
  );
}

interface PropsMultipla<T extends string> {
  etichetta: string;
  opzioni: Opzione<T>[];
  valori: T[];
  onCambia: (v: T[]) => void;
}

/** Pillole a scelta multipla (es. occasioni adatte a un capo). */
export function SceltaMultipla<T extends string>({ etichetta, opzioni, valori, onCambia }: PropsMultipla<T>) {
  return (
    <div className="scelta scelta-chip" role="group" aria-label={etichetta}>
      {opzioni.map((o) => {
        const attivo = valori.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={attivo}
            className={attivo ? 'attivo' : undefined}
            onClick={() => onCambia(attivo ? valori.filter((v) => v !== o.id) : [...valori, o.id])}
          >
            {o.nome}
          </button>
        );
      })}
    </div>
  );
}
