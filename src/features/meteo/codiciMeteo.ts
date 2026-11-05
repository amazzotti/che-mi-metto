export type IconaMeteoId =
  | 'sereno'
  | 'poco-nuvoloso'
  | 'nuvoloso'
  | 'nebbia'
  | 'pioviggine'
  | 'pioggia'
  | 'neve'
  | 'temporale';

interface InfoCodice {
  descrizione: string;
  icona: IconaMeteoId;
}

/** Codici meteo WMO usati da Open-Meteo. */
const CODICI: Record<number, InfoCodice> = {
  0: { descrizione: 'Sereno', icona: 'sereno' },
  1: { descrizione: 'Prevalentemente sereno', icona: 'sereno' },
  2: { descrizione: 'Parzialmente nuvoloso', icona: 'poco-nuvoloso' },
  3: { descrizione: 'Coperto', icona: 'nuvoloso' },
  45: { descrizione: 'Nebbia', icona: 'nebbia' },
  48: { descrizione: 'Nebbia con brina', icona: 'nebbia' },
  51: { descrizione: 'Pioviggine leggera', icona: 'pioviggine' },
  53: { descrizione: 'Pioviggine', icona: 'pioviggine' },
  55: { descrizione: 'Pioviggine intensa', icona: 'pioviggine' },
  56: { descrizione: 'Pioviggine gelata', icona: 'pioviggine' },
  57: { descrizione: 'Pioviggine gelata intensa', icona: 'pioviggine' },
  61: { descrizione: 'Pioggia debole', icona: 'pioggia' },
  63: { descrizione: 'Pioggia', icona: 'pioggia' },
  65: { descrizione: 'Pioggia forte', icona: 'pioggia' },
  66: { descrizione: 'Pioggia gelata', icona: 'pioggia' },
  67: { descrizione: 'Pioggia gelata forte', icona: 'pioggia' },
  71: { descrizione: 'Neve debole', icona: 'neve' },
  73: { descrizione: 'Neve', icona: 'neve' },
  75: { descrizione: 'Neve forte', icona: 'neve' },
  77: { descrizione: 'Nevischio', icona: 'neve' },
  80: { descrizione: 'Rovesci deboli', icona: 'pioggia' },
  81: { descrizione: 'Rovesci', icona: 'pioggia' },
  82: { descrizione: 'Rovesci violenti', icona: 'pioggia' },
  85: { descrizione: 'Rovesci di neve', icona: 'neve' },
  86: { descrizione: 'Forti rovesci di neve', icona: 'neve' },
  95: { descrizione: 'Temporale', icona: 'temporale' },
  96: { descrizione: 'Temporale con grandine', icona: 'temporale' },
  99: { descrizione: 'Temporale con grandine forte', icona: 'temporale' },
};

export function infoCodice(codice: number): InfoCodice {
  return CODICI[codice] ?? { descrizione: 'Variabile', icona: 'poco-nuvoloso' };
}

export function codiceNeve(codice: number): boolean {
  return [71, 73, 75, 77, 85, 86].includes(codice);
}

export function codicePioggia(codice: number): boolean {
  return (codice >= 51 && codice <= 67) || (codice >= 80 && codice <= 82) || codice >= 95;
}
