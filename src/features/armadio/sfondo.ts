/**
 * Rimozione dello sfondo dalle foto dei capi, tutta sul telefono e senza modelli da scaricare.
 *
 * Funziona come la "bacchetta magica" dei programmi di grafica:
 * 1. guarda i pixel lungo i bordi della foto e ne ricava i colori dello sfondo (fino a 4);
 * 2. parte dai bordi e "allaga" i pixel vicini finché il colore resta simile a quello dello sfondo;
 * 3. quello che resta, non raggiungibile dai bordi, è il capo: diventa l'unica parte visibile.
 *
 * Va bene per capi fotografati su un fondo abbastanza uniforme (letto, pavimento, parete),
 * che è il consiglio che danno anche le app di armadio digitale più usate.
 */

type Rgb = [number, number, number];

export interface EsitoSfondo {
  /** Pixel RGBA del capo ritagliato, sfondo trasparente. */
  pixel: Uint8ClampedArray<ArrayBuffer>;
  larghezza: number;
  altezza: number;
  /** Quanta parte della foto originale era il capo (0-1). */
  quotaCapo: number;
}

function distanza(a: Rgb, b: Rgb): number {
  const rm = (a[0] + b[0]) / 2;
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

/** Indici dei pixel lungo i bordi (spessore di 2 pixel). */
function indiciBordo(w: number, h: number): number[] {
  const indici: number[] = [];
  for (let x = 0; x < w; x++) for (const y of [0, 1, h - 2, h - 1]) if (y >= 0 && y < h) indici.push(y * w + x);
  for (let y = 2; y < h - 2; y++) for (const x of [0, 1, w - 2, w - 1]) if (x >= 0 && x < w) indici.push(y * w + x);
  return indici;
}

/** I colori più frequenti lungo i bordi: sono lo sfondo. */
export function coloriSfondo(pixel: ArrayLike<number>, w: number, h: number): Rgb[] {
  const secchi = new Map<number, { n: number; r: number; g: number; b: number }>();
  const bordo = indiciBordo(w, h);
  for (const i of bordo) {
    const r = pixel[i * 4];
    const g = pixel[i * 4 + 1];
    const b = pixel[i * 4 + 2];
    const chiave = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
    const s = secchi.get(chiave) ?? { n: 0, r: 0, g: 0, b: 0 };
    s.n++;
    s.r += r;
    s.g += g;
    s.b += b;
    secchi.set(chiave, s);
  }
  const ordinati = [...secchi.values()].sort((a, b) => b.n - a.n);
  const colori: Rgb[] = [];
  let coperti = 0;
  for (const s of ordinati) {
    colori.push([s.r / s.n, s.g / s.n, s.b / s.n]);
    coperti += s.n;
    if (coperti >= bordo.length * 0.85 || colori.length === 4) break;
  }
  return colori;
}

/**
 * Restituisce il capo ritagliato, oppure null se la foto non si presta
 * (sfondo troppo vario, o capo che tocca tutti i bordi).
 */
export function rimuoviSfondo(pixel: ArrayLike<number>, w: number, h: number, tolleranza = 52): EsitoSfondo | null {
  if (w < 8 || h < 8) return null;
  const sfondo = coloriSfondo(pixel, w, h);
  const totale = w * h;
  const vicinoAlloSfondo = (i: number) => {
    const c: Rgb = [pixel[i * 4], pixel[i * 4 + 1], pixel[i * 4 + 2]];
    return sfondo.some((s) => distanza(c, s) < tolleranza);
  };

  // Allagamento dai bordi (4 vicini), con una coda semplice.
  const maschera = new Uint8Array(totale); // 1 = sfondo
  const coda = new Int32Array(totale);
  let testa = 0;
  let fine = 0;
  for (const i of indiciBordo(w, h)) {
    if (!maschera[i] && vicinoAlloSfondo(i)) {
      maschera[i] = 1;
      coda[fine++] = i;
    }
  }
  while (testa < fine) {
    const i = coda[testa++];
    const x = i % w;
    const vicini = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w];
    for (const j of vicini) {
      if (j < 0 || j >= totale || maschera[j]) continue;
      if (vicinoAlloSfondo(j)) {
        maschera[j] = 1;
        coda[fine++] = j;
      }
    }
  }

  // Quanto è grande il capo e dove sta.
  let capo = 0;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let i = 0; i < totale; i++) {
    if (maschera[i]) continue;
    capo++;
    const x = i % w;
    const y = (i - x) / w;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  const quotaCapo = capo / totale;
  if (quotaCapo < 0.03 || quotaCapo > 0.97) return null;

  // Ritaglio con un piccolo margine.
  const margine = Math.round(Math.max(w, h) * 0.03);
  x0 = Math.max(0, x0 - margine);
  y0 = Math.max(0, y0 - margine);
  x1 = Math.min(w - 1, x1 + margine);
  y1 = Math.min(h - 1, y1 + margine);
  const lw = x1 - x0 + 1;
  const lh = y1 - y0 + 1;
  const uscita = new Uint8ClampedArray(lw * lh * 4);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = y * w + x;
      const o = ((y - y0) * lw + (x - x0)) * 4;
      uscita[o] = pixel[i * 4];
      uscita[o + 1] = pixel[i * 4 + 1];
      uscita[o + 2] = pixel[i * 4 + 2];
      if (maschera[i]) {
        uscita[o + 3] = 0;
        continue;
      }
      // Bordo del capo un po' sfumato, così il ritaglio non sembra fatto con le forbici.
      const bordo =
        (x > 0 && maschera[i - 1]) || (x < w - 1 && maschera[i + 1]) || (y > 0 && maschera[i - w]) || (y < h - 1 && maschera[i + w]);
      uscita[o + 3] = bordo ? 150 : 255;
    }
  }
  return { pixel: uscita, larghezza: lw, altezza: lh, quotaCapo };
}
