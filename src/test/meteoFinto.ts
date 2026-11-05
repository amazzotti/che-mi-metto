/**
 * Crea risposte finte di Open-Meteo, usate sia dai test unitari sia dai test end-to-end.
 * Così le prove non dipendono dal meteo vero.
 */
export interface OpzioniMeteoFinto {
  /** Primo giorno "AAAA-MM-GG". */
  inizio: string;
  giorni?: number;
  latitudine?: number;
  longitudine?: number;
  /** Ora attuale "HH:MM" nel luogo. */
  oraAttuale?: string;
  temperatura?: (giorno: number, ora: number) => number;
  probPioggia?: (giorno: number, ora: number) => number;
  pioggia?: (giorno: number, ora: number) => number;
  codice?: (giorno: number, ora: number) => number;
  vento?: (giorno: number, ora: number) => number;
  uv?: (giorno: number, ora: number) => number;
}

function aggiungiGiorni(data: string, n: number): string {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Temperatura tipica: minima all'alba, massima nel primo pomeriggio. */
export function curvaGiornaliera(min: number, max: number) {
  return (_g: number, h: number) => {
    const x = Math.cos(((h - 15) / 24) * 2 * Math.PI);
    return Math.round((min + ((max - min) * (x + 1)) / 2) * 10) / 10;
  };
}

export function rispostaMeteoFinta(o: OpzioniMeteoFinto) {
  const giorni = o.giorni ?? 7;
  const temp = o.temperatura ?? curvaGiornaliera(8, 16);
  const prob = o.probPioggia ?? (() => 10);
  const mm = o.pioggia ?? ((g: number, h: number) => (prob(g, h) >= 60 ? 0.8 : 0));
  const cod = o.codice ?? ((g: number, h: number) => (prob(g, h) >= 60 ? 61 : 2));
  const vento = o.vento ?? (() => 12);
  const uv = o.uv ?? ((_g: number, h: number) => (h >= 10 && h <= 16 ? 3 : 0));
  const pad = (n: number) => String(n).padStart(2, '0');

  const ore: { time: string; g: number; h: number }[] = [];
  for (let g = 0; g < giorni; g++) {
    const data = aggiungiGiorni(o.inizio, g);
    for (let h = 0; h < 24; h++) ore.push({ time: `${data}T${pad(h)}:00`, g, h });
  }
  const percepita = (g: number, h: number) => Math.round((temp(g, h) - 1.5) * 10) / 10;
  const oraAttuale = o.oraAttuale ?? '10:00';
  const hAtt = Number(oraAttuale.slice(0, 2));

  const daily = Array.from({ length: giorni }, (_, g) => {
    const hh = Array.from({ length: 24 }, (_, h) => h);
    return {
      time: aggiungiGiorni(o.inizio, g),
      weather_code: Math.max(...hh.filter((h) => h >= 8 && h <= 20).map((h) => cod(g, h))),
      temperature_2m_max: Math.max(...hh.map((h) => temp(g, h))),
      temperature_2m_min: Math.min(...hh.map((h) => temp(g, h))),
      apparent_temperature_max: Math.max(...hh.map((h) => percepita(g, h))),
      apparent_temperature_min: Math.min(...hh.map((h) => percepita(g, h))),
      precipitation_probability_max: Math.max(...hh.map((h) => prob(g, h))),
      precipitation_sum: Math.round(hh.reduce((s, h) => s + mm(g, h), 0) * 10) / 10,
      wind_speed_10m_max: Math.max(...hh.map((h) => vento(g, h))),
      uv_index_max: Math.max(...hh.map((h) => uv(g, h))),
      sunrise: `${aggiungiGiorni(o.inizio, g)}T06:55`,
      sunset: `${aggiungiGiorni(o.inizio, g)}T16:58`,
    };
  });

  return {
    latitude: o.latitudine ?? 44.06,
    longitude: o.longitudine ?? 12.57,
    timezone: 'Europe/Rome',
    utc_offset_seconds: 3600,
    current: {
      time: `${o.inizio}T${oraAttuale}`,
      temperature_2m: temp(0, hAtt),
      apparent_temperature: percepita(0, hAtt),
      relative_humidity_2m: 70,
      is_day: hAtt >= 7 && hAtt < 17 ? 1 : 0,
      weather_code: cod(0, hAtt),
      wind_speed_10m: vento(0, hAtt),
    },
    hourly: {
      time: ore.map((x) => x.time),
      temperature_2m: ore.map((x) => temp(x.g, x.h)),
      apparent_temperature: ore.map((x) => percepita(x.g, x.h)),
      precipitation_probability: ore.map((x) => prob(x.g, x.h)),
      precipitation: ore.map((x) => mm(x.g, x.h)),
      weather_code: ore.map((x) => cod(x.g, x.h)),
      wind_speed_10m: ore.map((x) => vento(x.g, x.h)),
      uv_index: ore.map((x) => uv(x.g, x.h)),
    },
    daily: {
      time: daily.map((d) => d.time),
      weather_code: daily.map((d) => d.weather_code),
      temperature_2m_max: daily.map((d) => d.temperature_2m_max),
      temperature_2m_min: daily.map((d) => d.temperature_2m_min),
      apparent_temperature_max: daily.map((d) => d.apparent_temperature_max),
      apparent_temperature_min: daily.map((d) => d.apparent_temperature_min),
      precipitation_probability_max: daily.map((d) => d.precipitation_probability_max),
      precipitation_sum: daily.map((d) => d.precipitation_sum),
      wind_speed_10m_max: daily.map((d) => d.wind_speed_10m_max),
      uv_index_max: daily.map((d) => d.uv_index_max),
      sunrise: daily.map((d) => d.sunrise),
      sunset: daily.map((d) => d.sunset),
    },
  };
}

/** Istante (ms) che corrisponde all'ora locale indicata, con scarto UTC +1h. */
export function istanteLocale(data: string, ora: string): number {
  return Date.parse(`${data}T${ora}:00Z`) - 3600 * 1000;
}
