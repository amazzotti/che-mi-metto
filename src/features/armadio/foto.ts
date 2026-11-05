import { coloreDominante } from '../outfit/colori';

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

/**
 * Ridimensiona e comprime la foto (JPEG) e ne stima il colore principale,
 * guardando la parte centrale dove di solito sta il capo.
 */
export async function preparaFoto(file: Blob): Promise<{ foto: Blob; colore: string | null }> {
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

  const campione = document.createElement('canvas');
  campione.width = 48;
  campione.height = 48;
  const cctx = campione.getContext('2d');
  let colore: string | null = null;
  if (cctx) {
    cctx.drawImage(tela, w * 0.25, h * 0.2, w * 0.5, h * 0.6, 0, 0, 48, 48);
    colore = coloreDominante(cctx.getImageData(0, 0, 48, 48).data);
  }

  const foto = await new Promise<Blob>((risolvi, rifiuta) =>
    tela.toBlob((b) => (b ? risolvi(b) : rifiuta(new Error('Compressione non riuscita'))), 'image/jpeg', 0.82),
  );
  return { foto, colore };
}
