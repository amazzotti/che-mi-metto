// Pagina /galleria.html: tutte le sagome disegnate, con i modelli da donna e da uomo.
import { createRoot } from 'react-dom/client';
import type { Genere } from '../shared/tipi';
import type { Fantasia } from '../features/outfit/fantasie';
import { ELENCO } from '../features/outfit/catalogo';
import { modelli } from '../features/outfit/modelli';
import { Sagoma } from '../features/outfit/Sagoma';
import { SAGOME_DISPONIBILI } from '../features/outfit/sagome';

const TINTE = ['#1f2a44', '#c19a6b', '#9db8a0', '#6d1a2c', '#151515', '#efe8dc', '#a0522d', '#7fb2e5', '#e6c2b8', '#6b7b3a'];

/** Le fantasie solo sui capi dove si usano davvero. */
const FANTASIE: Partial<Record<string, { colore: string; fantasia: Fantasia; colore2: string }>> = {
  canotta: { colore: '#ffffff', fantasia: 'righe', colore2: '#1f2a44' },
  camicia: { colore: '#3a3d42', fantasia: 'quadri', colore2: '#c0392b' },
  blusa: { colore: '#6d1a2c', fantasia: 'pois', colore2: '#efe8dc' },
  'vestito-estivo': { colore: '#efe8dc', fantasia: 'fiori', colore2: '#f08a6c' },
  sciarpa: { colore: '#2f5d50', fantasia: 'quadri', colore2: '#c0392b' },
};

function Sezione({ genere, titolo }: { genere: Genere; titolo: string }) {
  let n = 0;
  return (
    <section>
      <h2 style={{ fontFamily: 'Georgia, serif', margin: '12px 8px 4px', fontSize: 18 }}>{titolo}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: 4 }}>
        {SAGOME_DISPONIBILI.filter((id) => ELENCO.some((c) => c.sagoma === id && c.generi.includes(genere))).flatMap((id) =>
          modelli(id, genere).map((m, i) => {
            const s: { colore: string; fantasia?: Fantasia; colore2?: string } = (i === 0 && FANTASIE[id]) || { colore: TINTE[n++ % TINTE.length] };
            return (
              <div key={`${id}-${i}`} style={{ background: '#efe5d7', borderRadius: 8, textAlign: 'center', fontSize: 9, lineHeight: 1.2, paddingBottom: 3 }}>
                <Sagoma id={id} genere={genere} modello={i} colore={s.colore} fantasia={s.fantasia} colore2={s.colore2} />
                {id}
                {m.nome ? ` ${m.nome}` : ''}
              </div>
            );
          }),
        )}
      </div>
    </section>
  );
}

createRoot(document.getElementById('g')!).render(
  <>
    <Sezione genere="donna" titolo="Donna" />
    <Sezione genere="uomo" titolo="Uomo" />
  </>,
);
