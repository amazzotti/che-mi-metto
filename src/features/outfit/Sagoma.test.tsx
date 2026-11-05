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
