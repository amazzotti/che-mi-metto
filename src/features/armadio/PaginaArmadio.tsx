import { useState } from 'react';
import { useApp } from '../../app/contesto';
import type { Capo } from '../../shared/tipi';
import { IconaPiu } from '../../shared/ui/Icone';
import { Scelta } from '../../shared/ui/Scelta';
import { categoria, NOMI_SLOT, ORDINE_SLOT, type Slot } from '../outfit/catalogo';
import { nomeColore } from '../outfit/colori';
import { Figura } from '../outfit/SchedaOutfit';
import { FoglioCapo } from './FoglioCapo';

export function PaginaArmadio() {
  const { armadio, profilo } = useApp();
  const [filtro, setFiltro] = useState<Slot | 'tutti'>('tutti');
  const [modulo, setModulo] = useState<{ aperto: boolean; capo?: Capo }>({ aperto: false });

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
            Carica i tuoi capi uno alla volta, con una foto oppure scegliendo solo tipo e colore: da quel momento i consigli useranno i
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
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setModulo({ aperto: true, capo: c })} aria-label={`${nome}, ${nomeColore(c.colore)}`}>
                    <div className="tessera-figura">
                      <Figura pezzo={{ categoria: c.categoria, colore: c.colore, nome, capo: c }} />
                    </div>
                    <span className="nome-capo">{nome}</span>
                    <span className="tessera-colore">
                      <i style={{ background: c.colore }} aria-hidden="true" />
                      {nomeColore(c.colore)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <button type="button" className="bottone primario largo fisso" onClick={() => setModulo({ aperto: true })}>
        <IconaPiu /> Aggiungi capo
      </button>
      <FoglioCapo aperto={modulo.aperto} capo={modulo.capo} genere={profilo.genere} onChiudi={() => setModulo({ aperto: false })} />
    </section>
  );
}
