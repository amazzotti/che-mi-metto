import { useState } from 'react';
import type { Genere, Posizione, Sensibilita } from '../shared/tipi';
import { IconaPosizione } from '../shared/ui/Icone';
import { Scelta } from '../shared/ui/Scelta';
import { SceltaPosizione } from '../features/meteo/SceltaPosizione';
import { GENERI, SENSIBILITA } from '../features/profilo/PaginaProfilo';
import { salvaProfilo } from '../features/profilo/profilo';
import { Firma } from './Firma';
import { Logo } from './Logo';

/** Primo avvio: tre domande e si parte. */
export function Benvenuto() {
  const [genere, setGenere] = useState<Genere | undefined>();
  const [sensibilita, setSensibilita] = useState<Sensibilita>('normale');
  const [posizione, setPosizione] = useState<Posizione | undefined>();

  const pronto = genere && posizione;
  return (
    <main className="benvenuto">
      <div className="benvenuto-testa">
        <Logo />
        <h1>Che mi metto?</h1>
        <p>Ti consiglio cosa indossare in base al meteo, ai tuoi impegni e, se vuoi, al tuo armadio.</p>
      </div>

      <section className="sezione">
        <h2>1. Per chi sono i consigli?</h2>
        <Scelta etichetta="Genere" opzioni={GENERI} valore={genere} onCambia={setGenere} />
      </section>

      <section className="sezione">
        <h2>2. Come senti la temperatura?</h2>
        <Scelta etichetta="Sensibilità al freddo" opzioni={SENSIBILITA} valore={sensibilita} onCambia={setSensibilita} />
      </section>

      <section className="sezione">
        <h2>3. Dove sei?</h2>
        {posizione ? (
          <div className="posizione-scelta">
            <span>
              <IconaPosizione /> <strong>{posizione.nome}</strong>
            </span>
            <button type="button" className="bottone piccolo" onClick={() => setPosizione(undefined)}>
              Cambia
            </button>
          </div>
        ) : (
          <SceltaPosizione onScelta={setPosizione} />
        )}
      </section>

      <button
        type="button"
        className="bottone primario largo grande"
        disabled={!pronto}
        onClick={() => genere && posizione && void salvaProfilo({ genere, sensibilita, posizione })}
      >
        Iniziamo
      </button>
      <p className="nota-piccola centrata">Tutto resta sul tuo telefono. Nessun account.</p>
      <Firma />
    </main>
  );
}
