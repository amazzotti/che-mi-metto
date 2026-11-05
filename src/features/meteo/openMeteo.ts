/** Client per le API gratuite di Open-Meteo (nessuna chiave richiesta). */

export interface MeteoAttuale {
  /** Ora locale "AAAA-MM-GGTHH:MM". */
  ora: string;
  temperatura: number;
  percepita: number;
  umidita: number;
  vento: number;
  codice: number;
  giorno: boolean;
}

export interface MeteoOra {
  ora: string;
  temperatura: number;
  percepita: number;
  probPioggia: number;
  pioggia: number;
  codice: number;
  vento: number;
  uv: number;
}

export interface MeteoGiorno {
  data: string;
  codice: number;
  min: number;
  max: number;
  percepitaMin: number;
  percepitaMax: number;
  probPioggia: number;
  pioggia: number;
  ventoMax: number;
  uvMax: number;
  alba: string;
  tramonto: string;
}

export interface Previsioni {
  latitudine: number;
  longitudine: number;
  fusoOrario: string;
  /** Scarto dall'UTC in secondi, per calcolare l'ora locale del luogo. */
  scartoUtc: number;
  attuale: MeteoAttuale;
  orarie: MeteoOra[];
  giorni: MeteoGiorno[];
  scaricato: number;
}

export const URL_PREVISIONI = 'https://api.open-meteo.com/v1/forecast';

export function urlPrevisioni(lat: number, lon: number, giorni = 7): string {
  const p = new URLSearchParams({
    latitude: lat.toFixed(3),
    longitude: lon.toFixed(3),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset',
    timezone: 'auto',
    forecast_days: String(giorni),
    wind_speed_unit: 'kmh',
  });
  return `${URL_PREVISIONI}?${p.toString()}`;
}

/* Forma (parziale) della risposta di Open-Meteo. */
interface RispostaOpenMeteo {
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset_seconds: number;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: (number | null)[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    uv_index: (number | null)[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    precipitation_probability_max: (number | null)[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    uv_index_max: (number | null)[];
    sunrise: string[];
    sunset: string[];
  };
}

export function interpretaPrevisioni(dati: unknown, adesso = Date.now()): Previsioni {
  const r = dati as RispostaOpenMeteo;
  if (!r?.current || !r?.hourly?.time || !r?.daily?.time) throw new Error('Risposta meteo non valida');
  const h = r.hourly;
  const d = r.daily;
  return {
    latitudine: r.latitude,
    longitudine: r.longitude,
    fusoOrario: r.timezone,
    scartoUtc: r.utc_offset_seconds ?? 0,
    attuale: {
      ora: r.current.time,
      temperatura: r.current.temperature_2m,
      percepita: r.current.apparent_temperature,
      umidita: r.current.relative_humidity_2m,
      vento: r.current.wind_speed_10m,
      codice: r.current.weather_code,
      giorno: r.current.is_day === 1,
    },
    orarie: h.time.map((ora, i) => ({
      ora,
      temperatura: h.temperature_2m[i],
      percepita: h.apparent_temperature[i],
      probPioggia: h.precipitation_probability[i] ?? 0,
      pioggia: h.precipitation[i] ?? 0,
      codice: h.weather_code[i],
      vento: h.wind_speed_10m[i],
      uv: h.uv_index[i] ?? 0,
    })),
    giorni: d.time.map((data, i) => ({
      data,
      codice: d.weather_code[i],
      min: d.temperature_2m_min[i],
      max: d.temperature_2m_max[i],
      percepitaMin: d.apparent_temperature_min[i],
      percepitaMax: d.apparent_temperature_max[i],
      probPioggia: d.precipitation_probability_max[i] ?? 0,
      pioggia: d.precipitation_sum[i] ?? 0,
      ventoMax: d.wind_speed_10m_max[i],
      uvMax: d.uv_index_max[i] ?? 0,
      alba: d.sunrise[i],
      tramonto: d.sunset[i],
    })),
    scaricato: adesso,
  };
}

export async function scaricaPrevisioni(lat: number, lon: number, segnale?: AbortSignal): Promise<Previsioni> {
  const risposta = await fetch(urlPrevisioni(lat, lon), { signal: segnale });
  if (!risposta.ok) throw new Error(`Open-Meteo ha risposto ${risposta.status}`);
  return interpretaPrevisioni(await risposta.json());
}

/** Ora locale del luogo delle previsioni, nel formato "AAAA-MM-GGTHH:MM". */
export function oraLocale(previsioni: Pick<Previsioni, 'scartoUtc'>, adesso = Date.now()): string {
  return new Date(adesso + previsioni.scartoUtc * 1000).toISOString().slice(0, 16);
}
