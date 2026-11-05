import { describe, expect, it } from 'vitest';
import { infoStagione } from './stagione';

describe('stagione', () => {
  it('usa le stagioni meteorologiche', () => {
    expect(infoStagione('2026-01-15', 44).stagione).toBe('inverno');
    expect(infoStagione('2026-04-10', 44).stagione).toBe('primavera');
    expect(infoStagione('2026-07-20', 44).stagione).toBe('estate');
    expect(infoStagione('2026-11-05', 44).stagione).toBe('autunno');
    expect(infoStagione('2026-12-01', 44).stagione).toBe('inverno');
  });

  it('distingue inizio, metà e fine', () => {
    expect(infoStagione('2026-12-10', 44).etichetta).toBe('Inizio inverno');
    expect(infoStagione('2026-01-10', 44).etichetta).toBe('Metà inverno');
    expect(infoStagione('2026-11-05', 44).etichetta).toBe('Fine autunno');
  });

  it("inverte le stagioni nell'emisfero sud", () => {
    expect(infoStagione('2026-07-20', -33.9).stagione).toBe('inverno');
    expect(infoStagione('2026-01-20', -33.9).stagione).toBe('estate');
  });

  it('suggerisce i tessuti e rifiuta date sbagliate', () => {
    expect(infoStagione('2026-07-20', 44).tessuti).toContain('lino');
    expect(() => infoStagione('ciao', 44)).toThrow();
  });
});
