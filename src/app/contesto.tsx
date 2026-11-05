import { createContext, useContext } from 'react';
import type { Capo, Profilo } from '../shared/tipi';
import type { StatoMeteo } from '../features/meteo/useMeteo';

export interface DatiApp {
  profilo: Profilo;
  meteo: StatoMeteo;
  armadio: Capo[];
  /** Giorno di oggi nel luogo scelto "AAAA-MM-GG". */
  oggi: string;
  adesso: number;
  apriPosizione: () => void;
  vaiA: (scheda: Scheda) => void;
  /** "Abbinalo": capo dell'armadio da tenere fisso negli outfit di oggi. */
  daAbbinare?: Capo;
  abbina: (capo: Capo) => void;
}

export type Scheda = 'oggi' | 'settimana' | 'armadio' | 'profilo';

export const ContestoApp = createContext<DatiApp | null>(null);

export function useApp(): DatiApp {
  const dati = useContext(ContestoApp);
  if (!dati) throw new Error('useApp va usato dentro <ContestoApp.Provider>');
  return dati;
}
