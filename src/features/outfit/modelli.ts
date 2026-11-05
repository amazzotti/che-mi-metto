/**
 * Modelli delle sagome: lo stesso capo può avere forme diverse (jeans skinny o a zampa,
 * gonna a tubino o a ruota...) e alcune forme sono solo da donna o solo da uomo.
 * Così le idee proposte non hanno tutte la stessa faccia.
 */
import type { Genere } from '../../shared/tipi';
import type { CategoriaId, SagomaId } from './catalogo';
import { categoria } from './catalogo';
import { COSTE_FONDO, DISEGNI, type Disegno, MANICHE_LUNGHE, POLSINI } from './sagome';

export interface Modello extends Disegno {
  /** Aggiunto al nome del capo, es. "a zampa" → "Jeans a zampa". */
  nome?: string;
  /** Sostituisce del tutto il nome del capo (es. "Shorts" al posto di "Bermuda"). */
  nomeCompleto?: string;
  /** Se presente, il modello vale solo per questi generi. */
  generi?: Genere[];
}

const U: Genere[] = ['uomo'];
const D: Genere[] = ['donna'];

/** Il disegno base di queste sagome è maschile: per la donna ci sono i modelli qui sotto. */
const BASE_SOLO_UOMO: SagomaId[] = ['tshirt', 'maglia', 'camicia', 'jeans', 'pantaloni', 'blazer', 'cappotto', 'shorts'];

const COSTE_CORTE =
  'M30 70 L70 70 M34 70 L34 76 M38 70 L38 76 M42 70 L42 76 M46 70 L46 76 M50 70 L50 76 M54 70 L54 76 M58 70 L58 76 M62 70 L62 76 M66 70 L66 76';

/** Modelli in più, oltre al disegno base. */
const ALTRI_MODELLI: Partial<Record<SagomaId, Modello[]>> = {
  tshirt: [
    {
      generi: U,
      nome: 'con scollo a V',
      corpo: ['M30 18 L42 14 L50 25 L58 14 L70 18 L86 32 L77 42 L70 37 L70 86 L30 86 L30 37 L23 42 L14 32 Z'],
      linee: ['M42 14 L50 28 L58 14', 'M23 42 L30 37 M77 42 L70 37'],
    },
    {
      generi: D,
      corpo: ['M36 16 L43 14 Q50 22 57 14 L64 16 L76 26 L70 34 L65 31 Q62 46 66 60 Q67 72 65 84 L35 84 Q33 72 34 60 Q38 46 35 31 L30 34 L24 26 Z'],
      linee: ['M43 14 Q50 24 57 14', 'M30 34 L35 31 M70 34 L65 31'],
    },
    {
      generi: D,
      nome: 'oversize',
      corpo: ['M26 20 L42 15 Q50 21 58 15 L74 20 L88 40 L78 46 L72 40 L72 86 L28 86 L28 40 L22 46 L12 40 Z'],
      linee: ['M42 15 Q50 24 58 15', 'M22 46 L28 40 M78 46 L72 40'],
    },
  ],
  maglia: [
    {
      generi: D,
      corpo: ['M37 16 L44 14 Q50 22 56 14 L63 16 L74 28 L84 72 L77 74 L68 40 Q63 52 66 62 Q67 74 65 86 L35 86 Q33 74 34 62 Q37 52 32 40 L23 74 L16 72 L26 28 Z'],
      linee: ['M44 14 Q50 24 56 14', 'M16 72 L23 74 M77 74 L84 72'],
    },
  ],
  maglione: [
    {
      nome: 'a trecce',
      corpo: [MANICHE_LUNGHE],
      linee: [
        'M40 22 Q36 28 40 34 Q44 40 40 46 Q36 52 40 58 Q44 64 40 70 Q36 76 40 80',
        'M60 22 Q56 28 60 34 Q64 40 60 46 Q56 52 60 58 Q64 64 60 70 Q56 76 60 80',
        'M42 13 Q50 23 58 13',
        COSTE_FONDO,
        POLSINI,
      ],
    },
    {
      generi: D,
      nome: 'corto',
      corpo: ['M33 16 L44 13 Q50 20 56 13 L67 16 L81 28 L90 70 L80 74 L70 42 L70 76 L30 76 L30 42 L20 74 L10 70 L19 28 Z'],
      linee: ['M44 13 Q50 22 56 13', COSTE_CORTE, 'M10 70 L20 74 M80 74 L90 70'],
    },
  ],
  felpa: [
    {
      generi: D,
      nome: 'corta',
      dietro: ['M37 18 Q35 3 50 3 Q65 3 63 18 Z'],
      corpo: ['M32 16 L42 13 Q50 20 58 13 L68 16 L80 30 L88 72 L79 74 L70 44 L70 72 L30 72 L30 44 L21 74 L12 72 L20 30 Z'],
      linee: ['M42 13 Q50 25 58 13', 'M46 20 L45 32 M54 20 L55 32', 'M30 66 L70 66', 'M12 72 L21 74 M79 74 L88 72'],
    },
  ],
  camicia: [
    {
      generi: D,
      corpo: ['M34 15 L43 12 L50 19 L57 12 L66 15 L78 28 L86 72 L78 74 L69 42 Q65 56 68 70 Q66 82 60 84 Q50 80 40 84 Q34 82 32 70 Q35 56 31 42 L22 74 L14 72 L22 28 Z'],
      chiaro: ['M43 12 L46 21 L50 19 L54 21 L57 12 Q50 16 43 12 Z'],
      linee: ['M50 19 L50 81', 'M14 72 L22 74 M78 74 L86 72'],
      bottoni: [
        [50, 30],
        [50, 42],
        [50, 54],
        [50, 66],
      ],
    },
  ],
  blusa: [
    {
      nome: 'con maniche a sbuffo',
      corpo: ['M35 18 Q50 26 65 18 L74 22 Q87 28 82 40 L74 42 L70 38 Q67 50 68 62 Q70 74 72 86 L28 86 Q30 74 32 62 Q33 50 30 38 L26 42 L18 40 Q13 28 26 22 Z'],
      linee: ['M35 18 Q50 29 65 18', 'M26 42 L30 38 M74 42 L70 38', 'M76 26 Q78 32 76 38 M24 26 Q22 32 24 38'],
    },
  ],
  jeans: [
    {
      generi: U,
      nome: 'slim',
      corpo: ['M31 8 L69 8 L68 92 L55 92 L50 30 L45 92 L32 92 Z'],
      linee: ['M31 15 L69 15', 'M50 15 L50 30', 'M33 16 Q37 26 44 16', 'M67 16 Q63 26 56 16'],
      tratteggio: ['M48 16 Q48 28 52 30', 'M32 86 L45 86 M55 86 L68 86'],
      bottoni: [[50, 11]],
    },
    {
      generi: D,
      nome: 'skinny',
      corpo: ['M33 6 L67 6 L66 92 L55 92 L50 32 L45 92 L34 92 Z'],
      linee: ['M33 13 L67 13', 'M50 13 L50 30', 'M35 14 Q38 24 44 14', 'M65 14 Q62 24 56 14'],
      tratteggio: ['M34 86 L45 86 M55 86 L66 86'],
      bottoni: [[50, 9]],
    },
    {
      generi: D,
      nome: 'a zampa',
      corpo: ['M32 6 L68 6 L66 60 L75 92 L54 92 L50 32 L46 92 L25 92 L34 60 Z'],
      linee: ['M32 13 L68 13', 'M50 13 L50 30', 'M34 14 Q38 24 44 14', 'M66 14 Q62 24 56 14'],
      tratteggio: ['M26 87 L46 87 M54 87 L74 87'],
      bottoni: [[50, 9]],
    },
  ],
  pantaloni: [
    {
      generi: D,
      corpo: ['M33 6 L67 6 L66 84 L55 84 L50 32 L45 84 L34 84 Z'],
      linee: ['M33 13 L67 13', 'M50 13 L50 28', 'M40 18 L39 82 M60 18 L61 82'],
    },
  ],
  blazer: [
    {
      generi: D,
      nome: 'sciancrato',
      corpo: ['M34 14 L43 11 L50 38 L57 11 L66 14 L78 28 L86 76 L78 78 L69 42 Q65 52 68 62 L71 84 L29 84 L32 62 Q35 52 31 42 L22 78 L14 76 L22 28 Z'],
      chiaro: ['M43 11 L50 38 L57 11 Q50 15 43 11 Z'],
      linee: ['M43 11 L40 24 L46 28 L50 38', 'M57 11 L60 24 L54 28 L50 38', 'M50 38 L50 84', 'M35 68 L44 68 M56 68 L65 68'],
      bottoni: [[50, 52]],
    },
  ],
  cappotto: [
    {
      generi: D,
      nome: 'a vestaglia',
      corpo: ['M33 14 L43 10 L50 28 L57 10 L67 14 L79 28 L87 80 L78 82 L69 44 Q66 52 68 58 L74 96 L26 96 L32 58 Q34 52 31 44 L22 82 L13 80 L21 28 Z'],
      scuro: ['M31 52 L69 52 L69 58 L31 58 Z', 'M54 58 L50 76 L55 76 L59 58 Z'],
      linee: ['M43 10 Q38 30 46 52', 'M57 10 Q62 30 54 52', 'M46 58 L44 96', 'M13 80 L22 82 M78 82 L87 80'],
    },
  ],
  piumino: [
    {
      generi: D,
      nome: 'lungo',
      dietro: ['M40 10 L40 3 L60 3 L60 10 Z'],
      corpo: ['M32 14 L43 9 Q50 13 57 9 L68 14 Q83 20 85 76 L76 79 Q72 56 69 48 Q66 56 68 62 L70 96 Q50 99 30 96 L32 62 Q34 56 31 48 Q28 56 24 79 L15 76 Q17 20 32 14 Z'],
      linee: [
        'M31 26 Q50 30 69 26',
        'M31 38 Q50 42 69 38',
        'M31 50 Q50 54 69 50',
        'M32 62 Q50 66 68 62',
        'M31 74 Q50 78 69 74',
        'M30 86 Q50 90 70 86',
        'M50 11 L50 97',
      ],
    },
  ],
  shorts: [
    {
      generi: D,
      nomeCompleto: 'Shorts',
      corpo: ['M30 16 L70 16 L74 46 L55 48 L50 34 L45 48 L26 46 Z'],
      scuro: ['M30 16 L70 16 L70.5 22 L29.5 22 Z'],
      linee: ['M33 23 Q37 30 43 23 M67 23 Q63 30 57 23'],
    },
  ],
  gonna: [
    {
      nome: 'a tubino',
      corpo: ['M35 20 L65 20 L67 46 Q66 66 63 84 L37 84 Q34 66 33 46 Z'],
      scuro: ['M35 20 L65 20 L65.5 26 L34.5 26 Z'],
      linee: ['M50 74 L50 84', 'M42 28 L41 40 M58 28 L59 40'],
    },
    {
      nome: 'a ruota',
      corpo: ['M37 22 L63 22 L85 68 Q50 81 15 68 Z'],
      scuro: ['M37 22 L63 22 L64 28 L36 28 Z'],
      linee: ['M44 28 L30 72 M50 28 L50 76 M56 28 L70 72'],
    },
  ],
  vestito: [
    {
      nome: 'a tubino',
      corpo: ['M38 8 L44 8 Q50 14 56 8 L62 8 L64 30 Q61 40 65 52 Q66 72 63 92 L37 92 Q34 72 35 52 Q39 40 36 30 Z'],
      linee: ['M44 8 Q50 16 56 8', 'M42 40 L44 56 M58 40 L56 56'],
    },
    {
      nome: 'a sottoveste',
      corpo: ['M36 20 Q50 26 64 20 L65 40 Q66 66 70 94 Q50 98 30 94 Q34 66 35 40 Z'],
      linee: ['M40 21 L40 5 M60 21 L60 5', 'M36 20 L50 29 L64 20'],
    },
  ],
  'vestito-estivo': [
    {
      nome: 'a portafoglio',
      corpo: ['M36 14 L44 12 L50 30 L56 12 L64 14 L74 24 L68 30 L64 28 Q62 36 65 42 L80 90 Q50 96 20 90 L35 42 Q38 36 36 28 L32 30 L26 24 Z'],
      linee: ['M44 12 L57 44', 'M58 43 L61 55 M58 43 L66 51', 'M32 30 L36 28 M68 30 L64 28'],
    },
  ],
  stivaletti: [
    {
      generi: D,
      nome: 'col tacco',
      corpo: ['M26 18 L48 18 L50 58 Q64 62 80 66 Q90 68 90 76 L90 78 L36 78 L32 92 L27 92 L26 78 Z'],
      scuro: ['M40 78 L90 78 L90 81 L40 81 Z'],
      linee: ['M26 24 L48 24'],
    },
  ],
};

/** Tutti i modelli di una sagoma adatti a un genere (almeno uno: il disegno base). */
export function modelli(id: SagomaId, genere?: Genere): Modello[] {
  const base: Modello = { ...DISEGNI[id], generi: BASE_SOLO_UOMO.includes(id) ? U : undefined };
  const tutti = [base, ...(ALTRI_MODELLI[id] ?? [])];
  if (!genere) return tutti;
  const adatti = tutti.filter((m) => !m.generi || m.generi.includes(genere));
  return adatti.length > 0 ? adatti : [base];
}

/** Il modello numero `indice` (che "gira" se è più grande del numero di modelli). */
export function modello(id: SagomaId, genere: Genere | undefined, indice = 0): Modello {
  const lista = modelli(id, genere);
  return lista[((indice % lista.length) + lista.length) % lista.length];
}

export function numeroModelli(id: CategoriaId, genere: Genere): number {
  return modelli(categoria(id).sagoma, genere).length;
}

/** Nome del capo con il suo modello, es. "Jeans a zampa", "Gonna a ruota". */
export function nomeConModello(id: CategoriaId, genere: Genere, indice = 0): string {
  const m = modello(categoria(id).sagoma, genere, indice);
  if (m.nomeCompleto) return m.nomeCompleto;
  return m.nome ? `${categoria(id).nome} ${m.nome}` : categoria(id).nome;
}
