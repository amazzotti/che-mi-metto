// Pagina /galleria.html: mostra tutte le sagome disegnate, con colori e fantasie diversi.
import { createRoot } from 'react-dom/client';
import type { Fantasia } from '../features/outfit/fantasie';
import { Sagoma, SAGOME_DISPONIBILI } from '../features/outfit/Sagoma';

const TINTE = ['#1f2a44', '#c19a6b', '#9db8a0', '#6d1a2c', '#151515', '#efe8dc', '#a0522d', '#7fb2e5'];

/** Le fantasie solo sui capi dove si usano davvero. */
const FANTASIE: Partial<Record<string, { colore: string; fantasia: Fantasia; colore2: string }>> = {
  canotta: { colore: '#ffffff', fantasia: 'righe', colore2: '#1f2a44' },
  camicia: { colore: '#3a3d42', fantasia: 'quadri', colore2: '#c0392b' },
  blusa: { colore: '#6d1a2c', fantasia: 'pois', colore2: '#efe8dc' },
  maglia: { colore: '#efe8dc', fantasia: 'righe', colore2: '#a0522d' },
  'vestito-estivo': { colore: '#efe8dc', fantasia: 'fiori', colore2: '#f08a6c' },
  vestito: { colore: '#1f2a44', fantasia: 'pois', colore2: '#ffffff' },
  gonna: { colore: '#6b7b3a', fantasia: 'quadri', colore2: '#c9971c' },
  sciarpa: { colore: '#2f5d50', fantasia: 'quadri', colore2: '#c0392b' },
};

createRoot(document.getElementById('g')!).render(
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: 4 }}>
    {SAGOME_DISPONIBILI.map((id, i) => {
      const s: { colore: string; fantasia?: Fantasia; colore2?: string } = FANTASIE[id] ?? { colore: TINTE[i % TINTE.length] };
      return (
        <div key={id} style={{ background: '#efe5d7', borderRadius: 8, textAlign: 'center', fontSize: 9 }}>
          <Sagoma id={id} colore={s.colore} fantasia={s.fantasia} colore2={s.colore2} />
          {id}
        </div>
      );
    })}
  </div>,
);
