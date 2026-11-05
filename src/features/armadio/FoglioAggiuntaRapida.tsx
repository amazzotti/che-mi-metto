import { useState } from 'react';
import type { Genere } from '../../shared/tipi';
import { Foglio } from '../../shared/ui/Foglio';
import { type CategoriaId, type CategoriaInfo, categoriePerGenere, NOMI_SLOT } from '../outfit/catalogo';
import { COLORI } from '../outfit/colori';
import { Sagoma } from '../outfit/Sagoma';
import { aggiungiCapo } from './armadio';

interface Props {
  aperto: boolean;
  genere: Genere;
  onChiudi: () => void;
}

/**
 * Armadio pronto in due minuti, senza foto: scegli un colore e tocca i capi che hai.
 * Ogni tocco aggiunge un capo; i dettagli si possono sistemare dopo.
 */
export function FoglioAggiuntaRapida({ aperto, genere, onChiudi }: Props) {
  const [colore, setColore] = useState('#1f2a44');
  // Finché non scegli un colore, jeans e simili restano del loro colore tipico (denim...).
  const [sceltoDaTe, setSceltoDaTe] = useState(false);
  const coloreDi = (c: CategoriaInfo) => (!sceltoDaTe && c.coloreTipico ? c.coloreTipico : colore);
  const [aggiunti, setAggiunti] = useState<Record<string, number>>({});
  const totale = Object.values(aggiunti).reduce((s, n) => s + n, 0);

  const aggiungi = async (c: CategoriaInfo) => {
    await aggiungiCapo({
      categoria: c.id as CategoriaId,
      colore: coloreDi(c),
      occasioni: [...c.occasioni],
      impermeabile: Boolean(c.pioggia && c.slot === 'capospalla'),
    });
    setAggiunti((a) => ({ ...a, [c.id]: (a[c.id] ?? 0) + 1 }));
  };

  const chiudi = () => {
    setAggiunti({});
    onChiudi();
  };

  return (
    <Foglio aperto={aperto} titolo="Aggiunta rapida" onChiudi={chiudi}>
      <div className="modulo">
        <p className="nota-piccola">Scegli un colore, poi tocca i capi che hai di quel colore. Puoi cambiare i dettagli dopo.</p>
        <div className="tavolozza rapida" role="group" aria-label="Colore dei capi da aggiungere">
          {COLORI.map((c) => (
            <button
              key={c.hex}
              type="button"
              className="campione"
              style={{ background: c.hex }}
              aria-label={c.nome}
              aria-pressed={colore === c.hex}
              onClick={() => {
                setColore(c.hex);
                setSceltoDaTe(true);
              }}
            />
          ))}
        </div>
        {categoriePerGenere(genere).map((g) => (
          <section key={g.slot} className="rapida-gruppo">
            <h3>{NOMI_SLOT[g.slot]}</h3>
            <ul className="rapida-griglia">
              {g.categorie.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-label={`Aggiungi ${c.nome}`}
                    onClick={() => void aggiungi(c)}
                  >
                    <Sagoma id={c.sagoma} colore={coloreDi(c)} />
                    <span>{c.nome}</span>
                    {aggiunti[c.id] ? <b className="rapida-conta">+{aggiunti[c.id]}</b> : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <button type="button" className="bottone primario largo fisso-foglio" onClick={chiudi}>
          {totale === 0 ? 'Chiudi' : `Fatto: ${totale === 1 ? '1 capo aggiunto' : `${totale} capi aggiunti`}`}
        </button>
      </div>
    </Foglio>
  );
}
