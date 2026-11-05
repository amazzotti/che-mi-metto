import { useState } from 'react';
import { IconaChiudi, IconaCondividi } from '../shared/ui/Icone';

const CHIAVE = 'banner-installa-chiuso';

export function eIos(ua = navigator.userAgent, piattaforma = navigator.platform, tocchi = navigator.maxTouchPoints): boolean {
  return /iPad|iPhone|iPod/.test(ua) || (piattaforma === 'MacIntel' && tocchi > 1);
}

function installata(): boolean {
  const standalone = (navigator as Navigator & { standalone?: boolean }).standalone;
  return Boolean(standalone) || window.matchMedia?.('(display-mode: standalone)').matches === true;
}

function giaChiuso(): boolean {
  try {
    return localStorage.getItem(CHIAVE) === '1';
  } catch {
    return false;
  }
}

/** Su iPhone non c'è il pulsante "Installa": spieghiamo come aggiungere l'app alla Home. */
export function BannerInstalla() {
  const [visibile, setVisibile] = useState(() => eIos() && !installata() && !giaChiuso());
  if (!visibile) return null;
  const chiudi = () => {
    try {
      localStorage.setItem(CHIAVE, '1');
    } catch {
      /* niente */
    }
    setVisibile(false);
  };
  return (
    <aside className="banner-installa" aria-label="Installa l'app">
      <p>
        <strong>Installala sul telefono:</strong> tocca <IconaCondividi /> Condividi e poi «Aggiungi alla schermata Home».
      </p>
      <button type="button" className="bottone-icona" onClick={chiudi} aria-label="Chiudi suggerimento">
        <IconaChiudi />
      </button>
    </aside>
  );
}
