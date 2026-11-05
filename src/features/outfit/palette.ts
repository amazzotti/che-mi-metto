import type { Occasione } from '../../shared/tipi';
import type { Stagione } from '../meteo/stagione';
import { colorePerNome } from './colori';

export interface Palette {
  /** Colori di base, per pantaloni, capispalla e scarpe. */
  neutri: string[];
  /** Colori chiari per la maglia sotto a un maglione o a una giacca. */
  chiari: string[];
  /** Colori che danno carattere all'outfit. */
  accenti: string[];
  /** Colori scuri per le scarpe. */
  scarpe: string[];
}

const PER_STAGIONE: Record<Stagione, Palette> = {
  inverno: {
    neutri: ['blu navy', 'antracite', 'cammello', 'grigio'],
    chiari: ['bianco', 'panna', 'grigio chiaro'],
    accenti: ['bordeaux', 'verde bosco', 'petrolio', 'senape'],
    scarpe: ['nero', 'marrone'],
  },
  primavera: {
    neutri: ['beige', 'blu navy', 'grigio chiaro', 'sabbia'],
    chiari: ['bianco', 'celeste', 'panna'],
    accenti: ['verde salvia', 'celeste', 'rosa cipria', 'lilla'],
    scarpe: ['bianco', 'cammello'],
  },
  estate: {
    neutri: ['sabbia', 'bianco', 'beige', 'blu navy'],
    chiari: ['bianco', 'sabbia', 'celeste'],
    accenti: ['azzurro', 'corallo', 'giallo', 'verde salvia'],
    scarpe: ['bianco', 'cammello'],
  },
  autunno: {
    neutri: ['marrone', 'cammello', 'blu navy', 'antracite'],
    chiari: ['panna', 'bianco', 'sabbia'],
    accenti: ['ruggine', 'verde oliva', 'senape', 'bordeaux'],
    scarpe: ['marrone', 'nero'],
  },
};

const PER_OCCASIONE: Partial<Record<Occasione, Partial<Palette>>> = {
  elegante: {
    neutri: ['nero', 'blu navy', 'antracite'],
    chiari: ['bianco', 'panna'],
    accenti: ['bordeaux', 'petrolio', 'verde bosco', 'nero'],
    scarpe: ['nero'],
  },
  lavoro: {
    neutri: ['blu navy', 'grigio', 'cammello', 'antracite'],
    chiari: ['bianco', 'celeste', 'panna'],
  },
  sport: {
    neutri: ['nero', 'antracite', 'grigio'],
    chiari: ['bianco', 'grigio chiaro'],
    accenti: ['blu', 'corallo', 'verde salvia', 'nero'],
    scarpe: ['bianco', 'grigio'],
  },
};

function inHex(nomi: string[]): string[] {
  return nomi.map((n) => colorePerNome(n).hex);
}

export function palette(stagione: Stagione, occasione: Occasione): Palette {
  const p = { ...PER_STAGIONE[stagione], ...PER_OCCASIONE[occasione] };
  return { neutri: inHex(p.neutri), chiari: inHex(p.chiari), accenti: inHex(p.accenti), scarpe: inHex(p.scarpe) };
}
