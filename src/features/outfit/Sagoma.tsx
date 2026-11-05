import { eChiaro, sfuma } from './colori';
import type { SagomaId } from './catalogo';

/**
 * Sagome dei capi disegnate a mano in SVG (viewBox 100×100), colorate con il colore del capo.
 * - dietro: parti in secondo piano (cappuccio, interno), un po' più scure
 * - corpo: la forma principale
 * - chiaro / scuro: inserti (suole, camicia sotto la giacca, polsini)
 * - linee: cuciture e dettagli
 */
interface Disegno {
  dietro?: string[];
  corpo: string[];
  chiaro?: string[];
  scuro?: string[];
  linee?: string[];
  tratteggio?: string[];
  bottoni?: [number, number][];
}

const MANICHE_LUNGHE = 'M32 16 L42 13 Q50 20 58 13 L68 16 L80 30 L88 76 L79 78 L70 44 L70 88 L30 88 L30 44 L21 78 L12 76 L20 30 Z';
const COSTE_FONDO = 'M30 82 L70 82 M34 82 L34 88 M38 82 L38 88 M42 82 L42 88 M46 82 L46 88 M50 82 L50 88 M54 82 L54 88 M58 82 L58 88 M62 82 L62 88 M66 82 L66 88';
const POLSINI = 'M12 76 L21 78 M79 78 L88 76';
const PANTALONI = 'M30 8 L70 8 L74 92 L56 92 L50 30 L44 92 L26 92 Z';

const DISEGNI: Record<SagomaId, Disegno> = {
  tshirt: {
    corpo: ['M30 18 L42 14 Q50 21 58 14 L70 18 L86 32 L77 42 L70 37 L70 86 L30 86 L30 37 L23 42 L14 32 Z'],
    linee: ['M42 14 Q50 24 58 14', 'M23 42 L30 37 M77 42 L70 37'],
  },
  canotta: {
    corpo: ['M36 12 L42 12 Q50 30 58 12 L64 12 Q63 30 70 38 L70 86 L30 86 L30 38 Q37 30 36 12 Z'],
    linee: ['M42 12 Q50 32 58 12'],
  },
  polo: {
    corpo: ['M30 18 L42 14 Q50 21 58 14 L70 18 L86 32 L77 42 L70 37 L70 86 L30 86 L30 37 L23 42 L14 32 Z'],
    chiaro: ['M42 14 L46 25 L50 20 L54 25 L58 14 Q50 18 42 14 Z'],
    linee: ['M50 20 L50 36', 'M23 42 L30 37 M77 42 L70 37'],
    bottoni: [[50, 27], [50, 32]],
  },
  camicia: {
    corpo: [MANICHE_LUNGHE],
    chiaro: ['M42 13 L46 23 L50 20 L54 23 L58 13 Q50 17 42 13 Z'],
    linee: ['M50 20 L50 88', POLSINI, 'M14 70 L22 72 M78 72 L86 70'],
    bottoni: [[50, 30], [50, 42], [50, 54], [50, 66], [50, 78]],
  },
  blusa: {
    corpo: ['M34 15 Q50 27 66 15 L80 30 L88 70 L79 72 L70 44 Q72 70 75 88 L25 88 Q28 70 30 44 L21 72 L12 70 L20 30 Z'],
    linee: ['M34 15 Q50 30 66 15', 'M30 44 Q50 48 70 44', 'M12 70 L21 72 M79 72 L88 70'],
  },
  top: {
    corpo: ['M33 24 Q50 32 67 24 L68 50 Q72 68 70 86 L30 86 Q28 68 32 50 Z'],
    linee: ['M38 26 L39 8 M62 26 L61 8', 'M32 50 Q50 54 68 50'],
  },
  maglia: {
    corpo: [MANICHE_LUNGHE],
    linee: ['M42 13 Q50 23 58 13', POLSINI],
  },
  dolcevita: {
    dietro: ['M41 4 L59 4 L59 18 L41 18 Z'],
    corpo: [MANICHE_LUNGHE],
    linee: ['M45 4 L45 16 M50 4 L50 18 M55 4 L55 16', POLSINI, COSTE_FONDO],
  },
  maglione: {
    corpo: [MANICHE_LUNGHE],
    linee: ['M42 13 Q50 23 58 13', 'M40 14 Q50 27 60 14', COSTE_FONDO, POLSINI, 'M13 71 L21 73 M79 73 L87 71'],
  },
  felpa: {
    dietro: ['M36 18 Q34 2 50 2 Q66 2 64 18 Z'],
    corpo: [MANICHE_LUNGHE],
    scuro: ['M37 62 L63 62 L67 77 L33 77 Z'],
    linee: ['M41 13 Q50 26 59 13', 'M46 20 L45 34 M54 20 L55 34', COSTE_FONDO, POLSINI],
  },
  cardigan: {
    corpo: [MANICHE_LUNGHE],
    chiaro: ['M42 13 Q50 18 58 13 L50 40 Z'],
    linee: ['M42 13 L50 40 L58 13', 'M50 40 L50 88', COSTE_FONDO, POLSINI],
    bottoni: [[50, 48], [50, 58], [50, 68], [50, 78]],
  },
  blazer: {
    corpo: ['M32 14 L42 10 L50 40 L58 10 L68 14 L80 28 L88 78 L79 80 L70 44 L72 90 L28 90 L30 44 L21 80 L12 78 L20 28 Z'],
    chiaro: ['M42 10 L50 40 L58 10 Q50 14 42 10 Z'],
    linee: ['M42 10 L39 24 L45 28 L50 40', 'M58 10 L61 24 L55 28 L50 40', 'M50 40 L50 90', 'M33 66 L44 66 M56 66 L67 66', 'M56 30 L64 30'],
    bottoni: [[50, 52], [50, 62]],
  },
  'giacca-jeans': {
    corpo: ['M30 16 L42 12 L50 19 L58 12 L70 16 L82 30 L88 72 L79 74 L70 44 L70 80 L30 80 L30 44 L21 74 L12 72 L18 30 Z'],
    chiaro: ['M42 12 L46 22 L50 19 L54 22 L58 12 Q50 16 42 12 Z'],
    linee: ['M33 33 L46 33 L46 44 L33 44 Z', 'M54 33 L67 33 L67 44 L54 44 Z', 'M50 19 L50 80', 'M30 72 L70 72', 'M30 52 L70 52'],
    tratteggio: ['M36 50 L36 70 M64 50 L64 70'],
    bottoni: [[50, 30], [50, 46], [50, 62], [40, 38], [60, 38]],
  },
  giubbotto: {
    corpo: ['M30 18 L42 12 Q50 16 58 12 L70 18 Q84 26 86 68 L78 72 Q74 52 70 46 L70 76 L30 76 L30 46 Q26 52 22 72 L14 68 Q16 26 30 18 Z'],
    scuro: ['M30 76 L70 76 L70 84 L30 84 Z', 'M42 12 Q50 18 58 12 L58 8 Q50 12 42 8 Z', 'M14 68 L22 72 L21 78 L13 74 Z', 'M86 68 L78 72 L79 78 L87 74 Z'],
    linee: ['M50 14 L50 84', 'M34 56 L42 50 M66 56 L58 50'],
  },
  trench: {
    corpo: ['M32 14 L42 10 L50 30 L58 10 L68 14 L80 28 L88 80 L79 82 L70 44 L72 96 L28 96 L30 44 L21 82 L12 80 L20 28 Z'],
    scuro: ['M29 54 L71 54 L71 60 L29 60 Z'],
    chiaro: ['M47 53 L55 53 L55 61 L47 61 Z'],
    linee: ['M42 10 L38 24 L44 28 L50 30', 'M58 10 L62 24 L56 28 L50 30', 'M50 30 L50 96', 'M20 28 L32 22 M80 28 L68 22'],
    bottoni: [[44, 38], [56, 38], [44, 46], [56, 46], [44, 70], [56, 70]],
  },
  cappotto: {
    corpo: ['M32 14 L42 10 L50 30 L58 10 L68 14 L80 28 L88 80 L79 82 L70 44 L72 96 L28 96 L30 44 L21 82 L12 80 L20 28 Z'],
    linee: ['M42 10 L38 24 L44 28 L50 30', 'M58 10 L62 24 L56 28 L50 30', 'M50 30 L50 96', 'M33 70 L43 68 M57 68 L67 70', 'M12 80 L21 82 M79 82 L88 80'],
    bottoni: [[45, 42], [55, 42], [45, 56], [55, 56]],
  },
  piumino: {
    dietro: ['M39 12 L39 4 L61 4 L61 12 Z'],
    corpo: ['M30 16 L42 10 Q50 14 58 10 L70 16 Q85 22 86 76 L77 79 Q73 56 70 48 L71 84 Q50 89 29 84 L30 48 Q27 56 23 79 L14 76 Q15 22 30 16 Z'],
    linee: [
      'M30 30 Q50 35 70 30',
      'M30 44 Q50 49 70 44',
      'M30 58 Q50 63 70 58',
      'M30 72 Q50 77 70 72',
      'M16 40 Q20 42 26 40 M74 40 Q80 42 84 40',
      'M15 56 Q20 58 25 56 M75 56 Q80 58 85 56',
      'M50 12 L50 87',
    ],
  },
  impermeabile: {
    dietro: ['M37 16 Q36 1 50 1 Q64 1 63 16 Z'],
    corpo: ['M30 18 L42 12 Q50 16 58 12 L70 18 Q84 26 87 74 L78 77 Q74 54 70 46 L71 88 L29 88 L30 46 Q26 54 22 77 L13 74 Q16 26 30 18 Z'],
    linee: ['M50 14 L50 88', 'M33 62 L43 56 M67 62 L57 56', 'M13 74 L22 77 M78 77 L87 74', 'M41 13 Q50 20 59 13'],
  },
  pantaloni: {
    corpo: [PANTALONI],
    linee: ['M30 15 L70 15', 'M50 15 L50 28', 'M38 20 L36 90 M62 20 L64 90'],
  },
  jeans: {
    corpo: [PANTALONI],
    linee: ['M30 15 L70 15', 'M50 15 L50 30', 'M32 16 Q36 26 44 16', 'M68 16 Q64 26 56 16'],
    tratteggio: ['M48 16 Q48 28 52 30', 'M27 86 L44 86 M56 86 L73 86'],
    bottoni: [[50, 11]],
  },
  shorts: {
    corpo: ['M28 14 L72 14 L77 60 L55 63 L50 36 L45 63 L23 60 Z'],
    linee: ['M28 21 L72 21', 'M50 21 L50 34', 'M24 54 L45 57 M55 57 L76 54', 'M31 22 Q35 30 42 22 M69 22 Q65 30 58 22'],
  },
  gonna: {
    corpo: ['M34 22 L66 22 L79 76 Q50 83 21 76 Z'],
    scuro: ['M34 22 L66 22 L67 29 L33 29 Z'],
    linee: ['M42 29 L36 79 M50 29 L50 80 M58 29 L64 79'],
  },
  'gonna-lunga': {
    corpo: ['M36 8 L64 8 L77 90 Q50 96 23 90 Z'],
    scuro: ['M36 8 L64 8 L65 15 L35 15 Z'],
    linee: ['M44 15 Q40 50 36 92 M56 15 Q60 50 64 92'],
  },
  leggings: {
    corpo: ['M33 8 L67 8 L64 92 L54 92 L50 30 L46 92 L36 92 Z'],
    scuro: ['M33 8 L67 8 L67 15 L33 15 Z'],
    linee: ['M50 15 L50 28'],
  },
  'pantaloni-tuta': {
    corpo: ['M30 8 L70 8 L70 84 L56 84 L50 30 L44 84 L30 84 Z'],
    scuro: ['M31 84 L44 84 L43 92 L32 92 Z', 'M56 84 L69 84 L68 92 L57 92 Z', 'M30 8 L70 8 L70 15 L30 15 Z'],
    linee: ['M46 15 L45 24 M54 15 L55 24', 'M32 16 L32 84 M68 16 L68 84'],
  },
  vestito: {
    corpo: ['M37 8 L44 8 Q50 16 56 8 L63 8 L65 34 Q62 40 66 44 L80 92 Q50 98 20 92 L34 44 Q38 40 35 34 Z'],
    linee: ['M44 8 Q50 18 56 8', 'M35 40 Q50 45 65 40', 'M44 46 L38 92 M56 46 L62 92'],
  },
  'vestito-estivo': {
    corpo: ['M35 18 Q50 27 65 18 L65 38 L83 90 Q50 97 17 90 L35 38 Z'],
    scuro: ['M35 36 Q50 40 65 36 L65 41 Q50 45 35 41 Z'],
    linee: ['M39 19 L39 4 M61 19 L61 4', 'M42 44 L32 90 M50 45 L50 93 M58 44 L68 90'],
  },
  sneakers: {
    corpo: ['M10 70 L13 46 Q20 40 32 43 L46 51 Q55 47 63 53 L84 58 Q93 61 92 72 L10 72 Z'],
    chiaro: ['M8 72 L94 72 L94 80 Q50 84 8 80 Z'],
    linee: ['M40 50 L45 45 M46 53 L51 48 M52 56 L57 51', 'M70 58 Q76 66 92 66', 'M16 54 L30 56'],
  },
  running: {
    corpo: ['M10 70 L14 46 Q22 40 34 44 L48 52 Q56 48 64 54 L84 58 Q94 62 92 72 L10 72 Z'],
    chiaro: ['M8 72 L94 72 Q92 82 70 82 L20 82 Q8 82 8 72 Z'],
    linee: ['M40 50 L45 45 M46 53 L51 48 M52 56 L57 51', 'M22 64 Q44 56 66 66', 'M28 70 Q48 62 74 70'],
  },
  stivaletti: {
    corpo: ['M22 20 L46 20 L48 56 Q60 60 78 62 Q90 64 90 76 L90 78 L22 78 Z'],
    scuro: ['M22 78 L90 78 L90 82 L22 82 Z', 'M22 82 L36 82 L36 90 L22 90 Z'],
    chiaro: ['M30 22 L40 22 L41 46 L31 46 Z'],
    linee: ['M22 26 L46 26'],
  },
  stivali: {
    corpo: ['M28 4 L52 4 L52 58 Q64 62 80 64 Q90 66 90 78 L90 80 L28 80 Z'],
    scuro: ['M28 80 L90 80 L90 84 L28 84 Z', 'M28 84 L40 84 L40 94 L28 94 Z'],
    linee: ['M28 10 L52 10', 'M48 14 L48 56'],
  },
  mocassini: {
    corpo: ['M10 68 Q12 52 30 51 L62 53 Q86 55 90 68 L90 72 L10 72 Z'],
    scuro: ['M8 72 L92 72 L92 76 L8 76 Z'],
    linee: ['M46 56 Q58 51 72 57', 'M50 59 L66 60', 'M16 60 Q24 58 32 58'],
  },
  'scarpe-eleganti': {
    corpo: ['M10 66 Q12 49 30 49 L56 53 Q84 55 90 67 L90 72 L10 72 Z'],
    scuro: ['M8 72 L92 72 L92 76 L8 76 Z', 'M10 76 L26 76 L26 82 L10 82 Z'],
    linee: ['M44 54 L48 50 M48 56 L52 52 M52 57 L56 53', 'M66 56 Q72 62 72 72'],
  },
  decollete: {
    corpo: ['M20 52 Q40 58 62 66 L88 70 Q95 76 86 78 L60 78 Q44 70 30 70 L26 92 L21 92 L20 70 Z'],
    linee: ['M30 62 Q46 64 60 70'],
  },
  sandali: {
    scuro: ['M8 72 Q8 66 20 66 L84 66 Q93 66 93 72 L93 78 L8 78 Z'],
    corpo: ['M28 66 Q40 46 56 66 Z', 'M60 66 Q69 52 80 66 Z', 'M14 66 Q16 52 30 50 L32 56 Q22 58 20 66 Z'],
    linee: ['M8 74 L93 74'],
  },
  ballerine: {
    corpo: ['M12 68 Q14 56 30 56 Q50 63 70 60 Q88 60 90 70 L90 73 L12 73 Z'],
    scuro: ['M10 73 L92 73 L92 76 L10 76 Z'],
    chiaro: ['M66 57 L74 53 L74 61 Z', 'M66 57 L58 53 L58 61 Z'],
  },
  sciarpa: {
    corpo: ['M28 10 Q50 22 72 10 L72 30 Q50 42 28 30 Z', 'M38 32 L35 88 L50 88 L50 36 Z'],
    scuro: ['M50 36 L58 34 L64 84 L50 86 Z'],
    linee: ['M36 82 L37 94 M40 82 L41 94 M44 82 L44 94 M48 82 L48 94', 'M28 20 Q50 32 72 20'],
  },
  berretto: {
    corpo: ['M20 66 Q20 22 50 22 Q80 22 80 66 Z'],
    scuro: ['M17 60 L83 60 L83 78 L17 78 Z'],
    chiaro: ['M50 10 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0'],
    linee: ['M24 60 L24 78 M32 60 L32 78 M40 60 L40 78 M48 60 L48 78 M56 60 L56 78 M64 60 L64 78 M72 60 L72 78', 'M35 30 Q30 44 30 60 M65 30 Q70 44 70 60'],
  },
  cappellino: {
    corpo: ['M18 64 Q18 26 50 26 Q80 26 82 62 Z'],
    scuro: ['M70 58 Q92 58 97 68 L64 68 Q66 62 70 58 Z'],
    linee: ['M50 26 L50 62', 'M34 30 Q30 46 30 64', 'M66 30 Q70 46 70 62', 'M18 64 L70 64'],
    bottoni: [[50, 26]],
  },
  occhiali: {
    corpo: ['M13 40 L44 40 Q46 63 29 64 Q12 62 13 40 Z', 'M56 40 L87 40 Q88 62 71 64 Q54 63 56 40 Z'],
    linee: ['M44 44 Q50 38 56 44', 'M13 42 L5 37 M87 42 L95 37'],
  },
  ombrello: {
    corpo: ['M8 50 Q12 14 50 12 Q88 14 92 50 Q82 44 71 50 Q61 44 50 50 Q39 44 29 50 Q18 44 8 50 Z'],
    linee: ['M50 12 L50 6', 'M50 12 Q36 26 29 50 M50 12 Q64 26 71 50', 'M50 50 L50 84 Q50 93 41 91'],
  },
  borsa: {
    corpo: ['M17 40 L83 40 L89 88 L11 88 Z'],
    scuro: ['M17 40 L83 40 L80 56 Q50 64 20 56 Z'],
    chiaro: ['M46 56 L54 56 L54 64 L46 64 Z'],
    linee: ['M33 40 Q33 14 50 14 Q67 14 67 40'],
  },
  'borsa-sport': {
    corpo: ['M10 46 Q10 34 22 34 L78 34 Q90 34 90 46 L90 78 Q90 85 82 85 L18 85 Q10 85 10 78 Z'],
    scuro: ['M10 46 Q10 34 22 34 L26 34 L26 85 L18 85 Q10 85 10 78 Z', 'M74 34 L78 34 Q90 34 90 46 L90 78 Q90 85 82 85 L74 85 Z'],
    linee: ['M34 34 Q34 16 50 16 Q66 16 66 34', 'M26 46 L74 46'],
  },
  guanti: {
    corpo: ['M30 82 L30 56 L23 41 Q21 34 28 34 L34 46 L34 22 Q34 16 39 16 Q44 16 44 22 L44 42 L46 18 Q46 12 51 12 Q56 12 56 18 L56 42 L58 22 Q58 16 63 16 Q68 16 68 22 L68 62 L70 82 Z'],
    scuro: ['M29 80 L71 80 L71 92 L29 92 Z'],
    linee: ['M44 42 L44 52 M56 42 L56 52'],
  },
};

export const SAGOME_DISPONIBILI = Object.keys(DISEGNI) as SagomaId[];

interface Props {
  id: SagomaId;
  colore: string;
  titolo?: string;
  className?: string;
}

export function Sagoma({ id, colore, titolo, className }: Props) {
  const d = DISEGNI[id];
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
    >
      <g strokeLinejoin="round" strokeLinecap="round" strokeWidth={1.6} stroke={contorno}>
        {d.dietro?.map((p, i) => <path key={`d${i}`} d={p} fill={dietro} />)}
        {d.corpo.map((p, i) => <path key={`c${i}`} d={p} fill={colore} />)}
        {d.chiaro?.map((p, i) => <path key={`l${i}`} d={p} fill={inserto} />)}
        {d.scuro?.map((p, i) => <path key={`s${i}`} d={p} fill={scuro} />)}
        {d.linee?.map((p, i) => <path key={`n${i}`} d={p} fill="none" strokeWidth={1.2} opacity={0.85} />)}
        {d.tratteggio?.map((p, i) => <path key={`t${i}`} d={p} fill="none" strokeWidth={1} strokeDasharray="2 2" />)}
        {d.bottoni?.map(([x, y], i) => <circle key={`b${i}`} cx={x} cy={y} r={1.6} fill={contorno} stroke="none" />)}
      </g>
    </svg>
  );
}
