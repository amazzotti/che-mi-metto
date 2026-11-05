import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { AUTUNNO, preparaPagina, primoAvvio } from './aiuti';
import { curvaGiornaliera } from '../src/test/meteoFinto';

const FOTO = fileURLToPath(new URL('./fixture/maglione.jpg', import.meta.url));

test.describe('Che mi metto?', () => {
  test('primo avvio, meteo e outfit del giorno', async ({ page }) => {
    await preparaPagina(page);
    await primoAvvio(page);

    await expect(page.getByRole('heading', { name: 'Outfit per oggi' })).toBeVisible();
    await expect(page.locator('.temperatura')).toContainText('°');
    await expect(page.getByText('Fine autunno', { exact: true })).toBeVisible();
    const capi = page.getByRole('list', { name: 'Capi consigliati' });
    await expect(capi.locator('[data-slot="capospalla"]')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Rimini' })).toBeVisible();

    // Il profilo resta salvato: ricaricando non riparte la presentazione.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Outfit per oggi' })).toBeVisible();
  });

  test('tutto sta nello schermo del telefono, senza scorrimento orizzontale', async ({ page }) => {
    await preparaPagina(page);
    await primoAvvio(page);
    for (const scheda of ['Oggi', 'Settimana', 'Armadio', 'Profilo']) {
      await page.getByRole('navigation', { name: 'Sezioni' }).getByRole('link', { name: scheda }).click();
      const larghezze = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      expect(larghezze[0], scheda).toBeLessThanOrEqual(larghezze[1]);
    }
  });

  test('occasioni: uscita elegante e palestra', async ({ page }) => {
    await preparaPagina(page);
    await primoAvvio(page, 'Uomo');
    const capi = page.getByRole('list', { name: 'Capi consigliati' });

    await page.getByRole('button', { name: 'Elegante', exact: true }).click();
    await expect(capi.getByText('Pantaloni eleganti')).toBeVisible();
    await expect(capi.getByText('Scarpe eleganti')).toBeVisible();

    await page.getByRole('button', { name: 'Palestra', exact: true }).click();
    await expect(capi.getByText('Pantaloni della tuta')).toBeVisible();
    const idea = page.getByRole('tabpanel').first();
    await expect(idea.getByText('In borsa')).toBeVisible();
    await expect(idea.getByText('Asciugamano')).toBeVisible();

    // Tre idee da sfogliare col dito: la seconda è diversa dalla prima.
    await page.getByRole('button', { name: 'Casual', exact: true }).click();
    const prima = await capi.textContent();
    await expect(page.getByRole('tablist', { name: 'Idee di outfit' }).getByRole('tab')).toHaveCount(3);
    await page.getByRole('tablist', { name: 'Idee di outfit' }).getByRole('tab').nth(1).click();
    await expect(capi).not.toHaveText(prima ?? '');
    await page.getByRole('button', { name: 'Altre idee' }).click();
    await expect(page.getByRole('tablist', { name: 'Idee di outfit' }).getByRole('tab').first()).toHaveAttribute('aria-selected', 'true');
  });

  test('settimana: giorno di pioggia e impegno serale', async ({ page }) => {
    await preparaPagina(page);
    await primoAvvio(page);
    await page.getByRole('link', { name: 'Settimana' }).click();
    await page.getByRole('tab', { name: /Sab/ }).click();
    await expect(page.getByRole('tabpanel').first().getByText(/Pioggia probabile \(80%\)/)).toBeVisible();
    await expect(page.getByRole('list', { name: 'Accessori' }).first()).toContainText('Ombrello');

    await page.getByRole('button', { name: 'Aggiungi', exact: true }).click();
    const dialogo = page.getByRole('dialog', { name: 'Nuovo impegno' });
    await dialogo.getByRole('button', { name: 'Uscita elegante' }).click();
    await dialogo.getByRole('textbox', { name: 'Nome (facoltativo)' }).fill('Cena di anniversario');
    await dialogo.locator('input[type="time"]').fill('20:30');
    await dialogo.getByRole('button', { name: 'Aggiungi impegno' }).click();

    const impegno = page.locator('.impegno', { hasText: 'Cena di anniversario' });
    await expect(impegno).toContainText('20:30');
    await expect(impegno).toContainText('Uscita elegante');
    await expect(impegno.getByRole('list', { name: 'Capi consigliati' })).toBeVisible();
    // Il pallino segnala l'impegno nella striscia dei giorni.
    await expect(page.getByRole('tab', { name: /Sab/ }).locator('.pallino')).toBeVisible();

    page.once('dialog', (d) => d.accept());
    await impegno.getByRole('button', { name: /Elimina/ }).click();
    await expect(impegno).toHaveCount(0);
  });

  test('armadio: carico una foto e il consiglio usa il mio capo', async ({ page }) => {
    await preparaPagina(page, { ...AUTUNNO, temperatura: curvaGiornaliera(4, 9) });
    await primoAvvio(page);
    await page.getByRole('link', { name: 'Armadio' }).click();
    await expect(page.getByText('Il tuo armadio è vuoto.')).toBeVisible();

    await page.getByRole('button', { name: 'Aggiungi capo' }).click();
    const dialogo = page.getByRole('dialog', { name: 'Nuovo capo' });
    await dialogo.getByLabel('Foto del capo').setInputFiles(FOTO);
    await expect(dialogo.getByText(/Colore rilevato dalla foto: bordeaux/)).toBeVisible();
    await dialogo.getByRole('combobox').selectOption('maglione');
    await dialogo.getByRole('textbox', { name: 'Nome (facoltativo)' }).fill('Maglione della nonna');
    await dialogo.getByRole('button', { name: "Aggiungi all'armadio" }).click();

    await expect(page.getByRole('button', { name: 'Maglione della nonna, bordeaux' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Maglione della nonna, bordeaux' }).locator('img')).toBeVisible();

    await page.getByRole('link', { name: 'Oggi' }).click();
    const capi = page.getByRole('list', { name: 'Capi consigliati' });
    await expect(capi.getByText('Maglione della nonna')).toBeVisible();
    await expect(capi.getByText('Tuo')).toBeVisible();
    await expect(page.getByRole('tabpanel').first().getByText(/Nel tuo armadio non ho trovato/)).toBeVisible();
  });

  test('lucchetto e aggiunta rapida', async ({ page }) => {
    await preparaPagina(page);
    await primoAvvio(page);

    // Tengo fissa la parte di sotto e chiedo altre idee: resta sempre quella.
    const idea = page.getByRole('tabpanel').first();
    const sotto = idea.locator('[data-slot="sotto"], [data-slot="intero"]').first();
    const nome = (await sotto.locator('strong').textContent())!;
    await sotto.getByRole('button', { name: `Tieni fisso ${nome}` }).click();
    await page.getByRole('button', { name: 'Altre idee' }).click();
    await expect(page.getByRole('tabpanel').first().getByRole('button', { name: `Sblocca ${nome}` })).toBeVisible();

    // Aggiunta rapida: due capi in due tocchi.
    await page.getByRole('link', { name: 'Armadio' }).click();
    await page.getByRole('button', { name: 'Aggiunta rapida' }).click();
    const dialogo = page.getByRole('dialog', { name: 'Aggiunta rapida' });
    await dialogo.getByRole('button', { name: 'Aggiungi Jeans' }).click();
    await dialogo.getByRole('button', { name: 'Aggiungi Gonna', exact: true }).click();
    await dialogo.getByRole('button', { name: 'Fatto: 2 capi aggiunti' }).click();
    await expect(page.getByText('2 capi')).toBeVisible();
  });

  test('profilo: cambio genere e scarico il backup', async ({ page }) => {
    await preparaPagina(page);
    await primoAvvio(page);
    await page.getByRole('link', { name: 'Profilo' }).click();
    await page.getByRole('group', { name: 'Genere' }).getByRole('button', { name: 'Uomo' }).click();
    await expect(page.getByRole('group', { name: 'Genere' }).getByRole('button', { name: 'Uomo' })).toHaveAttribute('aria-pressed', 'true');

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Esporta backup' }).click();
    expect((await download).suggestedFilename()).toBe('che-mi-metto-backup-2026-11-05.json');
  });

  test('posizione dal GPS del telefono', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 44.494, longitude: 11.343 });
    await preparaPagina(page);
    await page.goto('./');
    await page.getByRole('button', { name: 'Donna', exact: true }).click();
    await page.getByRole('button', { name: 'Usa la mia posizione' }).click();
    await expect(page.getByText('Bologna')).toBeVisible();
    await page.getByRole('button', { name: 'Iniziamo' }).click();
    await expect(page.getByRole('button', { name: /Luogo: Bologna/ })).toBeVisible();
  });

  test('se la rete non risponde lo dice e permette di riprovare', async ({ page }) => {
    await preparaPagina(page);
    await primoAvvio(page);
    await page.route('**/api.open-meteo.com/**', (r) => r.abort());
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByRole('alert')).toContainText('Meteo non disponibile');
    await expect(page.getByRole('button', { name: 'Riprova' })).toBeVisible();
  });

  test('la app è installabile (manifest e icone)', async ({ page, request }) => {
    await page.goto('./');
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBeTruthy();
    const manifest = await (await request.get(href!)).json();
    expect(manifest.name).toBe('Che mi metto?');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', /apple-touch-icon/);
  });
});
