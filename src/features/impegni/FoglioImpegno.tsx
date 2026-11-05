import { type FormEvent, useState } from 'react';
import { giornoEsteso } from '../../shared/date';
import { type Impegno, OCCASIONI, type Occasione } from '../../shared/tipi';
import { Foglio } from '../../shared/ui/Foglio';
import { Scelta } from '../../shared/ui/Scelta';
import { aggiornaImpegno, aggiungiImpegno } from './impegni';

interface Props {
  aperto: boolean;
  data: string;
  /** Se presente, si modifica questo impegno. */
  impegno?: Impegno;
  onChiudi: () => void;
}

const SUGGERIMENTI: Record<Occasione, string> = {
  casual: 'Es. Giro in centro',
  lavoro: 'Es. Riunione in ufficio',
  appuntamento: 'Es. Cena a due',
  aperitivo: 'Es. Spritz con gli amici',
  elegante: 'Es. Matrimonio di Giulia',
  sport: 'Es. Palestra',
};

export function FoglioImpegno({ aperto, data, impegno, onChiudi }: Props) {
  return (
    <Foglio aperto={aperto} titolo={impegno ? 'Modifica impegno' : 'Nuovo impegno'} onChiudi={onChiudi}>
      {/* La chiave azzera il modulo a ogni apertura. */}
      {aperto && <Modulo key={impegno?.id ?? 'nuovo'} data={data} impegno={impegno} onFatto={onChiudi} />}
    </Foglio>
  );
}

function Modulo({ data, impegno, onFatto }: { data: string; impegno?: Impegno; onFatto: () => void }) {
  const [titolo, setTitolo] = useState(impegno?.titolo ?? '');
  const [ora, setOra] = useState(impegno?.ora ?? '20:00');
  const [occasione, setOccasione] = useState<Occasione>(impegno?.occasione ?? 'appuntamento');
  const [errore, setErrore] = useState<string | null>(null);

  const salva = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{2}:\d{2}$/.test(ora)) {
      setErrore("Scegli un'ora.");
      return;
    }
    const nome = titolo.trim() || OCCASIONI.find((o) => o.id === occasione)!.nome;
    if (impegno) await aggiornaImpegno(impegno.id, { titolo: nome, ora, occasione });
    else await aggiungiImpegno({ data, ora, titolo: nome, occasione });
    onFatto();
  };

  return (
    <form onSubmit={salva} className="modulo">
      <p className="nota-piccola">{giornoEsteso(data)}</p>
      <div className="campo">
        <span>Che tipo di impegno?</span>
        <Scelta etichetta="Occasione" opzioni={OCCASIONI.map((o) => ({ id: o.id, nome: o.nome }))} valore={occasione} onCambia={setOccasione} stile="chip" />
      </div>
      <label className="campo">
        <span>Nome (facoltativo)</span>
        <input value={titolo} onChange={(e) => setTitolo(e.target.value)} placeholder={SUGGERIMENTI[occasione]} maxLength={60} />
      </label>
      <label className="campo">
        <span>A che ora?</span>
        <input type="time" value={ora} onChange={(e) => setOra(e.target.value)} required />
      </label>
      {errore && (
        <p className="avviso" role="alert">
          {errore}
        </p>
      )}
      <button type="submit" className="bottone primario largo">
        {impegno ? 'Salva modifiche' : 'Aggiungi impegno'}
      </button>
    </form>
  );
}
