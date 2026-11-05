import type { Genere, Occasione } from '../../shared/tipi';

/** Posizione del capo nell'outfit. */
export type Slot = 'base' | 'strato' | 'capospalla' | 'sotto' | 'intero' | 'scarpe' | 'accessorio';

export type SagomaId =
  | 'tshirt'
  | 'canotta'
  | 'polo'
  | 'camicia'
  | 'blusa'
  | 'top'
  | 'maglia'
  | 'dolcevita'
  | 'maglione'
  | 'felpa'
  | 'cardigan'
  | 'blazer'
  | 'giacca-jeans'
  | 'giubbotto'
  | 'trench'
  | 'cappotto'
  | 'piumino'
  | 'impermeabile'
  | 'pantaloni'
  | 'jeans'
  | 'shorts'
  | 'gonna'
  | 'gonna-lunga'
  | 'leggings'
  | 'pantaloni-tuta'
  | 'vestito'
  | 'vestito-estivo'
  | 'sneakers'
  | 'running'
  | 'stivaletti'
  | 'stivali'
  | 'mocassini'
  | 'scarpe-eleganti'
  | 'decollete'
  | 'sandali'
  | 'ballerine'
  | 'sciarpa'
  | 'berretto'
  | 'cappellino'
  | 'occhiali'
  | 'ombrello'
  | 'borsa'
  | 'borsa-sport'
  | 'guanti'
  | 'gilet'
  | 'parka'
  | 'giacca-pelle'
  | 'cargo'
  | 'palazzo'
  | 'tuta-intera'
  | 'sandali-tacco'
  | 'cravatta'
  | 'cappello-paglia';

export interface CategoriaInfo {
  id: string;
  nome: string;
  slot: Slot;
  generi: readonly Genere[];
  /** Quanto scalda, da 0 (leggerissimo) a 5 (piumino). */
  calore: number;
  /** Da 1 (sportivo) a 5 (elegante): capi troppo distanti nello stesso outfit stonano. */
  formalita: number;
  occasioni: readonly Occasione[];
  sagoma: SagomaId;
  /** Ripara dalla pioggia (capispalla) o va bene sul bagnato (scarpe). */
  pioggia?: boolean;
  /** Colore tipico quando il capo non ha un colore scelto (es. jeans). */
  coloreTipico?: string;
}

const T: Genere[] = ['uomo', 'donna'];
const D: Genere[] = ['donna'];
const U: Genere[] = ['uomo'];
const TUTTE: Occasione[] = ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante', 'sport'];

export const CATALOGO = [
  // Base: quello che sta a contatto con la pelle.
  { id: 'tshirt', nome: 'T-shirt', slot: 'base', generi: T, calore: 1, formalita: 2, occasioni: ['casual', 'aperitivo', 'appuntamento'], sagoma: 'tshirt' },
  { id: 'canotta', nome: 'Canotta', slot: 'base', generi: T, calore: 0, formalita: 1, occasioni: ['casual', 'sport'], sagoma: 'canotta' },
  { id: 'polo', nome: 'Polo', slot: 'base', generi: T, calore: 1, formalita: 3, occasioni: ['casual', 'lavoro', 'aperitivo', 'appuntamento'], sagoma: 'polo' },
  { id: 'camicia', nome: 'Camicia', slot: 'base', generi: T, calore: 1.5, formalita: 4, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'camicia' },
  { id: 'camicia-lino', nome: 'Camicia di lino', slot: 'base', generi: T, calore: 1, formalita: 3, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo'], sagoma: 'camicia' },
  { id: 'blusa', nome: 'Blusa', slot: 'base', generi: D, calore: 1, formalita: 4, occasioni: ['lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'blusa' },
  { id: 'top', nome: 'Top', slot: 'base', generi: D, calore: 0.5, formalita: 3, occasioni: ['casual', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'top' },
  { id: 'maglia', nome: 'Maglia a maniche lunghe', slot: 'base', generi: T, calore: 2, formalita: 2, occasioni: ['casual', 'lavoro', 'appuntamento'], sagoma: 'maglia' },
  { id: 'dolcevita', nome: 'Dolcevita', slot: 'base', generi: T, calore: 2.5, formalita: 4, occasioni: ['casual', 'lavoro', 'appuntamento', 'elegante'], sagoma: 'dolcevita' },
  { id: 'maglia-tecnica', nome: 'Maglia tecnica', slot: 'base', generi: T, calore: 0.5, formalita: 1, occasioni: ['sport'], sagoma: 'tshirt' },

  // Strato intermedio.
  { id: 'maglione', nome: 'Maglione', slot: 'strato', generi: T, calore: 3, formalita: 3, occasioni: ['casual', 'lavoro', 'appuntamento'], sagoma: 'maglione' },
  { id: 'maglioncino', nome: 'Maglioncino leggero', slot: 'strato', generi: T, calore: 2, formalita: 3, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'maglione' },
  { id: 'felpa', nome: 'Felpa', slot: 'strato', generi: T, calore: 2.5, formalita: 1, occasioni: ['casual', 'sport'], sagoma: 'felpa' },
  { id: 'cardigan', nome: 'Cardigan', slot: 'strato', generi: T, calore: 2, formalita: 3, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo'], sagoma: 'cardigan' },
  { id: 'gilet', nome: 'Gilet', slot: 'strato', generi: T, calore: 1.5, formalita: 4, occasioni: ['casual', 'lavoro', 'appuntamento', 'elegante'], sagoma: 'gilet' },

  // Capispalla.
  { id: 'blazer', nome: 'Blazer', slot: 'capospalla', generi: T, calore: 2, formalita: 4, occasioni: ['lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'blazer' },
  { id: 'giacca-jeans', nome: 'Giacca di jeans', slot: 'capospalla', generi: T, calore: 2, formalita: 2, occasioni: ['casual', 'aperitivo'], sagoma: 'giacca-jeans', coloreTipico: '#4a6b8a' },
  { id: 'giubbotto', nome: 'Giubbotto', slot: 'capospalla', generi: T, calore: 3, formalita: 2, occasioni: ['casual', 'appuntamento', 'aperitivo'], sagoma: 'giubbotto' },
  { id: 'trench', nome: 'Trench', slot: 'capospalla', generi: T, calore: 3, formalita: 4, occasioni: ['casual', 'lavoro', 'appuntamento', 'elegante'], sagoma: 'trench', pioggia: true },
  { id: 'cappotto', nome: 'Cappotto', slot: 'capospalla', generi: T, calore: 4.5, formalita: 4, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'cappotto' },
  { id: 'piumino', nome: 'Piumino', slot: 'capospalla', generi: T, calore: 5, formalita: 2, occasioni: ['casual', 'lavoro', 'sport'], sagoma: 'piumino', pioggia: true },
  { id: 'parka', nome: 'Parka', slot: 'capospalla', generi: T, calore: 4.5, formalita: 2, occasioni: ['casual', 'lavoro'], sagoma: 'parka', pioggia: true, coloreTipico: '#6b7b3a' },
  { id: 'giacca-pelle', nome: 'Giacca di pelle', slot: 'capospalla', generi: T, calore: 2.5, formalita: 3, occasioni: ['casual', 'appuntamento', 'aperitivo'], sagoma: 'giacca-pelle', coloreTipico: '#151515' },
  { id: 'impermeabile', nome: 'Giacca impermeabile', slot: 'capospalla', generi: T, calore: 2.5, formalita: 1, occasioni: ['casual', 'sport'], sagoma: 'impermeabile', pioggia: true },

  // Parte di sotto.
  { id: 'jeans', nome: 'Jeans', slot: 'sotto', generi: T, calore: 2, formalita: 2, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo'], sagoma: 'jeans', coloreTipico: '#4a6b8a' },
  { id: 'chino', nome: 'Pantaloni chino', slot: 'sotto', generi: T, calore: 2, formalita: 3, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo'], sagoma: 'pantaloni' },
  { id: 'pantaloni-eleganti', nome: 'Pantaloni eleganti', slot: 'sotto', generi: T, calore: 2, formalita: 5, occasioni: ['lavoro', 'appuntamento', 'elegante'], sagoma: 'pantaloni' },
  { id: 'pantaloni-lino', nome: 'Pantaloni di lino', slot: 'sotto', generi: T, calore: 1, formalita: 3, occasioni: ['casual', 'appuntamento', 'aperitivo'], sagoma: 'pantaloni' },
  { id: 'cargo', nome: 'Pantaloni cargo', slot: 'sotto', generi: T, calore: 2, formalita: 2, occasioni: ['casual'], sagoma: 'cargo' },
  { id: 'pantaloni-velluto', nome: 'Pantaloni di velluto', slot: 'sotto', generi: T, calore: 2.5, formalita: 3, occasioni: ['casual', 'lavoro', 'appuntamento'], sagoma: 'pantaloni' },
  { id: 'palazzo', nome: 'Pantaloni palazzo', slot: 'sotto', generi: D, calore: 1.5, formalita: 4, occasioni: ['lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'palazzo' },
  { id: 'shorts', nome: 'Bermuda', slot: 'sotto', generi: T, calore: 0.5, formalita: 2, occasioni: ['casual', 'aperitivo'], sagoma: 'shorts' },
  { id: 'gonna', nome: 'Gonna', slot: 'sotto', generi: D, calore: 1, formalita: 3, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'gonna' },
  { id: 'gonna-lunga', nome: 'Gonna midi', slot: 'sotto', generi: D, calore: 1.5, formalita: 4, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'gonna-lunga' },
  { id: 'leggings', nome: 'Leggings', slot: 'sotto', generi: D, calore: 1.5, formalita: 1, occasioni: ['casual', 'sport'], sagoma: 'leggings' },
  { id: 'pantaloni-tuta', nome: 'Pantaloni della tuta', slot: 'sotto', generi: T, calore: 2, formalita: 1, occasioni: ['sport'], sagoma: 'pantaloni-tuta' },
  { id: 'pantaloncini-sport', nome: 'Pantaloncini sportivi', slot: 'sotto', generi: T, calore: 0.5, formalita: 1, occasioni: ['sport'], sagoma: 'shorts' },

  // Capi interi.
  { id: 'vestito', nome: 'Vestito', slot: 'intero', generi: D, calore: 1.5, formalita: 4, occasioni: ['lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'vestito' },
  { id: 'tuta-intera', nome: 'Tuta intera', slot: 'intero', generi: D, calore: 1.5, formalita: 4, occasioni: ['casual', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'tuta-intera' },
  { id: 'vestito-estivo', nome: 'Vestito leggero', slot: 'intero', generi: D, calore: 0.5, formalita: 2, occasioni: ['casual', 'appuntamento', 'aperitivo'], sagoma: 'vestito-estivo' },

  // Scarpe.
  { id: 'sneakers', nome: 'Sneakers', slot: 'scarpe', generi: T, calore: 1, formalita: 2, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo'], sagoma: 'sneakers', pioggia: true },
  { id: 'running', nome: 'Scarpe da ginnastica', slot: 'scarpe', generi: T, calore: 1, formalita: 1, occasioni: ['sport'], sagoma: 'running', pioggia: true },
  { id: 'stivaletti', nome: 'Stivaletti', slot: 'scarpe', generi: T, calore: 2, formalita: 3, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'stivaletti', pioggia: true },
  { id: 'stivali', nome: 'Stivali', slot: 'scarpe', generi: D, calore: 3, formalita: 3, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'stivali', pioggia: true },
  { id: 'mocassini', nome: 'Mocassini', slot: 'scarpe', generi: T, calore: 1, formalita: 4, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'mocassini' },
  { id: 'scarpe-eleganti', nome: 'Scarpe eleganti', slot: 'scarpe', generi: U, calore: 1, formalita: 5, occasioni: ['lavoro', 'appuntamento', 'elegante'], sagoma: 'scarpe-eleganti' },
  { id: 'decollete', nome: 'Décolleté', slot: 'scarpe', generi: D, calore: 0.5, formalita: 5, occasioni: ['lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'decollete' },
  { id: 'sandali', nome: 'Sandali', slot: 'scarpe', generi: T, calore: 0, formalita: 2, occasioni: ['casual', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'sandali' },
  { id: 'sandali-tacco', nome: 'Sandali col tacco', slot: 'scarpe', generi: D, calore: 0, formalita: 5, occasioni: ['appuntamento', 'aperitivo', 'elegante'], sagoma: 'sandali-tacco' },
  { id: 'ballerine', nome: 'Ballerine', slot: 'scarpe', generi: D, calore: 0.5, formalita: 3, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo'], sagoma: 'ballerine' },

  // Accessori.
  { id: 'sciarpa', nome: 'Sciarpa', slot: 'accessorio', generi: T, calore: 1, formalita: 3, occasioni: TUTTE, sagoma: 'sciarpa' },
  { id: 'berretto', nome: 'Berretto', slot: 'accessorio', generi: T, calore: 1, formalita: 2, occasioni: TUTTE, sagoma: 'berretto' },
  { id: 'guanti', nome: 'Guanti', slot: 'accessorio', generi: T, calore: 1, formalita: 3, occasioni: TUTTE, sagoma: 'guanti' },
  { id: 'cappellino', nome: 'Cappellino', slot: 'accessorio', generi: T, calore: 0, formalita: 1, occasioni: ['casual', 'sport'], sagoma: 'cappellino' },
  { id: 'occhiali', nome: 'Occhiali da sole', slot: 'accessorio', generi: T, calore: 0, formalita: 3, occasioni: TUTTE, sagoma: 'occhiali', coloreTipico: '#151515' },
  { id: 'ombrello', nome: 'Ombrello', slot: 'accessorio', generi: T, calore: 0, formalita: 3, occasioni: TUTTE, sagoma: 'ombrello' },
  { id: 'borsa', nome: 'Borsa', slot: 'accessorio', generi: D, calore: 0, formalita: 4, occasioni: ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante'], sagoma: 'borsa' },
  { id: 'cravatta', nome: 'Cravatta', slot: 'accessorio', generi: U, calore: 0, formalita: 5, occasioni: ['lavoro', 'elegante'], sagoma: 'cravatta' },
  { id: 'cappello-paglia', nome: 'Cappello di paglia', slot: 'accessorio', generi: T, calore: 0, formalita: 2, occasioni: ['casual', 'aperitivo'], sagoma: 'cappello-paglia', coloreTipico: '#e3c98f' },
  { id: 'borsa-sport', nome: 'Borsa da palestra', slot: 'accessorio', generi: T, calore: 0, formalita: 1, occasioni: ['sport'], sagoma: 'borsa-sport' },
] as const satisfies readonly CategoriaInfo[];

export type CategoriaId = (typeof CATALOGO)[number]['id'];

/** Il catalogo con il tipo generico, comodo per filtrare. */
export const ELENCO: readonly CategoriaInfo[] = CATALOGO;

const PER_ID = new Map<string, CategoriaInfo>(ELENCO.map((c) => [c.id, c]));

export function categoria(id: CategoriaId): CategoriaInfo {
  const c = PER_ID.get(id);
  if (!c) throw new Error(`Categoria sconosciuta: ${id}`);
  return c;
}

export function esisteCategoria(id: string): id is CategoriaId {
  return PER_ID.has(id);
}

export const NOMI_SLOT: Record<Slot, string> = {
  base: 'Sopra',
  strato: 'Maglioni e felpe',
  capospalla: 'Giacche e cappotti',
  sotto: 'Pantaloni e gonne',
  intero: 'Vestiti',
  scarpe: 'Scarpe',
  accessorio: 'Accessori',
};

export const ORDINE_SLOT: Slot[] = ['capospalla', 'strato', 'base', 'intero', 'sotto', 'scarpe', 'accessorio'];

/** Categorie che si possono scegliere per un genere, raggruppate per slot. */
export function categoriePerGenere(genere: Genere): { slot: Slot; categorie: CategoriaInfo[] }[] {
  return ORDINE_SLOT.map((slot) => ({
    slot,
    categorie: ELENCO.filter((c) => c.slot === slot && c.generi.includes(genere)),
  })).filter((g) => g.categorie.length > 0);
}
