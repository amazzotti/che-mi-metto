import { useCallback, useEffect, useRef, useState } from 'react';
import { useArmadio } from '../features/armadio/armadio';
import { PaginaArmadio } from '../features/armadio/PaginaArmadio';
import { PaginaOggi, PaginaSettimana } from '../features/giornata/Pagine';
import { eliminaImpegniPassati } from '../features/impegni/impegni';
import { oraLocale } from '../features/meteo/openMeteo';
import { SceltaPosizione } from '../features/meteo/SceltaPosizione';
import { useAdesso, useMeteo } from '../features/meteo/useMeteo';
import { PaginaProfilo } from '../features/profilo/PaginaProfilo';
import { aggiornaProfilo, useProfilo } from '../features/profilo/profilo';
import { oggiDispositivo } from '../shared/date';
import type { Capo, Profilo } from '../shared/tipi';
import { GenereSagome } from '../features/outfit/Sagoma';
import { Foglio } from '../shared/ui/Foglio';
import { IconaArmadio, IconaOggi, IconaPosizione, IconaProfilo, IconaSettimana } from '../shared/ui/Icone';
import { AggiornamentoPwa } from './AggiornamentoPwa';
import { BannerInstalla } from './BannerInstalla';
import { Benvenuto } from './Benvenuto';
import { ContestoApp, type DatiApp, type Scheda } from './contesto';
import { Logo } from './Logo';

const SCHEDE: { id: Scheda; nome: string; icona: () => React.JSX.Element }[] = [
  { id: 'oggi', nome: 'Oggi', icona: IconaOggi },
  { id: 'settimana', nome: 'Settimana', icona: IconaSettimana },
  { id: 'armadio', nome: 'Armadio', icona: IconaArmadio },
  { id: 'profilo', nome: 'Profilo', icona: IconaProfilo },
];

function schedaDaHash(): Scheda {
  const h = window.location.hash.replace('#', '');
  return SCHEDE.some((s) => s.id === h) ? (h as Scheda) : 'oggi';
}

/** La scheda attiva sta nell'indirizzo (#armadio...), così il tasto "indietro" funziona. */
function useScheda(alCambio?: (s: Scheda) => void): [Scheda, (s: Scheda) => void] {
  const [scheda, setScheda] = useState<Scheda>(schedaDaHash);
  const richiamo = useRef(alCambio);
  useEffect(() => {
    richiamo.current = alCambio;
  });
  useEffect(() => {
    const cambia = () => {
      const nuova = schedaDaHash();
      richiamo.current?.(nuova);
      setScheda(nuova);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', cambia);
    return () => window.removeEventListener('hashchange', cambia);
  }, []);
  const vai = useCallback((s: Scheda) => {
    window.location.hash = s;
  }, []);
  return [scheda, vai];
}

export function App() {
  const profilo = useProfilo();
  if (profilo === undefined) return <div className="avvio" aria-busy="true" />;
  if (profilo === null || !profilo.posizione) return <Benvenuto />;
  return <Guscio profilo={profilo} />;
}

function Guscio({ profilo }: { profilo: Profilo }) {
  const [daAbbinare, setDaAbbinare] = useState<Capo | undefined>();
  // Lasciata la pagina Oggi, il capo da abbinare non serve più.
  const [scheda, vaiA] = useScheda((s) => {
    if (s !== 'oggi') setDaAbbinare(undefined);
  });
  const meteo = useMeteo(profilo.posizione);
  const armadio = useArmadio() ?? [];
  const adesso = useAdesso();
  const [posizioneAperta, setPosizioneAperta] = useState(false);
  const oggi = meteo.previsioni ? oraLocale(meteo.previsioni, adesso).slice(0, 10) : oggiDispositivo(new Date(adesso));

  useEffect(() => {
    void eliminaImpegniPassati(oggi);
  }, [oggi]);

  const apriPosizione = useCallback(() => setPosizioneAperta(true), []);
  const chiudiPosizione = useCallback(() => setPosizioneAperta(false), []);

  const abbina = (capo: Capo) => {
    setDaAbbinare(capo);
    vaiA('oggi');
  };
  const dati: DatiApp = { profilo, meteo, armadio, oggi, adesso, apriPosizione, vaiA, daAbbinare, abbina };

  return (
    <ContestoApp.Provider value={dati}>
      <GenereSagome.Provider value={profilo.genere}>
      <a href="#contenuto" className="salta">
        Vai al contenuto
      </a>
      <header className="testata">
        <div className="testata-marchio">
          <Logo dimensione={30} />
          <h1>Che mi metto?</h1>
        </div>
        <button type="button" className="chip-posizione" onClick={apriPosizione} aria-label={`Luogo: ${profilo.posizione?.nome}. Cambia`}>
          <IconaPosizione /> <span>{profilo.posizione?.nome}</span>
        </button>
      </header>

      <main className="contenuto" id="contenuto" tabIndex={-1}>
        {scheda === 'oggi' && <PaginaOggi key={daAbbinare?.id ?? 'oggi'} />}
        {scheda === 'settimana' && <PaginaSettimana />}
        {scheda === 'armadio' && <PaginaArmadio />}
        {scheda === 'profilo' && <PaginaProfilo />}
      </main>

      <nav className="barra" aria-label="Sezioni">
        {SCHEDE.map(({ id, nome, icona: Icona }) => (
          <a key={id} href={`#${id}`} aria-current={scheda === id ? 'page' : undefined} className={scheda === id ? 'attivo' : undefined}>
            <Icona />
            <span>{nome}</span>
          </a>
        ))}
      </nav>

      <Foglio aperto={posizioneAperta} titolo="Dove sei?" onChiudi={chiudiPosizione}>
        <SceltaPosizione
          onScelta={(posizione) => {
            void aggiornaProfilo({ posizione });
            setPosizioneAperta(false);
          }}
        />
      </Foglio>
      <BannerInstalla />
      <AggiornamentoPwa />
      </GenereSagome.Provider>
    </ContestoApp.Provider>
  );
}
