import { useState } from 'react';
import { useApp } from '../../app/contesto';
import type { Capo } from '../../shared/tipi';
import { IconaPiu } from '../../shared/ui/Icone';
import { Scelta } from '../../shared/ui/Scelta';
import { categoria, NOMI_SLOT, ORDINE_SLOT, type Slot } from '../outfit/catalogo';
import { descriviColore } from '../outfit/fantasie';
import { Figura, PallinoColore } from '../outfit/SchedaOutfit';
import { FoglioAggiuntaRapida } from './FoglioAggiuntaRapida';
import { FoglioCapo } from './FoglioCapo';
import { Statistiche } from './Statistiche';

export function PaginaArmadio() {
  const { armadio, profilo, abbina } = useApp();
  const [filtro, setFiltro] = useState<Slot | 'tutti'>('tutti');
  const [modulo, setModulo] = useState<{ aperto: boolean; capo?: Capo }>({ aperto: false });
  const [rapida, setRapida] = useState(false);

  const presenti = ORDINE_SLOT.filter((s) => armadio.some((c) => categoria(c.categoria).slot === s));
  const filtroValido = filtro === 'tutti' || presenti.includes(filtro) ? filtro : 'tutti';
  const visibili = armadio.filter((c) => filtroValido === 'tutti' || categoria(c.categoria).slot === filtroValido);

  return (
    <section className="sezione" aria-labelledby="titolo-armadio">
      <div className="sezione-testa">
        <h2 id="titolo-armadio">Il tuo armadio</h2>
        <span className="conteggio">{armadio.length === 1 ? '1 capo' : `${armadio.length} capi`}</span>
      </div>

      {armadio.length === 0 ? (
        <div className="armadio-vuoto">
          <p>
            <strong>Il tuo armadio è vuoto.</strong> Intanto ti propongo idee generiche.
          </p>
          <p>
            Usa <strong>Aggiunta rapida</strong> per toccare in un attimo i capi che hai, oppure caricali uno alla volta con una
            foto. Da quel momento i consigli useranno i
            tuoi vestiti e ti dirò cosa manca.
          </p>
        </div>
      ) : (
        <>
          {presenti.length > 1 && (
            <Scelta
              etichetta="Filtra per tipo"
              opzioni={[{ id: 'tutti' as const, nome: 'Tutti' }, ...presenti.map((s) => ({ id: s, nome: NOMI_SLOT[s] }))]}
              valore={filtroValido}
              onCambia={setFiltro}
              stile="chip"
              scorrevole
            />
          )}
          <ul className="griglia-armadio">
            {visibili.map((c) => {
              const nome = c.nome || categoria(c.categoria).nome;
              const descrizione = descriviColore(c.colore, c.fantasia, c.colore2);
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setModulo({ aperto: true, capo: c })} aria-label={`${nome}, ${descrizione}`}>
                    <div className={`tessera-figura${c.daLavare ? ' da-lavare' : ''}`}>
                      <Figura pezzo={{ categoria: c.categoria, colore: c.colore, fantasia: c.fantasia, colore2: c.colore2, nome, capo: c }} />
                      {c.preferito && (
                        <span className="etichetta-preferito" aria-label="preferito">
                          ♥
                        </span>
                      )}
                      {c.daLavare && <span className="etichetta-lavare">Da lavare</span>}
                    </div>
                    <span className="nome-capo">{nome}</span>
                    <span className="tessera-colore">
                      <PallinoColore colore={c.colore} colore2={c.colore2} fantasia={c.fantasia} />
                      {descrizione}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {armadio.length > 0 && (
        <details className="statistiche-blocco">
          <summary>Statistiche</summary>
          <Statistiche armadio={armadio} />
        </details>
      )}

      <div className="azioni-armadio fisso">
        <button type="button" className="bottone secondario" onClick={() => setRapida(true)}>
          Aggiunta rapida
        </button>
        <button type="button" className="bottone primario" onClick={() => setModulo({ aperto: true })}>
          <IconaPiu /> Aggiungi capo
        </button>
      </div>
      <FoglioAggiuntaRapida aperto={rapida} genere={profilo.genere} onChiudi={() => setRapida(false)} />
      <FoglioCapo
        aperto={modulo.aperto}
        capo={modulo.capo}
        genere={profilo.genere}
        onChiudi={() => setModulo({ aperto: false })}
        onAbbina={(capo) => {
          setModulo({ aperto: false });
          abbina(capo);
        }}
      />
    </section>
  );
}
