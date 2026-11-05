import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { aggiungiCapo, elencoCapi } from '../features/armadio/armadio';
import { aggiungiImpegno } from '../features/impegni/impegni';
import { leggiProfilo, salvaProfilo } from '../features/profilo/profilo';
import { curvaGiornaliera } from '../test/meteoFinto';
import { fermaOrologio, fetchFinto, OGGI, PROFILO, svuotaDati } from '../test/aiuti';
import { App } from './App';

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({ needRefresh: [false, () => {}], offlineReady: [false, () => {}], updateServiceWorker: async () => {} }),
}));

describe('App', () => {
  beforeEach(async () => {
    await svuotaDati();
    fermaOrologio('10:00');
    window.location.hash = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('al primo avvio chiede genere e città, poi mostra meteo e outfit', async () => {
    const fetch = fetchFinto({ temperatura: curvaGiornaliera(4, 10) });
    const utente = userEvent.setup();
    render(<App />);

    const inizia = await screen.findByRole('button', { name: 'Iniziamo' });
    expect(inizia).toBeDisabled();
    await utente.click(screen.getByRole('button', { name: 'Uomo' }));
    await utente.type(screen.getByRole('searchbox', { name: 'Cerca la città' }), 'Rimini');
    await utente.click(await screen.findByRole('button', { name: /Rimini.*Emilia-Romagna/ }));
    await utente.click(inizia);

    expect(await screen.findByRole('region', { name: 'Meteo attuale' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Outfit per oggi' })).toBeInTheDocument();
    const capi = screen.getByRole('list', { name: 'Capi consigliati' });
    // Fa freddo: servono uno strato e un capospalla.
    expect(capi.querySelector('[data-slot="capospalla"]')).not.toBeNull();
    expect(capi.querySelector('[data-slot="strato"]')).not.toBeNull();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('api.open-meteo.com'), expect.anything());
  });

  it('cambiando occasione cambia l’outfit; tre idee da sfogliare e "Altre idee"', async () => {
    fetchFinto({ temperatura: curvaGiornaliera(16, 23) });
    await salvaProfilo({ ...PROFILO, genere: 'uomo' });
    const utente = userEvent.setup();
    render(<App />);

    await screen.findByRole('list', { name: 'Capi consigliati' });
    await utente.click(screen.getByRole('button', { name: 'Elegante' }));
    // Solo l'idea visibile è accessibile: le altre sono nascoste finché non le sfogli.
    const capi = () => screen.getByRole('list', { name: 'Capi consigliati' });
    expect(within(capi()).getByText('Pantaloni eleganti')).toBeInTheDocument();
    expect(within(capi()).getByText('Scarpe eleganti')).toBeInTheDocument();

    const schede = screen.getAllByRole('tab', { selected: false }).filter((t) => t.closest('.idee-schede'));
    expect(schede).toHaveLength(2);
    const prima = capi().textContent;
    await utente.click(schede[0]);
    expect(capi().textContent).not.toBe(prima);

    await utente.click(screen.getByRole('button', { name: 'Altre idee' }));
    expect(within(screen.getByRole('tablist', { name: 'Idee di outfit' })).getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('usa i capi dell’armadio e mostra gli impegni con il loro outfit', async () => {
    fetchFinto({ temperatura: curvaGiornaliera(5, 11) });
    await salvaProfilo(PROFILO);
    await aggiungiCapo({ categoria: 'cappotto', colore: '#c19a6b', nome: 'Cappotto cammello', occasioni: ['casual', 'lavoro', 'elegante', 'appuntamento'], impermeabile: false });
    await aggiungiImpegno({ data: OGGI, ora: '18:30', titolo: 'Palestra', occasione: 'sport' });
    render(<App />);

    expect(await screen.findAllByText('Cappotto cammello')).not.toHaveLength(0);
    expect(screen.getAllByText('Tuo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ti manca').length).toBeGreaterThan(0);
    expect(await screen.findByText('18:30')).toBeInTheDocument();
    expect(screen.getAllByText('Asciugamano').length).toBeGreaterThan(0);
  });

  it('"Lo metto oggi" registra i capi dell’armadio usati', async () => {
    fetchFinto({ temperatura: curvaGiornaliera(5, 11) });
    await salvaProfilo(PROFILO);
    const cappotto = await aggiungiCapo({ categoria: 'cappotto', colore: '#c19a6b', occasioni: ['casual'], impermeabile: false });
    const utente = userEvent.setup();
    render(<App />);

    await utente.click(await screen.findByRole('button', { name: 'Lo metto oggi' }));
    expect(await screen.findByRole('button', { name: /Segnato/ })).toBeDisabled();
    const [salvato] = await elencoCapi();
    expect(salvato).toMatchObject({ id: cappotto.id, usi: 1, ultimoUso: OGGI });
  });

  it('aggiunge un capo dall’armadio', async () => {
    fetchFinto();
    await salvaProfilo(PROFILO);
    window.location.hash = 'armadio';
    const utente = userEvent.setup();
    render(<App />);

    expect(await screen.findByText(/armadio è vuoto/)).toBeInTheDocument();
    await utente.click(screen.getByRole('button', { name: 'Aggiungi capo' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Nuovo capo' });
    await utente.selectOptions(within(dialogo).getByRole('combobox'), 'gonna-lunga');
    await utente.click(within(dialogo).getByRole('button', { name: 'bordeaux' }));
    await utente.type(within(dialogo).getByRole('textbox'), 'Gonna plissé');
    await utente.click(within(dialogo).getByRole('button', { name: "Aggiungi all'armadio" }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByRole('button', { name: 'Gonna plissé, bordeaux' })).toBeInTheDocument();
    expect(screen.getByText('1 capo')).toBeInTheDocument();
  });

  it('se la rete non risponde avvisa e permette di riprovare', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await salvaProfilo(PROFILO);
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Meteo non disponibile');
    expect(screen.getByRole('button', { name: 'Riprova' })).toBeInTheDocument();
  });

  it('il lucchetto tiene fermo un capo anche con "Altre idee"', async () => {
    fetchFinto({ temperatura: curvaGiornaliera(9, 15) });
    await salvaProfilo(PROFILO);
    const utente = userEvent.setup();
    render(<App />);

    const capi = await screen.findByRole('list', { name: 'Capi consigliati' });
    const sotto = capi.querySelector('[data-slot="sotto"], [data-slot="intero"]')!;
    const nome = sotto.querySelector('strong')!.textContent!;
    await utente.click(within(sotto as HTMLElement).getByRole('button', { name: `Tieni fisso ${nome}` }));
    expect(await screen.findByRole('button', { name: `Sblocca ${nome}` })).toHaveAttribute('aria-pressed', 'true');

    await utente.click(screen.getByRole('button', { name: 'Altre idee' }));
    await utente.click(screen.getByRole('button', { name: 'Altre idee' }));
    expect(within(screen.getByRole('list', { name: 'Capi consigliati' })).getByText(nome)).toBeInTheDocument();

    await utente.click(screen.getByRole('button', { name: `Sblocca ${nome}` }));
    expect(screen.queryByRole('button', { name: `Sblocca ${nome}` })).not.toBeInTheDocument();
  });

  it('"Abbinalo" porta agli outfit di oggi con il capo già fissato', async () => {
    fetchFinto({ temperatura: curvaGiornaliera(9, 15) });
    await salvaProfilo(PROFILO);
    await aggiungiCapo({ categoria: 'gonna', colore: '#6d1a2c', nome: 'Gonna bordeaux', occasioni: ['casual', 'aperitivo'], impermeabile: false });
    window.location.hash = 'armadio';
    const utente = userEvent.setup();
    render(<App />);

    await utente.click(await screen.findByRole('button', { name: /Gonna bordeaux/ }));
    await utente.click(await screen.findByRole('button', { name: /Abbinalo/ }));
    const capi = await screen.findByRole('list', { name: 'Capi consigliati' });
    expect(within(capi).getByText('Gonna bordeaux')).toBeInTheDocument();
    expect(within(capi).getByRole('button', { name: 'Sblocca Gonna bordeaux' })).toBeInTheDocument();
  });

  it('aggiunta rapida: tocchi i capi che hai e finiscono nell’armadio', async () => {
    fetchFinto();
    await salvaProfilo(PROFILO);
    window.location.hash = 'armadio';
    const utente = userEvent.setup();
    render(<App />);

    await utente.click(await screen.findByRole('button', { name: 'Aggiunta rapida' }));
    const dialogo = await screen.findByRole('dialog', { name: 'Aggiunta rapida' });
    await utente.click(within(dialogo).getByRole('button', { name: 'Aggiungi Jeans' }));
    await utente.click(within(dialogo).getByRole('button', { name: 'bordeaux' }));
    await utente.click(within(dialogo).getByRole('button', { name: 'Aggiungi Maglione' }));
    await utente.click(await within(dialogo).findByRole('button', { name: 'Fatto: 2 capi aggiunti' }));

    const capi = await elencoCapi();
    // Con l'orologio fermo dei test i due capi hanno lo stesso orario: confrontiamo senza badare all'ordine.
    expect(capi.map((c) => [c.categoria, c.colore]).sort()).toEqual([
      ['jeans', '#4a6b8a'],
      ['maglione', '#6d1a2c'],
    ]);
    expect(await screen.findByText('2 capi')).toBeInTheDocument();
  });

  it('"Ieri com\'era?" corregge la temperatura su cui ragiona', async () => {
    fetchFinto();
    await salvaProfilo(PROFILO);
    localStorage.setItem('ultimo-giorno-aperto', '2026-11-04');
    const utente = userEvent.setup();
    render(<App />);

    await utente.click(await screen.findByRole('button', { name: /Avevo freddo/ }));
    expect(await screen.findByText(/Ne terrò conto/)).toBeInTheDocument();
    await waitFor(async () => expect((await leggiProfilo())?.correzione).toBe(0.5));
  });
});
