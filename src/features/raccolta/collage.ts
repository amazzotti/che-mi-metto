/**
 * Collage dell'outfit da condividere: i capi uno accanto all'altro su un'immagine 1080 px di larghezza,
 * con le foto (ritagliate se possibile) o le sagome disegnate.
 */
import { createElement } from 'react';
import type { Genere } from '../../shared/tipi';
import { categoria } from '../outfit/catalogo';
import type { Pezzo } from '../outfit/motore';
import { Sagoma } from '../outfit/Sagoma';

export interface Riquadro {
  x: number;
  y: number;
  w: number;
  h: number;
}

const LARGHEZZA = 1080;
const MARGINE = 48;
const SPAZIO = 24;
const TESTATA = 150;
const PIEDE = 70;
const CELLA = (LARGHEZZA - 2 * MARGINE - SPAZIO) / 2;
const ETICHETTA = 70;
const ACCESSORIO = 150;
const ACCESSORI_PER_RIGA = 5;

/** Dove va ogni capo nel collage: due colonne di capi grandi, poi una fila di accessori piccoli. */
export function disposizione(pezzi: number, accessori: number): { larghezza: number; altezza: number; celle: Riquadro[]; piccoli: Riquadro[] } {
  const celle: Riquadro[] = [];
  const righe = Math.ceil(pezzi / 2);
  for (let i = 0; i < pezzi; i++) {
    const riga = Math.floor(i / 2);
    const ultimaDispari = i === pezzi - 1 && pezzi % 2 === 1;
    const x = ultimaDispari ? (LARGHEZZA - CELLA) / 2 : MARGINE + (i % 2) * (CELLA + SPAZIO);
    celle.push({ x, y: TESTATA + riga * (CELLA + ETICHETTA + SPAZIO), w: CELLA, h: CELLA });
  }
  const inizioAccessori = TESTATA + righe * (CELLA + ETICHETTA + SPAZIO) + 10;
  const piccoli: Riquadro[] = [];
  const passo = (LARGHEZZA - 2 * MARGINE) / ACCESSORI_PER_RIGA;
  for (let i = 0; i < accessori; i++) {
    const riga = Math.floor(i / ACCESSORI_PER_RIGA);
    piccoli.push({
      x: MARGINE + (i % ACCESSORI_PER_RIGA) * passo + (passo - ACCESSORIO) / 2,
      y: inizioAccessori + riga * (ACCESSORIO + 60),
      w: ACCESSORIO,
      h: ACCESSORIO,
    });
  }
  const righeAccessori = Math.ceil(accessori / ACCESSORI_PER_RIGA);
  const altezza = inizioAccessori + righeAccessori * (ACCESSORIO + 60) + PIEDE;
  return { larghezza: LARGHEZZA, altezza, celle, piccoli };
}

function caricaImmagine(sorgente: string): Promise<HTMLImageElement> {
  return new Promise((risolvi, rifiuta) => {
    const img = new Image();
    img.onload = () => risolvi(img);
    img.onerror = () => rifiuta(new Error('Immagine non caricata'));
    img.src = sorgente;
  });
}

async function immagineDelPezzo(p: Pezzo, genere: Genere): Promise<{ img: HTMLImageElement; libera?: () => void; foto: boolean }> {
  if (p.capo?.foto) {
    const url = URL.createObjectURL(p.capo.foto);
    return { img: await caricaImmagine(url), libera: () => URL.revokeObjectURL(url), foto: !p.capo.sfondoTolto };
  }
  const { renderToStaticMarkup } = await import('react-dom/server');
  const svg = renderToStaticMarkup(
    createElement(Sagoma, {
      id: categoria(p.categoria).sagoma,
      colore: p.colore,
      fantasia: p.fantasia,
      colore2: p.colore2,
      modello: p.modello,
      genere,
    }),
  ).replace('<svg ', '<svg width="400" height="400" ');
  return { img: await caricaImmagine(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`), foto: false };
}

function disegnaContenuto(ctx: CanvasRenderingContext2D, img: HTMLImageElement, r: Riquadro, riempi: boolean) {
  const rapporto = img.naturalWidth / img.naturalHeight || 1;
  let w: number;
  let h: number;
  if (riempi) {
    // Foto con sfondo: riempie il riquadro tagliando i bordi.
    if (rapporto > 1) {
      h = r.h;
      w = h * rapporto;
    } else {
      w = r.w;
      h = w / rapporto;
    }
  } else {
    const lato = r.w * 0.82;
    w = rapporto > 1 ? lato : lato * rapporto;
    h = rapporto > 1 ? lato / rapporto : lato;
  }
  ctx.drawImage(img, r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h);
}

function rettangoloArrotondato(ctx: CanvasRenderingContext2D, r: Riquadro, raggio: number) {
  ctx.beginPath();
  ctx.moveTo(r.x + raggio, r.y);
  ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, raggio);
  ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, raggio);
  ctx.arcTo(r.x, r.y + r.h, r.x, r.y, raggio);
  ctx.arcTo(r.x, r.y, r.x + r.w, r.y, raggio);
  ctx.closePath();
}

function testoCorto(ctx: CanvasRenderingContext2D, testo: string, larghezza: number): string {
  if (ctx.measureText(testo).width <= larghezza) return testo;
  let t = testo;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > larghezza) t = t.slice(0, -1);
  return `${t}…`;
}

export async function creaCollage(pezzi: Pezzo[], accessori: Pezzo[], titolo: string, sottotitolo: string, genere: Genere): Promise<Blob> {
  const d = disposizione(pezzi.length, accessori.length);
  const tela = document.createElement('canvas');
  tela.width = d.larghezza;
  tela.height = d.altezza;
  const ctx = tela.getContext('2d');
  if (!ctx) throw new Error('Il browser non riesce a creare l’immagine');

  ctx.fillStyle = '#f6f1ea';
  ctx.fillRect(0, 0, d.larghezza, d.altezza);
  ctx.fillStyle = '#2b2622';
  ctx.font = '600 52px Georgia, "Times New Roman", serif';
  ctx.fillText(testoCorto(ctx, titolo, d.larghezza - 2 * MARGINE), MARGINE, 78);
  ctx.fillStyle = '#75695f';
  ctx.font = '30px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(testoCorto(ctx, sottotitolo, d.larghezza - 2 * MARGINE), MARGINE, 122);

  const disegna = async (p: Pezzo, r: Riquadro, grande: boolean) => {
    ctx.fillStyle = '#efe5d7';
    rettangoloArrotondato(ctx, r, grande ? 28 : 75);
    ctx.fill();
    const { img, libera, foto } = await immagineDelPezzo(p, genere);
    ctx.save();
    rettangoloArrotondato(ctx, r, grande ? 28 : 75);
    ctx.clip();
    if (!foto) {
      ctx.shadowColor = 'rgba(60, 40, 20, 0.22)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
    }
    disegnaContenuto(ctx, img, r, foto);
    ctx.restore();
    libera?.();
    ctx.fillStyle = '#2b2622';
    if (grande) {
      ctx.font = '600 30px -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(testoCorto(ctx, p.nome, r.w), r.x, r.y + r.h + 36);
      ctx.fillStyle = '#75695f';
      ctx.font = '26px -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(testoCorto(ctx, p.nomeColore, r.w), r.x, r.y + r.h + 66);
    } else {
      ctx.font = '600 22px -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(testoCorto(ctx, p.nome, r.w + 40), r.x + r.w / 2, r.y + r.h + 32);
      ctx.textAlign = 'left';
    }
  };

  for (let i = 0; i < pezzi.length; i++) await disegna(pezzi[i], d.celle[i], true);
  for (let i = 0; i < accessori.length; i++) await disegna(accessori[i], d.piccoli[i], false);

  ctx.fillStyle = '#a4502b';
  ctx.font = '600 24px -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Che mi metto?', d.larghezza - MARGINE, d.altezza - 30);

  return new Promise((risolvi, rifiuta) => tela.toBlob((b) => (b ? risolvi(b) : rifiuta(new Error('Immagine non creata'))), 'image/png'));
}

/** Condivide l'immagine (WhatsApp, Instagram...) o, se il browser non può, la scarica. */
export async function condividiImmagine(blob: Blob, nomeFile: string, testo: string): Promise<'condiviso' | 'scaricato' | 'annullato'> {
  const file = new File([blob], nomeFile, { type: blob.type });
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: testo });
      return 'condiviso';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'annullato';
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeFile;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'scaricato';
}
