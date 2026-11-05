import { describe, expect, it } from 'vitest';
import { coloriSfondo, rimuoviSfondo } from './sfondo';

/** Immagine finta: sfondo di un colore con un rettangolo (il "capo") di un altro colore. */
function immagine(
  w: number,
  h: number,
  sfondo: [number, number, number],
  capo: [number, number, number],
  riquadro: { x: number; y: number; w: number; h: number },
  rumore = 0,
): Uint8ClampedArray {
  const p = new Uint8ClampedArray(w * h * 4);
  let seme = 7;
  const caso = () => {
    seme = (seme * 16807) % 2147483647;
    return (seme / 2147483647 - 0.5) * 2 * rumore;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dentro = x >= riquadro.x && x < riquadro.x + riquadro.w && y >= riquadro.y && y < riquadro.y + riquadro.h;
      const c = dentro ? capo : sfondo;
      const i = (y * w + x) * 4;
      p[i] = c[0] + caso();
      p[i + 1] = c[1] + caso();
      p[i + 2] = c[2] + caso();
      p[i + 3] = 255;
    }
  }
  return p;
}

describe('rimozione dello sfondo', () => {
  it('riconosce il colore dello sfondo dai bordi', () => {
    const p = immagine(40, 40, [240, 238, 232], [110, 28, 45], { x: 10, y: 10, w: 20, h: 20 });
    const [c] = coloriSfondo(p, 40, 40);
    expect(c[0]).toBeCloseTo(240, 0);
  });

  it('ritaglia il capo e rende trasparente lo sfondo', () => {
    const p = immagine(60, 80, [244, 242, 236], [110, 28, 45], { x: 15, y: 20, w: 30, h: 40 }, 6);
    const esito = rimuoviSfondo(p, 60, 80)!;
    expect(esito).not.toBeNull();
    expect(esito.quotaCapo).toBeCloseTo((30 * 40) / (60 * 80), 2);
    // Il ritaglio sta attorno al capo (più un piccolo margine).
    expect(esito.larghezza).toBeLessThan(40);
    expect(esito.altezza).toBeLessThan(50);
    const alfa = (x: number, y: number) => esito.pixel[(y * esito.larghezza + x) * 4 + 3];
    expect(alfa(0, 0)).toBe(0);
    expect(alfa(Math.floor(esito.larghezza / 2), Math.floor(esito.altezza / 2))).toBe(255);
  });

  it('funziona anche su sfondi scuri e con capi chiari', () => {
    const p = immagine(50, 50, [40, 44, 52], [236, 230, 220], { x: 12, y: 12, w: 26, h: 26 }, 4);
    expect(rimuoviSfondo(p, 50, 50)?.quotaCapo).toBeGreaterThan(0.2);
  });

  it('non fa danni quando il capo riempie la foto o non si distingue dallo sfondo', () => {
    const pieno = immagine(30, 30, [110, 28, 45], [110, 28, 45], { x: 0, y: 0, w: 30, h: 30 });
    expect(rimuoviSfondo(pieno, 30, 30)).toBeNull();
    const minuscolo = immagine(40, 40, [240, 240, 240], [20, 20, 20], { x: 20, y: 20, w: 2, h: 2 });
    expect(rimuoviSfondo(minuscolo, 40, 40)).toBeNull();
    expect(rimuoviSfondo(new Uint8ClampedArray(4 * 4 * 4), 4, 4)).toBeNull();
  });
});
