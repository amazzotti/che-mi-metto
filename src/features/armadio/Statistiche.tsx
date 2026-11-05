import type { Capo } from '../../shared/tipi';
import { categoria } from '../outfit/catalogo';

export interface DatiStatistiche {
  totale: number;
  usati: number;
  percentualeUsati: number;
  piuMessi: Capo[];
  maiMessi: Capo[];
  daLavare: number;
}

export function calcolaStatistiche(armadio: Capo[]): DatiStatistiche {
  const usati = armadio.filter((c) => (c.usi ?? 0) > 0);
  return {
    totale: armadio.length,
    usati: usati.length,
    percentualeUsati: armadio.length === 0 ? 0 : Math.round((usati.length / armadio.length) * 100),
    piuMessi: [...usati].sort((a, b) => (b.usi ?? 0) - (a.usi ?? 0) || a.creato - b.creato).slice(0, 3),
    maiMessi: armadio.filter((c) => !c.usi),
    daLavare: armadio.filter((c) => c.daLavare).length,
  };
}

const nome = (c: Capo) => c.nome || categoria(c.categoria).nome;

/** Quanto usi il tuo armadio: idea presa dalle statistiche delle app di armadio digitale. */
export function Statistiche({ armadio }: { armadio: Capo[] }) {
  const s = calcolaStatistiche(armadio);
  if (s.usati === 0) {
    return (
      <p className="nota-piccola">
        Quando premi &quot;Lo metto oggi&quot; qui compaiono i capi che usi di più e quelli che non metti mai.
      </p>
    );
  }
  return (
    <div className="statistiche" aria-label="Statistiche dell'armadio">
      <div className="statistiche-numeri">
        <div>
          <strong>{s.percentualeUsati}%</strong>
          <span>dell&apos;armadio usato</span>
        </div>
        <div>
          <strong>{s.maiMessi.length}</strong>
          <span>mai messi</span>
        </div>
        <div>
          <strong>{s.daLavare}</strong>
          <span>da lavare</span>
        </div>
      </div>
      <p>
        <strong>I più messi:</strong> {s.piuMessi.map((c) => `${nome(c)} (${c.usi})`).join(', ')}
      </p>
      {s.maiMessi.length > 0 && (
        <p>
          <strong>Da riscoprire:</strong> {s.maiMessi.slice(0, 4).map(nome).join(', ')}
          {s.maiMessi.length > 4 ? '…' : ''}
        </p>
      )}
    </div>
  );
}
