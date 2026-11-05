import { coloreDominante } from '../outfit/colori';
import { rimuoviSfondo } from './sfondo';

/** Lato massimo della foto salvata: basta per lo schermo del telefono e pesa poco (~80 KB). */
export const LATO_MASSIMO = 900;

function caricaImmagine(file: Blob): Promise<HTMLImageElement> {
  return new Promise((risolvi, rifiuta) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      risolvi(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      rifiuta(new Error('Non riesco ad aprire questa foto'));
    };
    img.src = url;
  });
}

export function misureRidotte(larghezza: number, altezza: number, lato = LATO_MASSIMO): { w: number; h: number } {
  const scala = Math.min(1, lato / Math.max(larghezza, altezza));
  return { w: Math.max(1, Math.round(larghezza * scala)), h: Math.max(1, Math.round(altezza * scala)) };
}

function inBlob(tela: HTMLCanvasElement, tipo: string, qualita?: number): Promise<Blob | null> {
  return new Promise((risolvi) => tela.toBlob(risolvi, tipo, qualita));
}

/**
 * Ridimensiona e comprime la foto (JPEG), prova a togliere lo sfondo (immagine con trasparenza)
 * e stima il colore principale del capo.
 */
export async function preparaFoto(file: Blob): Promise<{ foto: Blob; ritaglio: Blob | null; colore: string | null }> {
  const img = await caricaImmagine(file);
  const { w, h } = misureRidotte(img.naturalWidth, img.naturalHeight);
  const tela = document.createElement('canvas');
  tela.width = w;
  tela.height = h;
  const ctx = tela.getContext('2d');
  if (!ctx) throw new Error('Il browser non riesce a elaborare la foto');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const foto = await inBlob(tela, 'image/jpeg', 0.82);
  if (!foto) throw new Error('Compressione non riuscita');

  // Sfondo: se si riesce a staccare il capo, il colore si calcola solo sul capo.
  const esito = rimuoviSfondo(ctx.getImageData(0, 0, w, h).data, w, h);
  let ritaglio: Blob | null = null;
  let colore: string | null = null;
  if (esito) {
    const tagliata = document.createElement('canvas');
    tagliata.width = esito.larghezza;
    tagliata.height = esito.altezza;
    const tctx = tagliata.getContext('2d');
    if (tctx) {
      tctx.putImageData(new ImageData(esito.pixel, esito.larghezza, esito.altezza), 0, 0);
      // WebP con trasparenza dove il browser lo sa fare, altrimenti PNG.
      ritaglio = await inBlob(tagliata, 'image/webp', 0.85);
      if (!ritaglio || ritaglio.type !== 'image/webp') ritaglio = await inBlob(tagliata, 'image/png');
      colore = coloreDominante(esito.pixel);
    }
  }
  if (!colore) {
    const campione = document.createElement('canvas');
    campione.width = 48;
    campione.height = 48;
    const cctx = campione.getContext('2d');
    if (cctx) {
      cctx.drawImage(tela, w * 0.25, h * 0.2, w * 0.5, h * 0.6, 0, 0, 48, 48);
      colore = coloreDominante(cctx.getImageData(0, 0, 48, 48).data);
    }
  }
  return { foto, ritaglio, colore };
}
