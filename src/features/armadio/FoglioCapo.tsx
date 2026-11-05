import { type ChangeEvent, type FormEvent, useId, useState } from 'react';
import { type Capo, type Genere, OCCASIONI, type Occasione } from '../../shared/tipi';
import { Foglio } from '../../shared/ui/Foglio';
import { IconaCestino, IconaFoto } from '../../shared/ui/Icone';
import { Scelta, SceltaMultipla } from '../../shared/ui/Scelta';
import { type CategoriaId, categoria, categoriePerGenere, NOMI_SLOT } from '../outfit/catalogo';
import { COLORI, eChiaro, nomeColore } from '../outfit/colori';
import { descriviColore, type Fantasia, FANTASIE } from '../outfit/fantasie';
import { Figura } from '../outfit/SchedaOutfit';
import { aggiornaCapo, aggiungiCapo, eliminaCapo } from './armadio';
import { preparaFoto } from './foto';

interface Props {
  aperto: boolean;
  capo?: Capo;
  genere: Genere;
  onChiudi: () => void;
}

export function FoglioCapo({ aperto, capo, genere, onChiudi }: Props) {
  return (
    <Foglio aperto={aperto} titolo={capo ? 'Modifica capo' : 'Nuovo capo'} onChiudi={onChiudi}>
      {aperto && <Modulo key={capo?.id ?? 'nuovo'} capo={capo} genere={genere} onFatto={onChiudi} />}
    </Foglio>
  );
}

function Modulo({ capo, genere, onFatto }: { capo?: Capo; genere: Genere; onFatto: () => void }) {
  const idFoto = useId();
  const [tipo, setTipo] = useState<CategoriaId>(capo?.categoria ?? 'tshirt');
  const [colore, setColore] = useState(capo?.colore ?? '#1f2a44');
  const [fantasia, setFantasia] = useState<Fantasia>(capo?.fantasia ?? 'unita');
  const [colore2, setColore2] = useState(capo?.colore2 ?? '#ffffff');
  const [nome, setNome] = useState(capo?.nome ?? '');
  const [occasioni, setOccasioni] = useState<Occasione[]>(capo?.occasioni ?? [...categoria('tshirt').occasioni]);
  const [impermeabile, setImpermeabile] = useState(capo?.impermeabile ?? false);
  const [foto, setFoto] = useState<Blob | undefined>(capo?.foto);
  const [lavoro, setLavoro] = useState(false);
  const [messaggio, setMessaggio] = useState<string | null>(null);

  const info = categoria(tipo);
  const gruppi = categoriePerGenere(genere);
  // Se il capo è di una categoria dell'altro genere (es. backup condiviso), la teniamo comunque.
  const tipoPresente = gruppi.some((g) => g.categorie.some((c) => c.id === tipo));

  const cambiaTipo = (id: CategoriaId) => {
    setTipo(id);
    setOccasioni([...categoria(id).occasioni]);
    setImpermeabile(Boolean(categoria(id).pioggia && categoria(id).slot === 'capospalla'));
  };

  const scegliFoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLavoro(true);
    setMessaggio(null);
    try {
      const r = await preparaFoto(file);
      setFoto(r.foto);
      if (r.colore) {
        setColore(r.colore);
        setMessaggio(`Colore rilevato dalla foto: ${nomeColore(r.colore)}. Puoi cambiarlo qui sotto.`);
      }
    } catch (err) {
      setMessaggio(err instanceof Error ? err.message : 'Foto non valida');
    } finally {
      setLavoro(false);
    }
  };

  const salva = async (e: FormEvent) => {
    e.preventDefault();
    if (occasioni.length === 0) {
      setMessaggio('Scegli almeno una occasione in cui lo metteresti.');
      return;
    }
    const conFantasia = fantasia !== 'unita';
    const dati = {
      categoria: tipo,
      colore,
      fantasia: conFantasia ? fantasia : undefined,
      colore2: conFantasia ? colore2 : undefined,
      nome: nome.trim() || undefined,
      occasioni,
      impermeabile,
      foto,
    };
    try {
      if (capo) await aggiornaCapo(capo.id, dati);
      else await aggiungiCapo(dati);
      onFatto();
    } catch (err) {
      setMessaggio(`Non sono riuscito a salvare il capo: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const elimina = async () => {
    if (capo && confirm('Eliminare questo capo dal tuo armadio?')) {
      await eliminaCapo(capo.id);
      onFatto();
    }
  };

  return (
    <form className="modulo" onSubmit={salva}>
      <div className="anteprima-capo">
        <div className="anteprima-figura">
          <Figura
            pezzo={{ categoria: tipo, colore, fantasia, colore2, nome: nome || info.nome, capo: foto ? ({ foto } as Capo) : undefined }}
          />
        </div>
        <div className="anteprima-azioni">
          <label htmlFor={idFoto} className="bottone secondario">
            <IconaFoto /> {foto ? 'Cambia foto' : 'Scatta o scegli foto'}
          </label>
          <input id={idFoto} type="file" accept="image/*" className="nascosto" onChange={scegliFoto} aria-label="Foto del capo" />
          {foto && (
            <button type="button" className="bottone piccolo" onClick={() => setFoto(undefined)}>
              Usa la sagoma
            </button>
          )}
          <p className="nota-piccola">{lavoro ? 'Preparo la foto…' : 'La foto resta solo su questo telefono.'}</p>
        </div>
      </div>
      {messaggio && <p className="nota-colore" role="status">{messaggio}</p>}

      <label className="campo">
        <span>Che capo è?</span>
        <select value={tipo} onChange={(e) => cambiaTipo(e.target.value as CategoriaId)}>
          {!tipoPresente && <option value={tipo}>{info.nome}</option>}
          {gruppi.map((g) => (
            <optgroup key={g.slot} label={NOMI_SLOT[g.slot]}>
              {g.categorie.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="campo">
        <span>
          {fantasia === 'unita' ? 'Colore' : 'Colore di fondo'}: <strong>{nomeColore(colore)}</strong>
        </span>
        <div className="tavolozza" role="group" aria-label="Colore">
          {COLORI.map((c) => (
            <button
              key={c.hex}
              type="button"
              className="campione"
              style={{ background: c.hex }}
              aria-label={c.nome}
              aria-pressed={colore === c.hex}
              onClick={() => setColore(c.hex)}
            />
          ))}
          <label className="campione personalizzato" title="Altro colore">
            <input type="color" value={colore} onChange={(e) => setColore(e.target.value)} aria-label="Altro colore" />
          </label>
        </div>
      </div>

      <div className="campo">
        <span>Fantasia</span>
        <Scelta
          etichetta="Fantasia"
          opzioni={FANTASIE}
          valore={fantasia}
          onCambia={(f) => {
            // Al primo passaggio a una fantasia proponiamo un secondo colore che stacchi dal primo.
            if (fantasia === 'unita' && f !== 'unita') setColore2(eChiaro(colore) ? '#1f2a44' : '#ffffff');
            setFantasia(f);
          }}
          stile="chip"
        />
      </div>

      {fantasia !== 'unita' && (
        <div className="campo">
          <span>
            Secondo colore: <strong>{descriviColore(colore, fantasia, colore2)}</strong>
          </span>
          <div className="tavolozza" role="group" aria-label="Secondo colore">
            {COLORI.map((c) => (
              <button
                key={c.hex}
                type="button"
                className="campione"
                style={{ background: c.hex }}
                aria-label={c.nome}
                aria-pressed={colore2 === c.hex}
                onClick={() => setColore2(c.hex)}
              />
            ))}
          </div>
        </div>
      )}

      <label className="campo">
        <span>Nome (facoltativo)</span>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder={`Es. ${info.nome} preferito`} maxLength={40} />
      </label>

      <div className="campo">
        <span>Quando lo metteresti?</span>
        <SceltaMultipla etichetta="Occasioni" opzioni={OCCASIONI.map((o) => ({ id: o.id, nome: o.breve }))} valori={occasioni} onCambia={setOccasioni} />
      </div>

      {(info.slot === 'capospalla' || info.slot === 'scarpe') && (
        <label className="interruttore">
          <input type="checkbox" checked={impermeabile} onChange={(e) => setImpermeabile(e.target.checked)} />
          <span>Ripara dalla pioggia</span>
        </label>
      )}

      <button type="submit" className="bottone primario largo" disabled={lavoro}>
        {capo ? 'Salva modifiche' : "Aggiungi all'armadio"}
      </button>
      {capo && (
        <button type="button" className="bottone pericolo largo" onClick={elimina}>
          <IconaCestino /> Elimina capo
        </button>
      )}
    </form>
  );
}
