/**
 * Motore degli outfit: regole semplici e deterministiche, quindi facili da testare.
 *
 * 1. Dalla temperatura percepita (corretta per chi è freddoloso o caloroso) si ricava una fascia climatica.
 * 2. La fascia dice quali capi sono adatti per ogni "slot" (sopra, strato, capospalla, sotto, scarpe...).
 * 3. L'occasione ordina i capi per preferenza (palestra, lavoro, uscita elegante...).
 * 4. Pioggia, neve, vento, sole e sbalzi di temperatura aggiungono correzioni e accessori.
 * 5. Se l'armadio contiene capi adatti si usano quelli, scegliendo colori che stanno bene insieme;
 *    altrimenti si propone un capo generico con un colore della palette di stagione.
 */
import type { Capo, Genere, Occasione, Sensibilita } from '../../shared/tipi';
import type { Condizioni } from '../meteo/condizioni';
import { piove } from '../meteo/condizioni';
import { infoStagione } from '../meteo/stagione';
import type { CategoriaId, Slot } from './catalogo';
import { categoria } from './catalogo';
import { armonia, colorePerNome, nomeColore } from './colori';
import { descriviColore, type Fantasia, fantasiePossibili, secondoColore } from './fantasie';
import { palette } from './palette';

export type Fascia = 'gelo' | 'freddo' | 'fresco' | 'mite' | 'tiepido' | 'caldo' | 'torrido';

export const DESCRIZIONE_FASCIA: Record<Fascia, string> = {
  gelo: 'fa molto freddo, copriti bene',
  freddo: 'fa freddo: maglione e cappotto',
  fresco: 'è fresco: serve una giacca',
  mite: 'clima mite, bastano strati leggeri',
  tiepido: 'si sta bene, anche a maniche corte',
  caldo: 'fa caldo: tessuti leggeri',
  torrido: 'fa molto caldo: tessuti naturali e colori chiari',
};

export function temperaturaEffettiva(percepita: number, sensibilita: Sensibilita): number {
  if (sensibilita === 'freddoloso') return percepita - 3;
  if (sensibilita === 'caloroso') return percepita + 3;
  return percepita;
}

export function fascia(t: number): Fascia {
  if (t < 3) return 'gelo';
  if (t < 9) return 'freddo';
  if (t < 15) return 'fresco';
  if (t < 20) return 'mite';
  if (t < 25) return 'tiepido';
  if (t < 30) return 'caldo';
  return 'torrido';
}

type SlotVestito = Exclude<Slot, 'accessorio'>;
type Tabella = Record<SlotVestito, CategoriaId[]>;

/** Capi adatti a ogni fascia climatica. */
const PER_FASCIA: Record<Fascia, Tabella> = {
  gelo: {
    base: ['maglia', 'dolcevita', 'camicia', 'blusa', 'maglia-tecnica'],
    strato: ['maglione', 'felpa', 'cardigan', 'maglioncino'],
    capospalla: ['piumino', 'cappotto'],
    sotto: ['jeans', 'chino', 'pantaloni-eleganti', 'pantaloni-tuta', 'leggings', 'gonna-lunga'],
    intero: ['vestito'],
    scarpe: ['stivali', 'stivaletti', 'sneakers', 'scarpe-eleganti', 'running', 'mocassini', 'decollete'],
  },
  freddo: {
    base: ['maglia', 'dolcevita', 'camicia', 'blusa', 'tshirt', 'polo', 'maglia-tecnica'],
    strato: ['maglione', 'maglioncino', 'felpa', 'cardigan'],
    capospalla: ['cappotto', 'piumino', 'giubbotto', 'trench'],
    sotto: ['jeans', 'chino', 'pantaloni-eleganti', 'pantaloni-tuta', 'leggings', 'gonna-lunga', 'gonna'],
    intero: ['vestito'],
    scarpe: ['stivali', 'stivaletti', 'sneakers', 'scarpe-eleganti', 'mocassini', 'decollete', 'running'],
  },
  fresco: {
    base: ['camicia', 'maglia', 'dolcevita', 'tshirt', 'polo', 'blusa', 'top', 'maglia-tecnica'],
    strato: ['maglioncino', 'cardigan', 'felpa', 'maglione'],
    capospalla: ['trench', 'giubbotto', 'giacca-jeans', 'blazer', 'impermeabile', 'cappotto'],
    sotto: ['jeans', 'chino', 'pantaloni-eleganti', 'gonna', 'gonna-lunga', 'leggings', 'pantaloni-tuta'],
    intero: ['vestito'],
    scarpe: ['sneakers', 'stivaletti', 'stivali', 'mocassini', 'scarpe-eleganti', 'decollete', 'ballerine', 'running'],
  },
  mite: {
    base: ['tshirt', 'camicia', 'polo', 'blusa', 'maglia', 'top', 'maglia-tecnica', 'camicia-lino', 'dolcevita'],
    strato: ['maglioncino', 'cardigan', 'felpa'],
    capospalla: ['giacca-jeans', 'blazer', 'trench', 'giubbotto', 'impermeabile'],
    sotto: ['jeans', 'chino', 'pantaloni-eleganti', 'pantaloni-lino', 'gonna', 'gonna-lunga', 'leggings', 'pantaloni-tuta'],
    intero: ['vestito', 'vestito-estivo'],
    scarpe: ['sneakers', 'mocassini', 'ballerine', 'stivaletti', 'decollete', 'scarpe-eleganti', 'running'],
  },
  tiepido: {
    base: ['tshirt', 'polo', 'camicia', 'camicia-lino', 'blusa', 'top', 'maglia-tecnica', 'canotta'],
    strato: ['cardigan', 'maglioncino'],
    capospalla: ['blazer', 'giacca-jeans', 'impermeabile'],
    sotto: ['chino', 'jeans', 'pantaloni-lino', 'pantaloni-eleganti', 'gonna', 'gonna-lunga', 'shorts', 'pantaloncini-sport', 'leggings'],
    intero: ['vestito-estivo', 'vestito'],
    scarpe: ['sneakers', 'mocassini', 'sandali', 'ballerine', 'decollete', 'scarpe-eleganti', 'running'],
  },
  caldo: {
    base: ['tshirt', 'polo', 'camicia-lino', 'top', 'canotta', 'blusa', 'maglia-tecnica', 'camicia'],
    strato: [],
    capospalla: ['blazer'],
    sotto: ['shorts', 'pantaloni-lino', 'gonna', 'gonna-lunga', 'chino', 'pantaloncini-sport', 'pantaloni-eleganti'],
    intero: ['vestito-estivo', 'vestito'],
    scarpe: ['sandali', 'sneakers', 'mocassini', 'ballerine', 'decollete', 'scarpe-eleganti', 'running'],
  },
  torrido: {
    base: ['canotta', 'tshirt', 'top', 'camicia-lino', 'polo', 'maglia-tecnica', 'blusa', 'camicia'],
    strato: [],
    capospalla: [],
    sotto: ['shorts', 'pantaloni-lino', 'gonna', 'gonna-lunga', 'pantaloncini-sport', 'pantaloni-eleganti'],
    intero: ['vestito-estivo', 'vestito'],
    scarpe: ['sandali', 'sneakers', 'mocassini', 'ballerine', 'decollete', 'scarpe-eleganti', 'running'],
  },
};

/** Preferenze per occasione: l'ordine conta (il primo è il più adatto). */
const PER_OCCASIONE: Record<Occasione, Tabella> = {
  casual: {
    base: ['tshirt', 'maglia', 'camicia', 'polo', 'top', 'canotta', 'camicia-lino', 'blusa', 'dolcevita'],
    strato: ['felpa', 'maglione', 'cardigan', 'maglioncino'],
    capospalla: ['giacca-jeans', 'giubbotto', 'piumino', 'impermeabile', 'trench', 'cappotto', 'blazer'],
    sotto: ['jeans', 'chino', 'shorts', 'gonna', 'pantaloni-lino', 'gonna-lunga', 'leggings'],
    intero: ['vestito-estivo', 'vestito'],
    scarpe: ['sneakers', 'stivaletti', 'sandali', 'ballerine', 'mocassini', 'stivali'],
  },
  lavoro: {
    base: ['camicia', 'blusa', 'polo', 'dolcevita', 'maglia', 'camicia-lino'],
    strato: ['maglioncino', 'cardigan', 'maglione'],
    capospalla: ['blazer', 'cappotto', 'trench', 'piumino', 'impermeabile'],
    sotto: ['chino', 'pantaloni-eleganti', 'jeans', 'gonna-lunga', 'gonna', 'pantaloni-lino'],
    intero: ['vestito'],
    scarpe: ['mocassini', 'scarpe-eleganti', 'stivaletti', 'ballerine', 'decollete', 'sneakers', 'stivali'],
  },
  appuntamento: {
    base: ['camicia', 'blusa', 'top', 'dolcevita', 'polo', 'maglia', 'camicia-lino', 'tshirt'],
    strato: ['maglioncino', 'cardigan', 'maglione'],
    capospalla: ['giubbotto', 'blazer', 'trench', 'cappotto', 'giacca-jeans'],
    sotto: ['jeans', 'chino', 'gonna', 'gonna-lunga', 'pantaloni-eleganti', 'pantaloni-lino'],
    intero: ['vestito', 'vestito-estivo'],
    scarpe: ['stivaletti', 'mocassini', 'decollete', 'stivali', 'sneakers', 'sandali', 'ballerine'],
  },
  aperitivo: {
    base: ['camicia', 'top', 'polo', 'camicia-lino', 'blusa', 'tshirt'],
    strato: ['maglioncino', 'cardigan'],
    capospalla: ['giubbotto', 'blazer', 'giacca-jeans', 'trench', 'cappotto'],
    sotto: ['jeans', 'chino', 'gonna', 'pantaloni-lino', 'shorts', 'gonna-lunga'],
    intero: ['vestito-estivo', 'vestito'],
    scarpe: ['mocassini', 'sneakers', 'sandali', 'stivaletti', 'decollete', 'ballerine'],
  },
  elegante: {
    base: ['camicia', 'blusa', 'top', 'dolcevita'],
    strato: ['maglioncino', 'cardigan'],
    capospalla: ['blazer', 'cappotto', 'trench'],
    sotto: ['pantaloni-eleganti', 'gonna-lunga', 'gonna'],
    intero: ['vestito'],
    scarpe: ['scarpe-eleganti', 'decollete', 'stivali', 'stivaletti', 'mocassini', 'sandali'],
  },
  sport: {
    base: ['maglia-tecnica', 'tshirt', 'canotta'],
    strato: ['felpa'],
    capospalla: ['impermeabile', 'piumino', 'giubbotto'],
    sotto: ['pantaloni-tuta', 'leggings', 'pantaloncini-sport'],
    intero: [],
    scarpe: ['running', 'sneakers'],
  },
};

export interface Pezzo {
  slot: Slot;
  categoria: CategoriaId;
  nome: string;
  colore: string;
  fantasia?: Fantasia;
  colore2?: string;
  /** Descrizione del colore, es. "bianco a righe blu navy". */
  nomeColore: string;
  /** Il capo dell'armadio scelto, se c'è. */
  capo?: Capo;
  /** Nell'armadio non c'è niente di adatto: è un suggerimento d'acquisto. */
  mancante?: boolean;
  nota?: string;
}

export interface Outfit {
  pezzi: Pezzo[];
  accessori: Pezzo[];
  motivi: string[];
  daPortare: string[];
  fascia: Fascia;
  /** Temperatura usata per decidere, già corretta per la sensibilità al freddo. */
  temperatura: number;
  dalTuoArmadio: number;
  mancanti: Pezzo[];
}

export interface RichiestaOutfit {
  condizioni: Condizioni;
  genere: Genere;
  sensibilita: Sensibilita;
  occasione: Occasione;
  /** Giorno "AAAA-MM-GG", per la stagione. */
  data: string;
  latitudine: number;
  /** Cambia per ottenere un'altra idea ("Altra idea"). */
  variante?: number;
  armadio?: Capo[];
}

function perGenere(ids: CategoriaId[], genere: Genere): CategoriaId[] {
  return ids.filter((id) => categoria(id).generi.includes(genere));
}

/** Candidati ordinati per uno slot: preferenze dell'occasione ∩ capi adatti alla fascia. */
export function candidati(slot: SlotVestito, f: Fascia, occasione: Occasione, genere: Genere): CategoriaId[] {
  const adatti = PER_FASCIA[f][slot];
  const preferiti = PER_OCCASIONE[occasione][slot].filter((id) => adatti.includes(id));
  const risultato = perGenere(preferiti, genere);
  if (risultato.length > 0) return risultato;
  // Nessun capo "da occasione" adatto al clima: ripieghiamo su quelli adatti al clima.
  return perGenere(
    adatti.filter((id) => categoria(id).occasioni.includes(occasione)),
    genere,
  );
}

function ruota<T>(lista: T[], variante: number, offset: number): T | undefined {
  if (lista.length === 0) return undefined;
  // La prima proposta usa sempre il capo preferito; le varianti ruotano tra i primi tre.
  if (variante === 0) return lista[0];
  const n = Math.min(lista.length, 3);
  return lista[(variante + offset) % n];
}

function scegliColore(lista: string[], variante: number, evita: string[] = []): string {
  const liberi = lista.filter((c) => !evita.includes(c));
  const fonte = liberi.length > 0 ? liberi : lista;
  return fonte[variante % fonte.length];
}

function coloriDelCapo(capo: Capo): Pick<Pezzo, 'colore' | 'fantasia' | 'colore2' | 'nomeColore'> {
  return {
    colore: capo.colore,
    fantasia: capo.fantasia,
    colore2: capo.colore2,
    nomeColore: descriviColore(capo.colore, capo.fantasia, capo.colore2),
  };
}

function eta(genere: Genere, maschile: string, femminile: string): string {
  return genere === 'donna' ? femminile : maschile;
}

export function proponiOutfit(r: RichiestaOutfit): Outfit {
  const { condizioni: c, genere, occasione } = r;
  const variante = Math.max(0, Math.floor(r.variante ?? 0));
  const t = temperaturaEffettiva(c.percepita, r.sensibilita);
  const f = fascia(t);
  const stagione = infoStagione(r.data, r.latitudine);
  const pal = palette(stagione.stagione, occasione);
  const pioggia = piove(c);
  const neve = c.neve;
  const ventoForte = c.vento >= 30;
  const escursione = c.percepitaMax - c.percepitaMin;
  const sbalzo = escursione >= 8;
  const armadio = r.armadio ?? [];
  const usaArmadio = armadio.length > 0;
  const motivi: string[] = [];
  const daPortare: string[] = [];

  // --- Quali slot servono ---
  const serveStrato = occasione === 'sport' ? t < 16 : t < 12;
  let serveCapospalla = t < 15 || (t < 20 && (pioggia || ventoForte || neve));
  let notaCapospalla: string | undefined;
  if (!serveCapospalla && t < 20 && (c.sera || sbalzo)) {
    serveCapospalla = true;
    notaCapospalla = c.sera ? 'per la sera' : 'da togliere nelle ore calde';
  }
  if (!serveCapospalla && t < 25 && pioggia) {
    serveCapospalla = true;
    notaCapospalla = 'leggera, se piove';
  }
  const stratoFacoltativo = !serveStrato && !serveCapospalla && t < 20 && (sbalzo || c.sera) && occasione !== 'sport';
  // Blazer: per un'uscita elegante (o al lavoro) anche quando non serve per il freddo.
  const blazer =
    !serveCapospalla &&
    ((occasione === 'elegante' && t < 28 && genere === 'uomo') || (occasione === 'elegante' && t < 22) || (occasione === 'lavoro' && t < 24 && genere === 'uomo'));

  // Vestito intero (solo donna): alterniamo con gonna/pantaloni grazie alla variante.
  const interi = genere === 'donna' ? candidati('intero', f, occasione, genere) : [];
  const caldoAperto = f === 'tiepido' || f === 'caldo' || f === 'torrido';
  const preferisciIntero =
    interi.length > 0 &&
    ((occasione === 'elegante' && variante % 2 === 0) ||
      ((occasione === 'appuntamento' || occasione === 'aperitivo') && variante % 2 === 1) ||
      (occasione === 'casual' && caldoAperto && variante % 3 === 2));

  // --- Scelta dei capi ---
  const pezzi: Pezzo[] = [];
  const coloriScelti = () => pezzi.map((p) => p.colore);

  const dallArmadio = (slot: SlotVestito, ordine: CategoriaId[], offset: number): Capo | undefined => {
    const adatti = armadio.filter((capo) => ordine.includes(capo.categoria) && capo.occasioni.includes(occasione));
    if (adatti.length === 0) return undefined;
    const punteggio = (capo: Capo) => {
      let p = 10 - ordine.indexOf(capo.categoria) * 0.6;
      if (pioggia && (slot === 'capospalla' || slot === 'scarpe')) {
        if (capo.impermeabile || categoria(capo.categoria).pioggia) p += 3;
        else if (slot === 'scarpe') p -= 2;
      }
      const altri = coloriScelti();
      if (altri.length > 0) p += (4 * altri.reduce((s, x) => s + armonia(x, capo.colore), 0)) / altri.length;
      return p;
    };
    const ordinati = [...adatti].sort((a, b) => punteggio(b) - punteggio(a) || a.creato - b.creato);
    return ruota(ordinati, variante, offset);
  };

  const coloreGenerico = (slot: SlotVestito, id: CategoriaId, offset: number): string => {
    const tipico = categoria(id).coloreTipico;
    if (tipico) return tipico;
    const v = variante + offset;
    const usati = coloriScelti();
    switch (slot) {
      case 'sotto':
        return scegliColore(pal.neutri, v, usati);
      case 'capospalla':
        return scegliColore(pal.neutri, v + 1, usati);
      case 'strato':
      case 'intero':
        return scegliColore(pal.accenti, v, usati);
      case 'base': {
        const coperta = pezzi.some((p) => p.slot === 'strato' || p.slot === 'capospalla');
        return coperta || occasione === 'elegante' || occasione === 'lavoro'
          ? scegliColore(pal.chiari, v, usati)
          : scegliColore(pal.accenti, v, usati);
      }
      case 'scarpe':
        // Le sneakers stanno bene bianche con tutto; quelle da palestra seguono la palette sportiva.
        if (id === 'sneakers') return colorePerNome('bianco').hex;
        if (id === 'running') return scegliColore(pal.scarpe, v);
        return scegliColore(pal.scarpe.filter((x) => x !== '#ffffff'), v);
    }
  };

  const aggiungi = (slot: SlotVestito, offset: number, nota?: string, filtro?: (id: CategoriaId) => boolean) => {
    // Niente "total denim": giacca di jeans e jeans insieme non li proponiamo.
    const conJeans = pezzi.some((p) => p.categoria === 'jeans');
    let ordine = candidati(slot, f, occasione, genere).filter((id) => !(conJeans && id === 'giacca-jeans'));
    if (filtro) {
      const filtrati = ordine.filter(filtro);
      if (filtrati.length > 0) ordine = filtrati;
    }
    if (ordine.length === 0) return;
    if (usaArmadio) {
      const capo = dallArmadio(slot, ordine, offset);
      if (capo) {
        pezzi.push({
          slot,
          categoria: capo.categoria,
          nome: capo.nome || categoria(capo.categoria).nome,
          ...coloriDelCapo(capo),
          capo,
          nota,
        });
        return;
      }
    }
    const id = ruota(ordine, variante, offset)!;
    const colore = coloreGenerico(slot, id, offset);
    pezzi.push({
      slot,
      categoria: id,
      nome: categoria(id).nome,
      colore,
      nomeColore: nomeColore(colore),
      mancante: usaArmadio || undefined,
      nota,
    });
  };

  const pioggiaPrima = (id: CategoriaId) => Boolean(categoria(id).pioggia);
  const filtroScarpe = (id: CategoriaId) => {
    if (neve) return id === 'stivali' || id === 'stivaletti';
    if (pioggia) return Boolean(categoria(id).pioggia);
    return true;
  };

  // L'ordine conta per l'armonia dei colori: prima la parte di sotto, poi il resto.
  let intero = false;
  if (preferisciIntero) {
    const vestitiArmadio = armadio.filter((x) => interi.includes(x.categoria) && x.occasioni.includes(occasione));
    const sottoArmadio = armadio.filter(
      (x) => candidati('sotto', f, occasione, genere).includes(x.categoria) && x.occasioni.includes(occasione),
    );
    intero = !usaArmadio || vestitiArmadio.length > 0 || sottoArmadio.length === 0;
  }
  if (intero) {
    aggiungi('intero', 0, f === 'gelo' || f === 'freddo' ? 'con collant pesanti' : undefined);
  } else {
    aggiungi('sotto', 0);
  }
  if (serveCapospalla) aggiungi('capospalla', 1, notaCapospalla, pioggia || neve ? pioggiaPrima : undefined);
  else if (blazer) aggiungi('capospalla', 1, undefined, (id) => id === 'blazer');
  if (serveStrato) aggiungi('strato', 2);
  else if (stratoFacoltativo) aggiungi('strato', 2, c.sera ? 'per la sera' : 'per la mattina e la sera');
  if (!intero) aggiungi('base', 0);
  aggiungi('scarpe', 1, undefined, filtroScarpe);

  // --- Accessori ---
  const accessori: Pezzo[] = [];
  const accessorio = (id: CategoriaId, colore: string, nota?: string) => {
    const mio = armadio.find((x) => x.categoria === id);
    accessori.push(
      mio
        ? { slot: 'accessorio', categoria: id, nome: mio.nome || categoria(id).nome, ...coloriDelCapo(mio), capo: mio, nota }
        : { slot: 'accessorio', categoria: id, nome: categoria(id).nome, colore, nomeColore: nomeColore(colore), nota },
    );
  };
  const accento = pal.accenti[variante % pal.accenti.length];
  if (t < 10) accessorio('sciarpa', accento);
  if (t < 5) accessorio('berretto', pal.neutri[0]);
  if (t < 3) accessorio('guanti', pal.neutri[0]);
  if (pioggia || (neve && t >= 0)) accessorio('ombrello', pal.neutri[0]);
  const sole = c.uv >= 6 || (c.codice <= 1 && t >= 22);
  if (sole) accessorio('occhiali', categoria('occhiali').coloreTipico!);
  if (t >= 25 && c.uv >= 5 && (occasione === 'casual' || occasione === 'sport')) accessorio('cappellino', pal.chiari[0]);
  if (occasione === 'sport') accessorio('borsa-sport', pal.neutri[0]);
  else if (genere === 'donna') accessorio('borsa', occasione === 'elegante' ? pal.neutri[0] : pal.neutri[(variante + 2) % pal.neutri.length]);

  // --- Un tocco di fantasia ---
  // Al massimo un capo a righe, quadri, pois o fiori per outfit, scelto tra quelli proposti
  // (i tuoi capi restano come sono). Ogni tre idee una è tutta in tinta unita.
  const haGiaFantasia = [...pezzi, ...accessori].some((p) => p.fantasia && p.fantasia !== 'unita');
  if (!haGiaFantasia && variante % 3 !== 2) {
    const ordine: Slot[] = ['intero', 'base', 'sotto', 'strato', 'accessorio'];
    const generici = ordine.flatMap((s) => [...pezzi, ...accessori].filter((p) => p.slot === s && !p.capo));
    for (const p of generici) {
      const possibili = fantasiePossibili(p.categoria, stagione.stagione, occasione);
      if (possibili.length === 0) continue;
      p.fantasia = possibili[variante % possibili.length];
      p.colore2 = secondoColore(p.colore, pal, variante);
      p.nomeColore = descriviColore(p.colore, p.fantasia, p.colore2);
      break;
    }
  }

  if (occasione === 'sport') {
    daPortare.push(
      t >= 20 ? 'Canotta o maglia tecnica di ricambio' : 'Maglia tecnica di ricambio',
      'Asciugamano',
      'Borraccia',
      'Ciabatte e bagnoschiuma',
    );
  }

  // --- Spiegazione ---
  const gradi = Math.round(c.percepita);
  motivi.push(`Percepiti ${gradi}°: ${DESCRIZIONE_FASCIA[f]}.`);
  if (r.sensibilita === 'freddoloso') motivi.push(`Sei ${eta(genere, 'freddoloso', 'freddolosa')}: ho considerato 3° in meno.`);
  if (r.sensibilita === 'caloroso') motivi.push(`Soffri il caldo: ho considerato 3° in più.`);
  if (neve) motivi.push('Neve prevista: stivali e capospalla caldo.');
  else if (pioggia) motivi.push(`Pioggia probabile (${Math.round(c.probPioggia)}%): capi che riparano, scarpe chiuse e ombrello.`);
  if (ventoForte) motivi.push(`Vento fino a ${Math.round(c.vento)} km/h: meglio una giacca che ripari.`);
  if (sbalzo) motivi.push(`Sbalzo di ${Math.round(escursione)}° nella giornata: vestiti a strati.`);
  if (sole && t >= 15) motivi.push(`Sole${c.uv >= 6 ? ` e UV alto (${Math.round(c.uv)})` : ''}: occhiali da sole.`);
  motivi.push(`${stagione.etichetta}: via libera a ${stagione.tessuti}.`);

  return {
    pezzi,
    accessori,
    motivi,
    daPortare,
    fascia: f,
    temperatura: t,
    dalTuoArmadio: pezzi.filter((p) => p.capo).length + accessori.filter((p) => p.capo).length,
    mancanti: pezzi.filter((p) => p.mancante),
  };
}
