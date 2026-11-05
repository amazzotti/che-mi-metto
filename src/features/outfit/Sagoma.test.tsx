import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { eIos } from '../../app/BannerInstalla';
import { CATALOGO } from './catalogo';
import { Sagoma, SAGOME_DISPONIBILI } from './Sagoma';

describe('sagome', () => {
  it('esiste una sagoma per ogni capo del catalogo', () => {
    for (const c of CATALOGO) expect(SAGOME_DISPONIBILI).toContain(c.sagoma);
  });

  it('disegna la sagoma con il colore del capo', () => {
    const { getByRole } = render(<Sagoma id="cappotto" colore="#c19a6b" titolo="Cappotto cammello" />);
    const svg = getByRole('img', { name: 'Cappotto cammello' });
    expect(svg.querySelector('path[fill="#c19a6b"]')).not.toBeNull();
  });

  it('riempie il capo con la fantasia scelta', () => {
    for (const fantasia of ['righe', 'quadri', 'pois', 'fiori'] as const) {
      const { container, unmount } = render(<Sagoma id="camicia" colore="#ffffff" fantasia={fantasia} colore2="#1f2a44" />);
      const motivo = container.querySelector('pattern');
      expect(motivo, fantasia).not.toBeNull();
      expect(container.querySelector(`path[fill="url(#${motivo!.id})"]`)).not.toBeNull();
      expect(container.querySelector('svg')?.getAttribute('data-fantasia')).toBe(fantasia);
      unmount();
    }
    const { container } = render(<Sagoma id="camicia" colore="#ffffff" fantasia="unita" colore2="#1f2a44" />);
    expect(container.querySelector('pattern')).toBeNull();
  });

  it('senza titolo è decorativa', () => {
    const { container } = render(<Sagoma id="sciarpa" colore="#151515" />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('riconoscimento iPhone', () => {
  it('riconosce iPhone e iPad', () => {
    expect(eIos('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 'iPhone', 5)).toBe(true);
    expect(eIos('Mozilla/5.0 (Macintosh)', 'MacIntel', 5)).toBe(true);
    expect(eIos('Mozilla/5.0 (Macintosh)', 'MacIntel', 0)).toBe(false);
    expect(eIos('Mozilla/5.0 (Windows NT 10.0)', 'Win32', 0)).toBe(false);
  });
});
