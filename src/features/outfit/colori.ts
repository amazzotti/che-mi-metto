/** Colori con nome italiano: servono per dare un nome al colore di un capo e per le palette. */
export interface ColoreNominato {
  nome: string;
  hex: string;
  neutro: boolean;
}

export const COLORI: ColoreNominato[] = [
  { nome: 'bianco', hex: '#ffffff', neutro: true },
  { nome: 'panna', hex: '#efe8dc', neutro: true },
  { nome: 'sabbia', hex: '#e3d3b5', neutro: true },
  { nome: 'beige', hex: '#d2bc98', neutro: true },
  { nome: 'cammello', hex: '#c19a6b', neutro: true },
  { nome: 'marrone', hex: '#6b4a32', neutro: true },
  { nome: 'grigio chiaro', hex: '#c9c9c9', neutro: true },
  { nome: 'grigio', hex: '#8a8f98', neutro: true },
  { nome: 'antracite', hex: '#3a3d42', neutro: true },
  { nome: 'nero', hex: '#151515', neutro: true },
  { nome: 'blu navy', hex: '#1f2a44', neutro: true },
  { nome: 'denim', hex: '#4a6b8a', neutro: true },
  { nome: 'blu', hex: '#2f56a6', neutro: false },
  { nome: 'azzurro', hex: '#7fb2e5', neutro: false },
  { nome: 'celeste', hex: '#b9d7f0', neutro: false },
  { nome: 'petrolio', hex: '#1f5f6b', neutro: false },
  { nome: 'verde salvia', hex: '#9db8a0', neutro: false },
  { nome: 'verde oliva', hex: '#6b7b3a', neutro: false },
  { nome: 'verde bosco', hex: '#2f5d50', neutro: false },
  { nome: 'giallo', hex: '#f2c94c', neutro: false },
  { nome: 'senape', hex: '#c9971c', neutro: false },
  { nome: 'arancione', hex: '#ef8a3c', neutro: false },
  { nome: 'ruggine', hex: '#a0522d', neutro: false },
  { nome: 'corallo', hex: '#f08a6c', neutro: false },
  { nome: 'rosso', hex: '#c0392b', neutro: false },
  { nome: 'bordeaux', hex: '#6d1a2c', neutro: false },
  { nome: 'rosa', hex: '#f4b6c2', neutro: false },
  { nome: 'rosa cipria', hex: '#e6c2b8', neutro: false },
  { nome: 'lilla', hex: '#b8a2d6', neutro: false },
  { nome: 'viola', hex: '#6c3f8f', neutro: false },
];

export function colorePerNome(nome: string): ColoreNominato {
  const c = COLORI.find((x) => x.nome === nome);
  if (!c) throw new Error(`Colore sconosciuto: ${nome}`);
  return c;
}

export type Rgb = [number, number, number];

export function hexInRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  const pieno = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = Number.parseInt(pieno, 16);
  if (pieno.length !== 6 || Number.isNaN(n)) throw new Error(`Colore non valido: ${hex}`);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbInHex([r, g, b]: Rgb): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

/** Distanza percettiva semplice ("redmean"): basta per scegliere il nome più vicino. */
export function distanza(a: Rgb, b: Rgb): number {
  const rm = (a[0] + b[0]) / 2;
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

export function coloreVicino(hex: string): ColoreNominato {
  const rgb = hexInRgb(hex);
  let migliore = COLORI[0];
  let dMin = Infinity;
  for (const c of COLORI) {
    const d = distanza(rgb, hexInRgb(c.hex));
    if (d < dMin) {
      dMin = d;
      migliore = c;
    }
  }
  return migliore;
}

export function nomeColore(hex: string): string {
  return coloreVicino(hex).nome;
}

/** Tonalità (0-360), saturazione e luminosità (0-1). */
export function hsl(hex: string): { h: number; s: number; l: number } {
  const [r, g, b] = hexInRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
}

export function eNeutro(hex: string): boolean {
  const { s, l } = hsl(hex);
  if (s < 0.15 || l < 0.13 || l > 0.93) return true;
  return coloreVicino(hex).neutro;
}

/**
 * Quanto stanno bene due colori insieme, da 0 a 1.
 * I neutri vanno con tutto; tra due colori accesi premiamo analoghi e complementari.
 */
export function armonia(a: string, b: string): number {
  if (eNeutro(a) || eNeutro(b)) return 1;
  const ha = hsl(a).h;
  const hb = hsl(b).h;
  const diff = Math.abs(ha - hb);
  const d = Math.min(diff, 360 - diff);
  if (d <= 35) return 0.8;
  if (d >= 130) return 0.7;
  return 0.3;
}

/** Armonia media di un insieme di colori; troppi colori accesi insieme abbassano il voto. */
export function armoniaInsieme(colori: string[]): number {
  if (colori.length < 2) return 1;
  let somma = 0;
  let coppie = 0;
  for (let i = 0; i < colori.length; i++) {
    for (let j = i + 1; j < colori.length; j++) {
      somma += armonia(colori[i], colori[j]);
      coppie++;
    }
  }
  const accesi = colori.filter((c) => !eNeutro(c)).length;
  const penalita = accesi > 2 ? 0.15 * (accesi - 2) : 0;
  return Math.max(0, somma / coppie - penalita);
}

/** Scurisce (fattore < 1) o schiarisce (fattore > 1) un colore: serve per bordi e ombre delle sagome. */
export function sfuma(hex: string, fattore: number): string {
  const rgb = hexInRgb(hex);
  if (fattore <= 1) return rgbInHex(rgb.map((v) => v * fattore) as Rgb);
  const t = fattore - 1;
  return rgbInHex(rgb.map((v) => v + (255 - v) * t) as Rgb);
}

/** True se sul colore conviene scrivere/disegnare in scuro. */
export function eChiaro(hex: string): boolean {
  const [r, g, b] = hexInRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

/**
 * Colore dominante di un'immagine a partire dai pixel RGBA.
 * Scarta i pixel trasparenti e lo sfondo quasi bianco, poi raggruppa per "secchi" di colore.
 */
export function coloreDominante(pixel: Uint8ClampedArray | number[]): string | null {
  const secchi = new Map<number, { n: number; r: number; g: number; b: number }>();
  let totale = 0;
  for (let i = 0; i + 3 < pixel.length; i += 4) {
    const r = pixel[i];
    const g = pixel[i + 1];
    const b = pixel[i + 2];
    const a = pixel[i + 3];
    if (a < 128) continue;
    totale++;
    if (r > 235 && g > 235 && b > 235) continue;
    const chiave = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
    const s = secchi.get(chiave) ?? { n: 0, r: 0, g: 0, b: 0 };
    s.n++;
    s.r += r;
    s.g += g;
    s.b += b;
    secchi.set(chiave, s);
  }
  if (totale === 0) return null;
  let migliore: { n: number; r: number; g: number; b: number } | undefined;
  for (const s of secchi.values()) if (!migliore || s.n > migliore.n) migliore = s;
  // Se quasi tutto è bianco, il capo è bianco.
  if (!migliore || migliore.n < totale * 0.05) return '#ffffff';
  return rgbInHex([migliore.r / migliore.n, migliore.g / migliore.n, migliore.b / migliore.n]);
}
