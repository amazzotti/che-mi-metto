import { useRegisterSW } from 'virtual:pwa-register/react';

/** Quando esce una nuova versione, chiede se aggiornare (così non si perde quello che si sta facendo). */
export function AggiornamentoPwa() {
  const {
    needRefresh: [daAggiornare, setDaAggiornare],
    updateServiceWorker,
  } = useRegisterSW();
  if (!daAggiornare) return null;
  return (
    <div className="avviso-aggiornamento" role="status">
      <span>È disponibile una nuova versione.</span>
      <button type="button" className="bottone piccolo primario" onClick={() => void updateServiceWorker(true)}>
        Aggiorna
      </button>
      <button type="button" className="bottone piccolo" onClick={() => setDaAggiornare(false)}>
        Dopo
      </button>
    </div>
  );
}
