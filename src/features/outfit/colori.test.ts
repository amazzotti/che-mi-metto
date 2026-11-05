import { describe, expect, it } from 'vitest';
import { armonia, armoniaInsieme, coloreDominante, eChiaro, eNeutro, hexInRgb, hsl, nomeColore, rgbInHex, sfuma } from './colori';

describe('colori', () => {
  it('converte tra esadecimale e RGB', () => {
    expect(hexInRgb('#1f2a44')).toEqual([31, 42, 68]);
    expect(hexInRgb('#fff')).toEqual([255, 255, 255]);
    expect(rgbInHex([31, 42, 68])).toBe('#1f2a44');
    expect(() => hexInRgb('#zzz')).toThrow();
  });

  it('dà il nome italiano più vicino', () => {
    expect(nomeColore('#000000')).toBe('nero');
    expect(nomeColore('#fefefe')).toBe('bianco');
    expect(nomeColore('#203050')).toBe('blu navy');
    expect(nomeColore('#7a1c30')).toBe('bordeaux');
    expect(nomeColore('#c0a070')).toBe('cammello');
  });

  it('calcola la tonalità', () => {
    expect(hsl('#ff0000').h).toBeCloseTo(0);
    expect(hsl('#00ff00').h).toBeCloseTo(120);
    expect(hsl('#808080').s).toBe(0);
  });

  it('riconosce i neutri', () => {
    expect(eNeutro('#151515')).toBe(true);
    expect(eNeutro('#c19a6b')).toBe(true);
    expect(eNeutro('#4a6b8a')).toBe(true);
    expect(eNeutro('#c0392b')).toBe(false);
  });

  it("valuta l'armonia dei colori", () => {
    expect(armonia('#151515', '#c0392b')).toBe(1);
    // rosso e verde: complementari
    expect(armonia('#c0392b', '#2f9d5a')).toBeGreaterThanOrEqual(0.7);
    // rosso e viola: stonano un po'
    expect(armonia('#c0392b', '#6c3f8f')).toBeLessThan(0.5);
    expect(armoniaInsieme(['#c0392b', '#f2c94c', '#6c3f8f', '#2f56a6'])).toBeLessThan(
      armoniaInsieme(['#151515', '#ffffff', '#c0392b']),
    );
    expect(armoniaInsieme(['#151515'])).toBe(1);
  });

  it('schiarisce, scurisce e sceglie il contrasto', () => {
    expect(sfuma('#808080', 0.5)).toBe('#404040');
    expect(sfuma('#000000', 1.5)).toBe('#808080');
    expect(eChiaro('#ffffff')).toBe(true);
    expect(eChiaro('#1f2a44')).toBe(false);
  });

  it('trova il colore dominante ignorando lo sfondo bianco e i pixel trasparenti', () => {
    const pixel: number[] = [];
    for (let i = 0; i < 60; i++) pixel.push(250, 250, 250, 255); // sfondo
    for (let i = 0; i < 30; i++) pixel.push(110, 28, 45, 255); // bordeaux
    for (let i = 0; i < 10; i++) pixel.push(20, 20, 20, 0); // trasparente
    expect(nomeColore(coloreDominante(pixel)!)).toBe('bordeaux');
    expect(coloreDominante([0, 0, 0, 0])).toBeNull();
    expect(coloreDominante([255, 255, 255, 255])).toBe('#ffffff');
  });
});
