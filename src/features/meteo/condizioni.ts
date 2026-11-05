import { codiceNeve, codicePioggia } from './codiciMeteo';
import type { MeteoOra, Previsioni } from './openMeteo';
import { oraLocale } from './openMeteo';

/** Il meteo riassunto per una fascia di ore: è l'input del motore degli outfit. */
export interface Condizioni {
  /** Temperatura percepita media nella fascia. */
  percepita: number;
  percepitaMin: number;
  percepitaMax: number;
  temperaturaMin: number;
  temperaturaMax: number;
  /** Probabilità massima di pioggia (0-100). */
  probPioggia: number;
  /** Pioggia totale prevista in mm. */
  pioggia: number;
  /** Vento massimo in km/h. */
  vento: number;
  uv: number;
  neve: boolean;
  /** Codice meteo più significativo della fascia. */
  codice: number;
  /** Prima e ultima ora considerate ("HH:MM"). */
  dalle: string;
  alle: string;
  /** La fascia include ore serali (dopo le 19). */
  sera: boolean;
}

export function riassumi(ore: MeteoOra[]): Condizioni | null {
  if (ore.length === 0) return null;
  const perc = ore.map((o) => o.percepita);
  const temp = ore.map((o) => o.temperatura);
  const codici = ore.map((o) => o.codice);
  // Il codice "peggiore" è il più significativo (i codici WMO crescono con l'intensità).
  const codice = Math.max(...codici);
  return {
    percepita: Math.round((perc.reduce((a, b) => a + b, 0) / perc.length) * 10) / 10,
    percepitaMin: Math.min(...perc),
    percepitaMax: Math.max(...perc),
    temperaturaMin: Math.min(...temp),
    temperaturaMax: Math.max(...temp),
    probPioggia: Math.max(...ore.map((o) => o.probPioggia)),
    pioggia: Math.round(ore.reduce((a, o) => a + o.pioggia, 0) * 10) / 10,
    vento: Math.max(...ore.map((o) => o.vento)),
    uv: Math.max(...ore.map((o) => o.uv)),
    neve: codici.some(codiceNeve),
    codice,
    dalle: ore[0].ora.slice(11, 16),
    alle: ore[ore.length - 1].ora.slice(11, 16),
    sera: ore.some((o) => Number(o.ora.slice(11, 13)) >= 19),
  };
}

function oreTra(previsioni: Previsioni, da: string, a: string): MeteoOra[] {
  return previsioni.orarie.filter((o) => o.ora >= da && o.ora <= a);
}

/**
 * Condizioni per la giornata "fuori casa" (8-20).
 * Per oggi parte dall'ora attuale; la sera tardi guarda le ore fino a mezzanotte.
 */
export function condizioniGiorno(previsioni: Previsioni, data: string, adesso = Date.now()): Condizioni | null {
  const ora = oraLocale(previsioni, adesso);
  let da = `${data}T08:00`;
  let a = `${data}T20:00`;
  if (ora.slice(0, 10) === data) {
    const inizio = `${ora.slice(0, 13)}:00`;
    if (inizio > da) da = inizio;
    if (da > a) a = `${data}T23:00`;
  }
  return riassumi(oreTra(previsioni, da, a));
}

/** Condizioni attorno a un impegno: dall'ora prima a due ore dopo. */
export function condizioniOra(previsioni: Previsioni, data: string, oraHHMM: string): Condizioni | null {
  const h = Number(oraHHMM.slice(0, 2));
  const pad = (n: number) => String(Math.max(0, Math.min(23, n))).padStart(2, '0');
  return riassumi(oreTra(previsioni, `${data}T${pad(h - 1)}:00`, `${data}T${pad(h + 2)}:00`));
}

/** Probabilità di pioggia "da prendere sul serio". */
export function piove(c: Pick<Condizioni, 'probPioggia' | 'pioggia' | 'codice'>): boolean {
  return c.probPioggia >= 50 || c.pioggia >= 1 || (codicePioggia(c.codice) && c.probPioggia >= 30);
}
