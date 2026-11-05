import type { CategoriaId } from '../features/outfit/catalogo';
import type { Fantasia } from '../features/outfit/fantasie';

export type Genere = 'uomo' | 'donna';
export type Sensibilita = 'freddoloso' | 'normale' | 'caloroso';
export type Occasione = 'casual' | 'lavoro' | 'appuntamento' | 'elegante' | 'aperitivo' | 'sport';

export const OCCASIONI: { id: Occasione; nome: string; breve: string }[] = [
  { id: 'casual', nome: 'Casual', breve: 'Casual' },
  { id: 'lavoro', nome: 'Lavoro', breve: 'Lavoro' },
  { id: 'appuntamento', nome: 'Appuntamento', breve: 'Appuntamento' },
  { id: 'aperitivo', nome: 'Aperitivo / serata', breve: 'Aperitivo' },
  { id: 'elegante', nome: 'Uscita elegante', breve: 'Elegante' },
  { id: 'sport', nome: 'Palestra / sport', breve: 'Palestra' },
];

export function nomeOccasione(id: Occasione): string {
  return OCCASIONI.find((o) => o.id === id)?.nome ?? id;
}

export interface Posizione {
  nome: string;
  lat: number;
  lon: number;
  origine: 'gps' | 'ricerca';
}

export interface Profilo {
  genere: Genere;
  sensibilita: Sensibilita;
  /** Gradi di correzione imparati da "Ieri com'era?" (positivo = senti più freddo). */
  correzione?: number;
  posizione?: Posizione;
}

/** Un capo caricato nell'armadio personale. */
export interface Capo {
  id: string;
  categoria: CategoriaId;
  /** Colore principale in esadecimale, es. "#1f2a44". */
  colore: string;
  /** Righe, quadri, pois o fiori; assente = tinta unita. */
  fantasia?: Fantasia;
  /** Secondo colore della fantasia. */
  colore2?: string;
  /** Modello della sagoma (es. jeans skinny o a zampa), se non c'è la foto. */
  modello?: number;
  nome?: string;
  occasioni: Occasione[];
  impermeabile: boolean;
  /** Capo preferito: a parità di altro viene proposto prima. */
  preferito?: boolean;
  /** In lavatrice: non viene proposto finché non torna pulito. */
  daLavare?: boolean;
  /** Quante volte l'hai messo ("Lo metto oggi"). */
  usi?: number;
  /** Ultimo giorno in cui l'hai messo, "AAAA-MM-GG". */
  ultimoUso?: string;
  /** Foto già ridimensionata (JPEG). Assente: si usa la sagoma colorata. */
  foto?: Blob;
  creato: number;
}

/** Un impegno in agenda: l'outfit usa il meteo di quell'ora. */
export interface Impegno {
  id: string;
  /** Giorno locale "AAAA-MM-GG". */
  data: string;
  /** Ora locale "HH:MM". */
  ora: string;
  titolo: string;
  occasione: Occasione;
}
