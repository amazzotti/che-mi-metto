/**
 * Valigia per un viaggio: un outfit per ogni giorno con il meteo della destinazione,
 * poi i capi vengono messi insieme e contati (una maglia al giorno, un paio di pantaloni ogni tre...).
 */
import type { Capo, Genere, Occasione, Sensibilita } from '../../shared/tipi';
import type { Condizioni } from '../meteo/condizioni';
import { piove } from '../meteo/condizioni';
import { ORDINE_SLOT, type Slot } from '../outfit/catalogo';
import { type Pezzo, proponiOutfit } from '../outfit/motore';

export interface GiornoViaggio {
  data: string;
  condizioni: Condizioni;
}

export interface VoceValigia {
  chiave: string;
  slot: Slot;
  pezzo: Pezzo;
  quantita: number;
  /** In quali giorni serve (per capire perché c'è). */
  giorni: string[];
}

export interface Valigia {
  giorni: number;
  voci: VoceValigia[];
  essenziali: string[];
  riepilogo: string;
}

interface Opzioni {
  genere: Genere;
  sensibilita: Sensibilita;
  correzione?: number;
  armadio: Capo[];
  latitudine: number;
  /** Occasioni in più durante il viaggio (una cena elegante, la palestra...). */
  extra: Occasione[];
}

/** Quante volte serve un capo, in base a quante volte compare negli outfit. */
export function quantitaPer(slot: Slot, volte: number): number {
  switch (slot) {
    case 'base':
      return Math.min(volte, 7);
    case 'sotto':
    case 'strato':
      return Math.ceil(volte / 3);
    case 'intero':
      return Math.ceil(volte / 2);
    default:
      return 1;
  }
}

export function preparaValigia(giorni: GiornoViaggio[], o: Opzioni): Valigia {
  const outfit: { data: string; pezzi: Pezzo[] }[] = giorni.map((g, i) => {
    const r = proponiOutfit({
      condizioni: g.condizioni,
      genere: o.genere,
      sensibilita: o.sensibilita,
      correzione: o.correzione,
      occasione: 'casual',
      data: g.data,
      latitudine: o.latitudine,
      // Un po' di varietà, ma con i capi che si ripetono: la valigia resta piccola.
      variante: i % 3,
      armadio: o.armadio,
    });
    return { data: g.data, pezzi: [...r.pezzi, ...r.accessori] };
  });
  // Le occasioni in più usano il meteo di metà viaggio.
  const centrale = giorni[Math.floor(giorni.length / 2)];
  for (const occasione of o.extra) {
    if (!centrale) break;
    const r = proponiOutfit({
      condizioni: centrale.condizioni,
      genere: o.genere,
      sensibilita: o.sensibilita,
      correzione: o.correzione,
      occasione,
      data: centrale.data,
      latitudine: o.latitudine,
      armadio: o.armadio,
    });
    outfit.push({ data: centrale.data, pezzi: [...r.pezzi, ...r.accessori] });
  }

  // Stesso capo dell'armadio = stessa voce; i capi generici si raggruppano per tipo.
  const voci = new Map<string, VoceValigia & { volte: number }>();
  for (const { data, pezzi } of outfit) {
    for (const p of pezzi) {
      const chiave = p.capo ? `capo:${p.capo.id}` : `tipo:${p.categoria}`;
      const voce = voci.get(chiave) ?? { chiave, slot: p.slot, pezzo: p, quantita: 0, giorni: [], volte: 0 };
      voce.volte++;
      if (!voce.giorni.includes(data)) voce.giorni.push(data);
      voci.set(chiave, voce);
    }
  }
  const elenco = [...voci.values()]
    .map(({ volte, ...v }) => ({ ...v, quantita: quantitaPer(v.slot, volte) }))
    .sort((a, b) => ORDINE_SLOT.indexOf(a.slot) - ORDINE_SLOT.indexOf(b.slot));

  const n = giorni.length;
  const essenziali = [`Biancheria × ${n}`, `Calze × ${n}`, 'Pigiama', 'Beauty e spazzolino', 'Caricabatterie'];
  if (giorni.some((g) => g.condizioni.temperaturaMax >= 25 || g.condizioni.uv >= 6)) essenziali.push('Crema solare');
  if (n >= 4) essenziali.push('Sacchetto per i panni sporchi');

  const min = Math.round(Math.min(...giorni.map((g) => g.condizioni.temperaturaMin)));
  const max = Math.round(Math.max(...giorni.map((g) => g.condizioni.temperaturaMax)));
  const pioggia = giorni.filter((g) => piove(g.condizioni)).length;
  const riepilogo =
    n === 0
      ? 'Nessun giorno con le previsioni disponibili.'
      : `${n === 1 ? '1 giorno' : `${n} giorni`}, da ${min}° a ${max}°. ${
          pioggia === 0 ? 'Niente pioggia prevista.' : `Pioggia prevista in ${pioggia === 1 ? '1 giorno' : `${pioggia} giorni`}.`
        }`;

  return { giorni: n, voci: elenco, essenziali, riepilogo };
}

/** L'elenco in testo semplice, da mandare o incollare nelle note. */
export function valigiaInTesto(valigia: Valigia, destinazione: string): string {
  const righe = [`Valigia per ${destinazione}`, valigia.riepilogo, ''];
  for (const v of valigia.voci) righe.push(`☐ ${v.pezzo.nome} (${v.pezzo.nomeColore})${v.quantita > 1 ? ` × ${v.quantita}` : ''}`);
  righe.push('');
  for (const e of valigia.essenziali) righe.push(`☐ ${e}`);
  return righe.join('\n');
}
