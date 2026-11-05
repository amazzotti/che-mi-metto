function inData(giorno: string): Date {
  return new Date(`${giorno}T12:00:00Z`);
}

const LUNGO = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const SETTIMANA = new Intl.DateTimeFormat('it-IT', { weekday: 'short', timeZone: 'UTC' });
const NUMERO = new Intl.DateTimeFormat('it-IT', { day: 'numeric', timeZone: 'UTC' });

function maiuscola(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Giovedì 5 novembre". */
export function giornoEsteso(giorno: string): string {
  return maiuscola(LUNGO.format(inData(giorno)));
}

/** "Gio". */
export function giornoBreve(giorno: string): string {
  return maiuscola(SETTIMANA.format(inData(giorno)).replace('.', ''));
}

export function numeroGiorno(giorno: string): string {
  return NUMERO.format(inData(giorno));
}

export function aggiungiGiorni(giorno: string, n: number): string {
  const d = inData(giorno);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** "Oggi", "Domani" oppure il giorno della settimana. */
export function nomeRelativo(giorno: string, oggi: string): string {
  if (giorno === oggi) return 'Oggi';
  if (giorno === aggiungiGiorni(oggi, 1)) return 'Domani';
  return giornoEsteso(giorno);
}

/** Data locale del dispositivo "AAAA-MM-GG". */
export function oggiDispositivo(adesso = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${adesso.getFullYear()}-${p(adesso.getMonth() + 1)}-${p(adesso.getDate())}`;
}
