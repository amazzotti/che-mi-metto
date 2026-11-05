// Pagina /galleria.html: mostra tutte le sagome disegnate, con colori diversi.
import { createRoot } from 'react-dom/client';
import { Sagoma, SAGOME_DISPONIBILI } from '../features/outfit/Sagoma';
const colori = ['#1f2a44', '#c19a6b', '#ffffff', '#6d1a2c', '#151515'];
createRoot(document.getElementById('g')!).render(
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: 4 }}>
    {SAGOME_DISPONIBILI.map((id, i) => (
      <div key={id} style={{ background: '#efe5d7', borderRadius: 8, textAlign: 'center', fontSize: 9 }}>
        <Sagoma id={id} colore={colori[i % colori.length]} />
        {id}
      </div>
    ))}
  </div>,
);
