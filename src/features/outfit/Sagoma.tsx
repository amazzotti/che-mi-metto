import { createContext, type ReactNode, useContext, useId } from 'react';
import type { Genere } from '../../shared/tipi';
import type { SagomaId } from './catalogo';
import { eChiaro, sfuma } from './colori';
import type { Fantasia } from './fantasie';
import { modello as scegliModello } from './modelli';
import { DISEGNI } from './sagome';

/** Genere per cui disegnare le sagome (le forme da donna e da uomo sono diverse). */
export const GenereSagome = createContext<Genere | undefined>(undefined);

/**
 * Sagome dei capi disegnate a mano in SVG (viewBox 100×100), colorate con il colore del capo.
 * - dietro: parti in secondo piano (cappuccio, interno), un po' più scure
 * - corpo: la forma principale
 * - chiaro / scuro: inserti (suole, camicia sotto la giacca, polsini)
 * - linee: cuciture e dettagli
 */

/** Motivo SVG che riempie il corpo del capo: fondo nel colore principale, disegno nel secondo. */
function Motivo({ id, fantasia, colore, colore2 }: { id: string; fantasia: Exclude<Fantasia, 'unita'>; colore: string; colore2: string }) {
  let lato = 8;
  let disegno: ReactNode;
  switch (fantasia) {
    case 'righe':
      disegno = <rect width="8" height="3" fill={colore2} />;
      break;
    case 'quadri':
      lato = 14;
      disegno = (
        <>
          <rect width="14" height="5" fill={colore2} opacity={0.55} />
          <rect width="5" height="14" fill={colore2} opacity={0.55} />
          <path d="M9.5 0 V14 M0 9.5 H14" stroke={colore2} strokeWidth={0.7} opacity={0.6} />
        </>
      );
      break;
    case 'pois':
      lato = 9;
      disegno = (
        <>
          <circle cx="4.5" cy="4.5" r="1.7" fill={colore2} />
          {[0, 9].flatMap((x) => [0, 9].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" fill={colore2} />))}
        </>
      );
      break;
    case 'fiori': {
      lato = 16;
      const fiore = (cx: number, cy: number, r: number) =>
        [0, 1, 2, 3, 4].map((i) => {
          const a = (i * 2 * Math.PI) / 5;
          return <circle key={`${cx}-${cy}-${i}`} cx={cx + Math.cos(a) * r * 1.3} cy={cy + Math.sin(a) * r * 1.3} r={r} fill={colore2} />;
        });
      disegno = (
        <>
          {fiore(5, 5, 1.4)}
          <circle cx="5" cy="5" r="0.9" fill="#f2c94c" />
          {fiore(13, 13, 1.1)}
          <circle cx="13" cy="13" r="0.7" fill="#f2c94c" />
        </>
      );
      break;
    }
  }
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={lato} height={lato}>
      <rect width={lato} height={lato} fill={colore} />
      {disegno}
    </pattern>
  );
}

interface Props {
  id: SagomaId;
  colore: string;
  fantasia?: Fantasia;
  colore2?: string;
  /** Quale modello disegnare (es. jeans skinny o a zampa). */
  modello?: number;
  /** Se assente si usa quello del contesto; senza nessuno dei due, il disegno base. */
  genere?: Genere;
  titolo?: string;
  className?: string;
}

export function Sagoma({ id, colore, fantasia, colore2, modello, genere, titolo, className }: Props) {
  const genereContesto = useContext(GenereSagome);
  const g = genere ?? genereContesto;
  const d = g || modello ? scegliModello(id, g, modello ?? 0) : DISEGNI[id];
  // useId può contenere caratteri non validi in url(#...): teniamo solo lettere e numeri.
  const idMotivo = `motivo-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const conMotivo = fantasia && fantasia !== 'unita' && colore2;
  const riempimento = conMotivo ? `url(#${idMotivo})` : colore;
  const chiaroCapo = eChiaro(colore);
  // Su capi scuri i dettagli si vedono meglio se più chiari, su capi chiari se più scuri.
  const contorno = chiaroCapo ? sfuma(colore, 0.62) : sfuma(colore, 1.45);
  const dietro = sfuma(colore, chiaroCapo ? 0.86 : 0.75);
  const inserto = chiaroCapo ? sfuma(colore, 0.8) : sfuma(colore, 1.35);
  const scuro = chiaroCapo ? sfuma(colore, 0.72) : sfuma(colore, 0.7);
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={titolo ? 'img' : undefined}
      aria-label={titolo}
      aria-hidden={titolo ? undefined : true}
      data-sagoma={id}
      data-modello={modello ?? 0}
      data-fantasia={conMotivo ? fantasia : undefined}
    >
      {conMotivo && (
        <defs>
          <Motivo id={idMotivo} fantasia={fantasia} colore={colore} colore2={colore2} />
        </defs>
      )}
      <g strokeLinejoin="round" strokeLinecap="round" strokeWidth={1.6} stroke={contorno}>
        {d.dietro?.map((p, i) => <path key={`d${i}`} d={p} fill={dietro} />)}
        {d.corpo.map((p, i) => <path key={`c${i}`} d={p} fill={riempimento} />)}
        {d.chiaro?.map((p, i) => <path key={`l${i}`} d={p} fill={inserto} />)}
        {d.scuro?.map((p, i) => <path key={`s${i}`} d={p} fill={scuro} />)}
        {d.linee?.map((p, i) => <path key={`n${i}`} d={p} fill="none" strokeWidth={1.2} opacity={0.85} />)}
        {d.tratteggio?.map((p, i) => <path key={`t${i}`} d={p} fill="none" strokeWidth={1} strokeDasharray="2 2" />)}
        {d.bottoni?.map(([x, y], i) => <circle key={`b${i}`} cx={x} cy={y} r={1.6} fill={contorno} stroke="none" />)}
      </g>
    </svg>
  );
}
