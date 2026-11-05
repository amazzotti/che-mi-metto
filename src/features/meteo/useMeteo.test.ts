import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchFinto, PROFILO, svuotaDati } from '../../test/aiuti';
import { rispostaMeteoFinta } from '../../test/meteoFinto';
import { interpretaPrevisioni } from './openMeteo';
import { leggiCache, useMeteo, VALIDITA_MS } from './useMeteo';

const posizione = PROFILO.posizione!;
const CHIAVE = 'meteo:44.06,12.57';

describe('useMeteo', () => {
  beforeEach(svuotaDati);
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('scarica le previsioni e le salva per usarle offline', async () => {
    const f = fetchFinto();
    const { result } = renderHook(() => useMeteo(posizione));
    expect(result.current.caricamento).toBe(true);
    await waitFor(() => expect(result.current.previsioni).not.toBeNull());
    expect(result.current.caricamento).toBe(false);
    expect(leggiCache(posizione)?.giorni).toHaveLength(7);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('non riscarica se la cache è recente, ma lo fa con aggiorna()', async () => {
    localStorage.setItem(CHIAVE, JSON.stringify(interpretaPrevisioni(rispostaMeteoFinta({ inizio: '2026-11-05' }))));
    const f = fetchFinto();
    const { result } = renderHook(() => useMeteo(posizione));
    expect(result.current.previsioni).not.toBeNull();
    expect(result.current.caricamento).toBe(false);
    expect(f).not.toHaveBeenCalled();
    act(() => result.current.aggiorna());
    await waitFor(() => expect(f).toHaveBeenCalledTimes(1));
  });

  it('se la rete manca usa la cache vecchia e lo segnala', async () => {
    const vecchie = {
      ...interpretaPrevisioni(rispostaMeteoFinta({ inizio: '2026-11-05' })),
      scaricato: Date.now() - VALIDITA_MS - 1000,
    };
    localStorage.setItem(CHIAVE, JSON.stringify(vecchie));
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));
    const { result } = renderHook(() => useMeteo(posizione));
    await waitFor(() => expect(result.current.errore).toContain('Failed to fetch'));
    expect(result.current.vecchie).toBe(true);
    expect(result.current.previsioni).not.toBeNull();
  });

  it('senza posizione non fa nulla', () => {
    const f = fetchFinto();
    const { result } = renderHook(() => useMeteo(undefined));
    expect(result.current.previsioni).toBeNull();
    expect(result.current.caricamento).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });
});
