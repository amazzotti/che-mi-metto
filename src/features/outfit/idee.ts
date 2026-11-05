/**
 * Più idee di outfit per la stessa giornata, diverse tra loro.
 *
 * Il motore produce molte varianti; da queste ne scegliamo poche che si somiglino il meno possibile
 * (somiglianza di Jaccard tra gli insiemi di capi e colori), così le proposte non sono quasi uguali.
 */
import { categoria } from './catalogo';
import { eNeutro } from './colori';
import { type Outfit, proponiOutfit, type RichiestaOutfit } from './motore';

export interface Idea {
  chiave: string;
  titolo: string;
  outfit: Outfit;
}

/** Varianti esaminate per ogni gruppo di idee. */
const VARIANTI_PER_GRUPPO = 9;

function firma(o: Outfit): Set<string> {
  return new Set(o.pezzi.flatMap((p) => [p.categoria as string, `${p.slot}:${p.colore}:${p.fantasia ?? ''}`]));
}

/** Somiglianza di Jaccard: 1 = identici, 0 = niente in comune. */
export function somiglianza(a: Set<string>, b: Set<string>): number {
  let comuni = 0;
  for (const x of a) if (b.has(x)) comuni++;
  const unione = a.size + b.size - comuni;
  return unione === 0 ? 1 : comuni / unione;
}

const media = (valori: number[]) => valori.reduce((s, x) => s + x, 0) / Math.max(1, valori.length);
const formalita = (o: Outfit) => media(o.pezzi.map((p) => categoria(p.categoria).formalita));
const accesi = (o: Outfit) => o.pezzi.filter((p) => !eNeutro(p.colore)).length;

/** Un titolo breve che dica in cosa l'idea è diversa dalla prima. */
function titolo(o: Outfit, prima: Outfit | undefined): string {
  if (!prima) return 'La più adatta';
  const intero = o.pezzi.find((p) => p.slot === 'intero');
  if (intero && !prima.pezzi.some((p) => p.slot === 'intero')) return `Con ${intero.nome.toLowerCase()}`;
  if (o.pezzi.some((p) => p.fantasia) && !prima.pezzi.some((p) => p.fantasia)) return 'Con fantasia';
  const df = formalita(o) - formalita(prima);
  if (df >= 0.4) return 'Più elegante';
  if (df <= -0.4) return 'Più comoda';
  if (accesi(o) > accesi(prima)) return 'Più colorata';
  if (accesi(o) < accesi(prima)) return 'Più sobria';
  return 'Alternativa';
}

/**
 * Restituisce fino a `quante` idee per il gruppo indicato ("Altre idee" passa al gruppo successivo).
 * La prima idea del primo gruppo è sempre la proposta principale del motore.
 */
export function proponiIdee(r: Omit<RichiestaOutfit, 'variante'>, gruppo = 0, quante = 3): Idea[] {
  const inizio = gruppo * VARIANTI_PER_GRUPPO;
  const candidati = Array.from({ length: VARIANTI_PER_GRUPPO }, (_, i) => {
    const variante = inizio + i;
    const outfit = proponiOutfit({ ...r, variante });
    return { variante, outfit, firma: firma(outfit) };
  });

  const scelte = [candidati[0]];
  while (scelte.length < quante) {
    let migliore: (typeof candidati)[number] | undefined;
    let diversita = 0;
    for (const c of candidati) {
      if (scelte.includes(c)) continue;
      // Quanto è diversa dall'idea più simile già scelta.
      const d = Math.min(...scelte.map((s) => 1 - somiglianza(c.firma, s.firma)));
      if (d > diversita + 1e-9) {
        diversita = d;
        migliore = c;
      }
    }
    // Con un armadio piccolo le combinazioni possibili possono finire prima.
    if (!migliore) break;
    scelte.push(migliore);
  }

  const titoli = new Set<string>();
  return scelte.map((c, i) => {
    let t = titolo(c.outfit, i === 0 ? undefined : scelte[0].outfit);
    if (gruppo > 0 && i === 0) t = 'Nuova idea';
    while (titoli.has(t)) t = t === 'Alternativa' ? 'Altra alternativa' : 'Alternativa';
    titoli.add(t);
    return { chiave: `${gruppo}-${c.variante}`, titolo: t, outfit: c.outfit };
  });
}
