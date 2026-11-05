/**
 * Più idee di outfit per la stessa giornata, diverse tra loro.
 *
 * Il motore produce molte varianti; da queste ne scegliamo poche che si somiglino il meno possibile
 * (somiglianza di Jaccard tra gli insiemi di capi e colori), così le proposte non sono quasi uguali.
 */
import { categoria, type Slot } from './catalogo';
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
/** Le parti dell'outfit che si notano di più, in ordine. */
const IN_VISTA: Slot[] = ['intero', 'sotto', 'capospalla', 'strato', 'base', 'scarpe'];

const conMinuscola = (nome: string) => `Con ${nome.charAt(0).toLowerCase()}${nome.slice(1)}`;

/** Un titolo breve che dica in cosa l'idea è diversa dalla prima (o, se è la prima di un gruppo, che capo la caratterizza). */
function titolo(o: Outfit, prima: Outfit | undefined, primaDelGruppo: boolean): string {
  if (!prima) {
    if (!primaDelGruppo) return 'La più adatta';
    const protagonista = IN_VISTA.map((s) => o.pezzi.find((p) => p.slot === s && !p.bloccato)).find(Boolean);
    return protagonista ? conMinuscola(protagonista.nome) : 'Nuova idea';
  }
  const df = formalita(o) - formalita(prima);
  if (df >= 0.6) return 'Più elegante';
  if (df <= -0.6) return 'Più comoda';
  // Il primo capo "in vista" che cambia rispetto alla prima idea dà il nome all'idea.
  for (const slot of IN_VISTA) {
    const p = o.pezzi.find((x) => x.slot === slot && !x.bloccato);
    const q = prima.pezzi.find((x) => x.slot === slot);
    if (p && (!q || q.categoria !== p.categoria || (q.modello ?? 0) !== (p.modello ?? 0))) return conMinuscola(p.nome);
  }
  if (o.pezzi.some((p) => p.fantasia) && !prima.pezzi.some((p) => p.fantasia)) return 'Con fantasia';
  if (accesi(o) > accesi(prima)) return 'Più colorata';
  if (accesi(o) < accesi(prima)) return 'Più sobria';
  return 'Alternativa';
}

/**
 * Un numero che cambia ogni giorno (e per ogni occasione) ma resta uguale per tutto il giorno:
 * così le proposte variano da un giorno all'altro senza cambiare a ogni apertura dell'app.
 */
export function semeDelGiorno(data: string, occasione: string): number {
  let h = Math.floor(Date.parse(`${data}T12:00:00Z`) / 86_400_000);
  for (const lettera of occasione) h = (h * 31 + lettera.charCodeAt(0)) % 1_000_003;
  return h % VARIANTI_PER_GRUPPO;
}

/**
 * Restituisce fino a `quante` idee per il gruppo indicato ("Altre idee" passa al gruppo successivo).
 * La prima idea del primo gruppo è sempre la proposta principale del motore.
 */
export function proponiIdee(r: Omit<RichiestaOutfit, 'variante'>, gruppo = 0, quante = 3): Idea[] {
  const inizio = gruppo * VARIANTI_PER_GRUPPO + semeDelGiorno(r.data, r.occasione);
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
    let t = titolo(c.outfit, i === 0 ? undefined : scelte[0].outfit, gruppo > 0);
    while (titoli.has(t)) t = t === 'Alternativa' ? 'Altra alternativa' : 'Alternativa';
    titoli.add(t);
    return { chiave: `${gruppo}-${c.variante}`, titolo: t, outfit: c.outfit };
  });
}
