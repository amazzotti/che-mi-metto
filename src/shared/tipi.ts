import type { CategoriaId } from '../features/outfit/catalogo';

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
  posizione?: Posizione;
}

/** Un capo caricato nell'armadio personale. */
export interface Capo {
  id: string;
  categoria: CategoriaId;
  /** Colore principale in esadecimale, es. "#1f2a44". */
  colore: string;
  nome?: string;
  occasioni: Occasione[];
  impermeabile: boolean;
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
