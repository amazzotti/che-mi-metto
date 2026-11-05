export type Stagione = 'inverno' | 'primavera' | 'estate' | 'autunno';

export interface InfoStagione {
  stagione: Stagione;
  periodo: 'inizio' | 'metà' | 'fine';
  /** Es. "Inizio autunno". */
  etichetta: string;
  /** Un consiglio sui tessuti adatti al periodo. */
  tessuti: string;
}

const NORD: Stagione[] = ['inverno', 'inverno', 'primavera', 'primavera', 'primavera', 'estate', 'estate', 'estate', 'autunno', 'autunno', 'autunno', 'inverno'];
const OPPOSTA: Record<Stagione, Stagione> = { inverno: 'estate', estate: 'inverno', primavera: 'autunno', autunno: 'primavera' };

const TESSUTI: Record<Stagione, string> = {
  inverno: 'lana, cashmere, flanella e piumino',
  primavera: 'cotone, maglia leggera e denim',
  estate: 'lino, cotone leggero e colori chiari',
  autunno: 'lana leggera, velluto e pelle',
};

/**
 * Stagione meteorologica (dicembre-febbraio = inverno al nord) a partire da "AAAA-MM-GG".
 * Nell'emisfero sud le stagioni sono invertite.
 */
export function infoStagione(data: string, latitudine: number): InfoStagione {
  const mese = Number(data.slice(5, 7)) - 1;
  if (Number.isNaN(mese) || mese < 0 || mese > 11) throw new Error(`Data non valida: ${data}`);
  const nord = NORD[mese];
  const stagione = latitudine < 0 ? OPPOSTA[nord] : nord;

  // Ogni stagione dura tre mesi: in quale mese della stagione siamo?
  const inizioStagione = [2, 5, 8, 11];
  const primoMese = inizioStagione.find((m) => (mese - m + 12) % 12 < 3) ?? 11;
  const indice = (mese - primoMese + 12) % 12;
  // Il primo mese della stagione è "inizio", il secondo "metà", il terzo "fine".
  const periodo = indice === 0 ? 'inizio' : indice === 1 ? 'metà' : 'fine';
  const etichetta = `${periodo[0].toUpperCase()}${periodo.slice(1)} ${stagione}`;
  return { stagione, periodo, etichetta, tessuti: TESSUTI[stagione] };
}
