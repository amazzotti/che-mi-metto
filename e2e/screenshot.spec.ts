/**
 * Genera le anteprime del README in docs/screenshots (npm run screenshots).
 * Usa dati finti: meteo d'autunno a Rimini e un piccolo armadio caricato da backup.
 */
import { type Page, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { OGGI, preparaPagina, primoAvvio } from './aiuti';

const CARTELLA = fileURLToPath(new URL('../docs/screenshots/', import.meta.url));
const FOTO = readFileSync(new URL('./fixture/maglione.jpg', import.meta.url)).toString('base64');

let n = 0;
const capo = (categoria: string, colore: string, nome?: string, occasioni = ['casual', 'lavoro', 'appuntamento', 'aperitivo', 'elegante'], foto?: string) => ({
  id: `capo-${++n}`,
  categoria,
  colore,
  nome,
  occasioni,
  impermeabile: categoria === 'trench',
  creato: n,
  ...(foto ? { foto: `data:image/jpeg;base64,${foto}` } : {}),
});

const BACKUP = {
  app: 'che-mi-metto',
  versione: 1,
  esportato: `${OGGI}T09:00:00.000Z`,
  profilo: { genere: 'donna', sensibilita: 'normale', posizione: { nome: 'Rimini', lat: 44.06, lon: 12.57, origine: 'ricerca' } },
  capi: [
    capo('maglione', '#762030', 'Maglione della nonna', ['casual', 'lavoro', 'appuntamento'], FOTO),
    capo('jeans', '#4a6b8a', 'Jeans a vita alta'),
    capo('gonna-lunga', '#c19a6b', 'Gonna midi plissé'),
    capo('blusa', '#efe8dc', 'Blusa in seta'),
    capo('dolcevita', '#151515'),
    capo('trench', '#d2bc98', 'Trench beige'),
    capo('cappotto', '#1f2a44'),
    capo('stivaletti', '#6b4a32'),
    capo('sneakers', '#ffffff'),
    capo('vestito', '#6d1a2c', 'Vestito bordeaux', ['appuntamento', 'elegante', 'aperitivo']),
    capo('sciarpa', '#c9971c'),
    capo('borsa', '#3a3d42'),
  ],
  impegni: [
    { id: 'imp-1', data: '2026-11-07', ora: '20:30', titolo: 'Cena di anniversario', occasione: 'elegante' },
    { id: 'imp-2', data: '2026-11-05', ora: '18:30', titolo: 'Palestra', occasione: 'sport' },
  ],
};

async function foto(page: Page, nome: string) {
  // Niente evidenziazioni rimaste dall'ultimo tocco.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${CARTELLA}${nome}.png` });
}

/** Porta l'elemento in cima allo schermo, appena sotto la testata. */
async function mostraDallAlto(page: Page, selettore: string) {
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) throw new Error(`Non trovo ${s}`);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76 });
  }, selettore);
}

async function caricaBackup(page: Page) {
  await page.getByRole('link', { name: 'Profilo' }).click();
  page.once('dialog', (d) => d.accept());
  await page.getByLabel('File di backup').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(BACKUP)),
  });
  await page.getByText('Backup ripristinato.').waitFor();
}

test.use({ deviceScaleFactor: 2 });

test('anteprime per il README', async ({ page }) => {
  await preparaPagina(page);
  await page.goto('./');
  await page.getByRole('button', { name: 'Donna', exact: true }).click();
  await foto(page, '01-benvenuto');

  await primoAvvio(page);
  await caricaBackup(page);
  // Il banner per installare su iPhone lo nascondiamo nelle anteprime.
  await page.evaluate(() => localStorage.setItem('banner-installa-chiuso', '1'));

  await page.getByRole('link', { name: 'Oggi' }).click();
  await page.reload();
  await page.getByRole('heading', { name: 'Outfit per oggi' }).waitFor();
  await foto(page, '02-oggi');

  await mostraDallAlto(page, '.outfit');
  await foto(page, '03-outfit-armadio');

  await page.getByRole('link', { name: 'Settimana' }).click();
  await page.getByRole('tab', { name: /Sab/ }).click();
  await foto(page, '04-settimana');
  await mostraDallAlto(page, '.impegno');
  await foto(page, '05-impegno-elegante');

  await page.getByRole('link', { name: 'Armadio' }).click();
  await foto(page, '06-armadio');

  await page.getByRole('button', { name: 'Aggiungi capo' }).click();
  await page.getByRole('dialog', { name: 'Nuovo capo' }).waitFor();
  await foto(page, '07-nuovo-capo');
  await page.keyboard.press('Escape');

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByRole('link', { name: 'Oggi' }).click();
  await page.getByRole('button', { name: 'Elegante', exact: true }).click();
  await foto(page, '08-tema-scuro');
});

test('galleria delle sagome', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 820 });
  await page.goto('./galleria.html');
  await page.locator('svg').first().waitFor();
  await foto(page, '09-sagome');
});
