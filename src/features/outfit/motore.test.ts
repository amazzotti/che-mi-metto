import { describe, expect, it } from 'vitest';
import type { Capo, Occasione } from '../../shared/tipi';
import type { Condizioni } from '../meteo/condizioni';
import type { CategoriaId } from './catalogo';
import { categoria } from './catalogo';
import { candidati, fascia, giorniTra, proponiOutfit, temperaturaEffettiva, type RichiestaOutfit } from './motore';

function meteo(percepita: number, altro: Partial<Condizioni> = {}): Condizioni {
  return {
    percepita,
    percepitaMin: percepita - 2,
    percepitaMax: percepita + 2,
    temperaturaMin: percepita - 1,
    temperaturaMax: percepita + 3,
    probPioggia: 5,
    pioggia: 0,
    vento: 10,
    uv: 2,
    neve: false,
    codice: 2,
    dalle: '08:00',
    alle: '18:00',
    sera: false,
    ...altro,
  };
}

function richiesta(percepita: number, altro: Partial<RichiestaOutfit> = {}, condizioni: Partial<Condizioni> = {}): RichiestaOutfit {
  return {
    condizioni: meteo(percepita, condizioni),
    genere: 'uomo',
    sensibilita: 'normale',
    occasione: 'casual',
    data: '2026-11-05',
    latitudine: 44,
    ...altro,
  };
}

const slot = (o: ReturnType<typeof proponiOutfit>) => o.pezzi.map((p) => p.slot);
const ids = (o: ReturnType<typeof proponiOutfit>) => o.pezzi.map((p) => p.categoria as string);
const accessori = (o: ReturnType<typeof proponiOutfit>) => o.accessori.map((p) => p.categoria as string);

let contatore = 0;
function capo(categoriaId: CategoriaId, colore: string, altro: Partial<Capo> = {}): Capo {
  contatore++;
  return {
    id: `c${contatore}`,
    categoria: categoriaId,
    colore,
    occasioni: [...categoria(categoriaId).occasioni],
    impermeabile: false,
    creato: contatore,
    ...altro,
  };
}

describe('fasce climatiche', () => {
  it('suddivide la temperatura percepita', () => {
    expect([-5, 2.9, 3, 8.9, 9, 14.9, 15, 19.9, 20, 24.9, 25, 29.9, 30, 38].map(fascia)).toEqual([
      'gelo', 'gelo', 'freddo', 'freddo', 'fresco', 'fresco', 'mite', 'mite',
      'tiepido', 'tiepido', 'caldo', 'caldo', 'torrido', 'torrido',
    ]);
  });

  it('tiene conto di chi è freddoloso o caloroso', () => {
    expect(temperaturaEffettiva(16, 'freddoloso')).toBe(13);
    expect(temperaturaEffettiva(16, 'caloroso')).toBe(19);
    expect(temperaturaEffettiva(16, 'normale')).toBe(16);
  });

  it('propone solo capi del genere giusto', () => {
    expect(candidati('sotto', 'mite', 'casual', 'uomo')).not.toContain('gonna');
    expect(candidati('sotto', 'mite', 'casual', 'donna')).toContain('gonna');
    expect(candidati('intero', 'mite', 'casual', 'uomo')).toEqual([]);
  });
});

describe('outfit senza armadio', () => {
  it('con il gelo: strati, capospalla pesante, sciarpa, berretto e guanti', () => {
    const o = proponiOutfit(richiesta(-2));
    expect(o.fascia).toBe('gelo');
    expect(slot(o)).toEqual(['sotto', 'capospalla', 'strato', 'base', 'scarpe']);
    expect(['piumino', 'cappotto']).toContain(o.pezzi[1].categoria);
    expect(accessori(o)).toEqual(expect.arrayContaining(['sciarpa', 'berretto', 'guanti']));
    expect(o.motivi[0]).toContain('Percepiti -2°');
  });

  it('con il caldo: niente giacca, pantaloncini o lino, sandali o sneakers', () => {
    const o = proponiOutfit(richiesta(31, {}, { uv: 8, codice: 0 }));
    expect(o.fascia).toBe('torrido');
    expect(slot(o)).not.toContain('capospalla');
    expect(slot(o)).not.toContain('strato');
    expect(['shorts', 'pantaloni-lino']).toContain(o.pezzi.find((p) => p.slot === 'sotto')!.categoria);
    expect(accessori(o)).toContain('occhiali');
    expect(accessori(o)).toContain('cappellino');
    expect(o.motivi.join(' ')).toContain('UV alto');
  });

  it('con la pioggia: capospalla che ripara, scarpe chiuse e ombrello', () => {
    const o = proponiOutfit(richiesta(12, {}, { probPioggia: 80, pioggia: 4, codice: 63 }));
    const giacca = o.pezzi.find((p) => p.slot === 'capospalla')!;
    expect(categoria(giacca.categoria).pioggia).toBe(true);
    const scarpe = o.pezzi.find((p) => p.slot === 'scarpe')!;
    expect(categoria(scarpe.categoria).pioggia).toBe(true);
    expect(accessori(o)).toContain('ombrello');
    expect(o.motivi.join(' ')).toContain('Pioggia probabile (80%)');
  });

  it('pioggia anche quando è tiepido: giacca leggera', () => {
    const o = proponiOutfit(richiesta(22, {}, { probPioggia: 70 }));
    const giacca = o.pezzi.find((p) => p.slot === 'capospalla');
    expect(giacca?.nota).toBe('leggera, se piove');
    expect(giacca?.categoria).toBe('impermeabile');
  });

  it('con la neve: stivali o stivaletti', () => {
    const o = proponiOutfit(richiesta(0, { genere: 'donna' }, { neve: true, codice: 73 }));
    expect(['stivali', 'stivaletti']).toContain(o.pezzi.find((p) => p.slot === 'scarpe')!.categoria);
    expect(o.motivi.join(' ')).toContain('Neve');
  });

  it('a 12° coperto: felpa o maglione sopra, mai la sola t-shirt', () => {
    for (const genere of ['uomo', 'donna'] as const) {
      for (const occasione of ['casual', 'lavoro', 'appuntamento', 'aperitivo'] as const) {
        for (let v = 0; v < 6; v++) {
          const o = proponiOutfit(richiesta(12, { genere, occasione, variante: v }, { codice: 3 }));
          expect(slot(o), `${genere} ${occasione} ${v}`).toContain('strato');
          expect(slot(o)).toContain('capospalla');
        }
      }
    }
  });

  it('tra 15° e 18°: giacca leggera e maniche lunghe', () => {
    for (let v = 0; v < 6; v++) {
      const o = proponiOutfit(richiesta(16, { variante: v }));
      expect(o.pezzi.find((p) => p.slot === 'capospalla')?.nota).toBe('leggera');
      const base = o.pezzi.find((p) => p.slot === 'base');
      if (base && !slot(o).includes('strato')) expect(['tshirt', 'polo', 'top', 'canotta']).not.toContain(base.categoria);
    }
    // Con il tiepido la t-shirt torna a andare benissimo.
    expect(ids(proponiOutfit(richiesta(22)))).toContain('tshirt');
  });

  it('pioggia possibile ma poco probabile: ombrello pieghevole per sicurezza', () => {
    const o = proponiOutfit(richiesta(20, {}, { probPioggia: 30 }));
    expect(o.accessori.find((p) => p.categoria === 'ombrello')?.nota).toBe('pieghevole, per sicurezza');
    expect(o.motivi.join(' ')).toContain('Qualche goccia possibile (30%)');
    expect(proponiOutfit(richiesta(20, {}, { probPioggia: 10 })).accessori.some((p) => p.categoria === 'ombrello')).toBe(false);
  });

  it('con vento forte niente bermuda', () => {
    for (let v = 0; v < 6; v++) {
      expect(ids(proponiOutfit(richiesta(27, { variante: v }, { vento: 40 })))).not.toContain('shorts');
    }
  });

  it('stile coerente: mai capi lontanissimi per formalità nello stesso outfit', () => {
    const occasioni = ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante', 'sport'] as const;
    for (const genere of ['uomo', 'donna'] as const) {
      for (const occasione of occasioni) {
        for (const t of [0, 8, 13, 17, 22, 28]) {
          for (let v = 0; v < 4; v++) {
            const f = proponiOutfit(richiesta(t, { genere, occasione, variante: v })).pezzi.map((p) => categoria(p.categoria).formalita);
            expect(Math.max(...f) - Math.min(...f), `${genere} ${occasione} ${t}° v${v}`).toBeLessThanOrEqual(3);
          }
        }
      }
    }
  });

  it('con vento forte serve una giacca anche se è mite', () => {
    const o = proponiOutfit(richiesta(19, {}, { vento: 40 }));
    expect(slot(o)).toContain('capospalla');
    expect(o.motivi.join(' ')).toContain('Vento fino a 40 km/h');
  });

  it('con un forte sbalzo propone uno strato in più', () => {
    const o = proponiOutfit(richiesta(17, {}, { percepitaMin: 11, percepitaMax: 22 }));
    expect(o.motivi.join(' ')).toContain('Sbalzo di 11°');
    expect(o.pezzi.some((p) => p.nota)).toBe(true);
  });

  it('la sera, se è mite, aggiunge qualcosa da mettere sopra', () => {
    const o = proponiOutfit(richiesta(18, {}, { sera: true }));
    expect(o.pezzi.find((p) => p.slot === 'capospalla')?.nota).toBe('per la sera');
  });

  it('chi è freddoloso si copre di più', () => {
    const normale = proponiOutfit(richiesta(16.5));
    const freddoloso = proponiOutfit(richiesta(16.5, { sensibilita: 'freddoloso', genere: 'donna' }));
    expect(slot(normale)).not.toContain('strato');
    expect(slot(freddoloso)).toContain('strato');
    expect(freddoloso.motivi.join(' ')).toContain('freddolosa');
    expect(proponiOutfit(richiesta(16.5, { sensibilita: 'caloroso' })).motivi.join(' ')).toContain('3° in più');
  });

  it('uscita elegante uomo: camicia, pantaloni eleganti, blazer, scarpe eleganti', () => {
    const o = proponiOutfit(richiesta(21, { occasione: 'elegante' }));
    expect(ids(o)).toEqual(['pantaloni-eleganti', 'blazer', 'camicia', 'scarpe-eleganti']);
  });

  it('uscita elegante donna: alterna vestito e gonna/pantaloni', () => {
    const a = proponiOutfit(richiesta(21, { occasione: 'elegante', genere: 'donna', variante: 0 }));
    const b = proponiOutfit(richiesta(21, { occasione: 'elegante', genere: 'donna', variante: 1 }));
    expect(ids(a)).toContain('vestito');
    expect(slot(b)).toContain('sotto');
    expect(accessori(a)).toContain('borsa');
  });

  it('con il freddo il vestito va con le collant', () => {
    const o = proponiOutfit(richiesta(6, { occasione: 'elegante', genere: 'donna', variante: 0 }));
    expect(o.pezzi.find((p) => p.slot === 'intero')?.nota).toBe('con collant pesanti');
  });

  it('palestra: tuta per andarci e cosa portare in borsa', () => {
    const o = proponiOutfit(richiesta(10, { occasione: 'sport' }));
    expect(ids(o)).toContain('pantaloni-tuta');
    expect(ids(o)).toContain('felpa');
    expect(ids(o)).toContain('running');
    expect(accessori(o)).toContain('borsa-sport');
    expect(o.daPortare).toContain('Asciugamano');
  });

  it('ogni occasione e fascia produce un outfit completo per entrambi i generi', () => {
    const occasioni: Occasione[] = ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante', 'sport'];
    for (const genere of ['uomo', 'donna'] as const) {
      for (const occasione of occasioni) {
        for (const t of [-4, 5, 12, 17, 22, 27, 33]) {
          for (const variante of [0, 1, 2]) {
            const o = proponiOutfit(richiesta(t, { genere, occasione, variante }));
            const s = slot(o);
            expect(s, `${genere} ${occasione} ${t}°`).toContain('scarpe');
            expect(s.includes('intero') || (s.includes('sotto') && s.includes('base')), `${genere} ${occasione} ${t}°`).toBe(true);
            for (const p of [...o.pezzi, ...o.accessori]) {
              expect(categoria(p.categoria).generi).toContain(genere);
              expect(p.colore).toMatch(/^#[0-9a-f]{6}$/);
            }
          }
        }
      }
    }
  });

  it('"Altra idea" cambia la proposta', () => {
    const viste = new Set<string>();
    for (let v = 0; v < 6; v++) {
      const o = proponiOutfit(richiesta(12, { variante: v }));
      viste.add(o.pezzi.map((p) => `${p.categoria}:${p.colore}`).join('|'));
    }
    expect(viste.size).toBeGreaterThan(2);
  });

  it('niente giacca di jeans sopra i jeans, sneakers bianche', () => {
    for (let v = 0; v < 6; v++) {
      const o = proponiOutfit(richiesta(13, { variante: v }));
      const tipi = ids(o);
      expect(tipi.includes('jeans') && tipi.includes('giacca-jeans')).toBe(false);
      const sneakers = o.pezzi.find((p) => p.categoria === 'sneakers');
      if (sneakers) expect(sneakers.nomeColore).toBe('bianco');
    }
  });

  it('aggiunge al massimo un capo fantasia, con un secondo colore che stacca', () => {
    let conFantasia = 0;
    for (const genere of ['uomo', 'donna'] as const) {
      for (const t of [5, 12, 18, 23, 28]) {
        for (let v = 0; v < 6; v++) {
          const o = proponiOutfit(richiesta(t, { genere, variante: v, data: '2026-05-10' }));
          const fantasia = [...o.pezzi, ...o.accessori].filter((p) => p.fantasia);
          expect(fantasia.length).toBeLessThanOrEqual(1);
          if (v % 3 === 2) expect(fantasia).toHaveLength(0);
          for (const p of fantasia) {
            conFantasia++;
            expect(p.colore2).toMatch(/^#[0-9a-f]{6}$/);
            expect(p.colore2).not.toBe(p.colore);
            expect(p.nomeColore).toMatch(/ a (righe|quadri|pois|fiori) /);
          }
        }
      }
    }
    expect(conFantasia).toBeGreaterThan(20);
  });

  it('fantasie adatte a stagione e occasione', () => {
    // In inverno niente fiori; per la palestra niente fantasie.
    for (let v = 0; v < 6; v++) {
      const inverno = proponiOutfit(richiesta(6, { genere: 'donna', variante: v, data: '2026-01-15' }));
      expect([...inverno.pezzi, ...inverno.accessori].some((p) => p.fantasia === 'fiori')).toBe(false);
      const palestra = proponiOutfit(richiesta(18, { occasione: 'sport', variante: v }));
      expect(palestra.pezzi.some((p) => p.fantasia)).toBe(false);
    }
    // Un vestito leggero in estate può essere a fiori.
    const estate = [0, 1, 3, 4].map((v) => proponiOutfit(richiesta(27, { genere: 'donna', variante: v, data: '2026-07-10' })));
    expect(estate.some((o) => o.pezzi.some((p) => p.fantasia === 'fiori' || p.fantasia === 'righe'))).toBe(true);
  });

  it('i jeans sono color denim', () => {
    const o = proponiOutfit(richiesta(12));
    const jeans = o.pezzi.find((p) => p.categoria === 'jeans');
    expect(jeans?.nomeColore).toBe('denim');
  });
});

describe('outfit con armadio', () => {
  const armadio = [
    capo('jeans', '#4a6b8a'),
    capo('chino', '#c19a6b'),
    capo('tshirt', '#ffffff'),
    capo('camicia', '#b9d7f0'),
    capo('maglione', '#6d1a2c', { nome: 'Maglione bordeaux della nonna' }),
    capo('cappotto', '#1f2a44'),
    capo('sneakers', '#ffffff'),
    capo('stivaletti', '#6b4a32'),
    capo('sciarpa', '#c9971c'),
  ];

  it('usa i capi caricati', () => {
    const o = proponiOutfit(richiesta(6, { armadio }));
    expect(o.pezzi.every((p) => p.capo)).toBe(true);
    expect(o.mancanti).toHaveLength(0);
    expect(o.pezzi.find((p) => p.slot === 'strato')?.nome).toBe('Maglione bordeaux della nonna');
    expect(o.accessori.find((p) => p.categoria === 'sciarpa')?.capo).toBeDefined();
    expect(o.dalTuoArmadio).toBe(6);
  });

  it('segnala cosa manca', () => {
    // Con 12° e pioggia serve una giacca impermeabile: nell'armadio c'è solo il cappotto.
    const o = proponiOutfit(richiesta(12, { armadio }, { probPioggia: 90, pioggia: 5 }));
    const giacca = o.pezzi.find((p) => p.slot === 'capospalla')!;
    expect(giacca.mancante).toBe(true);
    expect(['impermeabile', 'trench']).toContain(giacca.categoria);
    expect(o.mancanti).toContain(giacca);
    const solo = proponiOutfit(richiesta(30, { armadio: [capo('tshirt', '#ffffff')] }));
    expect(solo.mancanti.map((p) => p.slot)).toEqual(expect.arrayContaining(['sotto', 'scarpe']));
  });

  it('con la pioggia preferisce le scarpe che non temono il bagnato', () => {
    const conMocassini = [...armadio, capo('mocassini', '#151515')];
    const o = proponiOutfit(richiesta(12, { armadio: conMocassini, occasione: 'appuntamento' }, { probPioggia: 90 }));
    expect(categoria(o.pezzi.find((p) => p.slot === 'scarpe')!.categoria).pioggia).toBe(true);
  });

  it('mantiene la fantasia dei capi caricati e non ne aggiunge altre', () => {
    const conRighe = [capo('camicia', '#ffffff', { fantasia: 'righe', colore2: '#1f2a44' }), capo('chino', '#c19a6b'), capo('sneakers', '#ffffff')];
    const o = proponiOutfit(richiesta(22, { armadio: conRighe }));
    const camicia = o.pezzi.find((p) => p.categoria === 'camicia')!;
    expect(camicia.nomeColore).toBe('bianco a righe blu navy');
    expect([...o.pezzi, ...o.accessori].filter((p) => p.fantasia)).toHaveLength(1);
  });

  it('salta i capi da lavare, preferisce i preferiti e varia rispetto a ieri', () => {
    const base = [capo('chino', '#c19a6b'), capo('sneakers', '#ffffff')];
    const bianca = capo('tshirt', '#ffffff');
    const nera = capo('tshirt', '#151515');
    const scelta = (armadio: Capo[]) => proponiOutfit(richiesta(23, { armadio, data: '2026-06-10' })).pezzi.find((p) => p.slot === 'base')!;
    expect(scelta([...base, bianca, nera]).capo?.id).toBe(bianca.id);
    expect(scelta([...base, { ...bianca, daLavare: true }, nera]).capo?.id).toBe(nera.id);
    expect(scelta([...base, bianca, { ...nera, preferito: true }]).capo?.id).toBe(nera.id);
    expect(scelta([...base, { ...bianca, ultimoUso: '2026-06-09' }, nera]).capo?.id).toBe(nera.id);
    // Se l'hai messa oggi resta la proposta di oggi.
    expect(scelta([...base, { ...bianca, ultimoUso: '2026-06-10' }, nera]).capo?.id).toBe(bianca.id);
    expect(giorniTra('2026-06-09', '2026-06-10')).toBe(1);
  });

  it("rispetta le occasioni scelte per ogni capo", () => {
    const soloCasual = [capo('blazer', '#151515', { occasioni: ['casual'] })];
    const o = proponiOutfit(richiesta(21, { armadio: soloCasual, occasione: 'elegante' }));
    const giacca = o.pezzi.find((p) => p.slot === 'capospalla')!;
    expect(giacca.capo).toBeUndefined();
    expect(giacca.mancante).toBe(true);
  });

  it('sceglie colori che stanno bene insieme', () => {
    const colorati = [
      capo('chino', '#c0392b'),
      capo('tshirt', '#6c3f8f'),
      capo('tshirt', '#ffffff'),
      capo('sneakers', '#ffffff'),
    ];
    const o = proponiOutfit(richiesta(22, { armadio: colorati }));
    // Con i chino rossi, meglio la t-shirt bianca di quella viola.
    expect(o.pezzi.find((p) => p.slot === 'base')!.nomeColore).toBe('bianco');
  });
});
