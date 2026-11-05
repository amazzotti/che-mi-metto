import type { IconaMeteoId } from './codiciMeteo';

const SOLE = '#f2b13c';
const PIOGGIA = '#5b8fd6';

function Nuvola({ x = 0, y = 0, scuro = false }: { x?: number; y?: number; scuro?: boolean }) {
  return (
    <path
      transform={`translate(${x} ${y})`}
      d="M18 46 Q8 46 8 37 Q8 28 18 28 Q20 17 32 17 Q42 17 45 26 Q56 25 57 36 Q58 46 48 46 Z"
      fill={scuro ? 'var(--nuvola-scura)' : 'var(--nuvola)'}
      stroke="var(--nuvola-bordo)"
      strokeWidth={1.5}
    />
  );
}

function Sole({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const raggi = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return `M${cx + Math.cos(a) * (r + 4)} ${cy + Math.sin(a) * (r + 4)} L${cx + Math.cos(a) * (r + 9)} ${cy + Math.sin(a) * (r + 9)}`;
  }).join(' ');
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={SOLE} />
      <path d={raggi} stroke={SOLE} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

function Luna({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <path
      d={`M${cx + r * 0.3} ${cy - r} A${r} ${r} 0 1 0 ${cx + r} ${cy + r * 0.35} A${r * 0.8} ${r * 0.8} 0 0 1 ${cx + r * 0.3} ${cy - r} Z`}
      fill="#f4d58d"
    />
  );
}

export function IconaMeteo({ icona, giorno = true, dimensione = 56, titolo }: { icona: IconaMeteoId; giorno?: boolean; dimensione?: number; titolo?: string }) {
  const astro = giorno ? <Sole cx={24} cy={24} r={11} /> : <Luna cx={24} cy={24} r={12} />;
  let contenuto;
  switch (icona) {
    case 'sereno':
      contenuto = giorno ? <Sole cx={32} cy={32} r={13} /> : <Luna cx={32} cy={32} r={15} />;
      break;
    case 'poco-nuvoloso':
      contenuto = (
        <>
          {astro}
          <Nuvola x={4} y={10} />
        </>
      );
      break;
    case 'nuvoloso':
      contenuto = (
        <>
          <Nuvola x={-2} y={-2} scuro />
          <Nuvola x={6} y={8} />
        </>
      );
      break;
    case 'nebbia':
      contenuto = (
        <>
          <Nuvola x={0} y={-6} />
          <path d="M10 48 H54 M14 55 H50" stroke="var(--nuvola-bordo)" strokeWidth={3} strokeLinecap="round" />
        </>
      );
      break;
    case 'pioviggine':
    case 'pioggia': {
      const gocce = icona === 'pioggia' ? 'M20 50 l-3 8 M32 50 l-3 8 M44 50 l-3 8' : 'M24 51 l-2 5 M38 51 l-2 5';
      contenuto = (
        <>
          <Nuvola x={0} y={-4} scuro={icona === 'pioggia'} />
          <path d={gocce} stroke={PIOGGIA} strokeWidth={3} strokeLinecap="round" />
        </>
      );
      break;
    }
    case 'neve':
      contenuto = (
        <>
          <Nuvola x={0} y={-4} />
          <g stroke="#8fb3e0" strokeWidth={2.2} strokeLinecap="round">
            <path d="M20 50 v8 M16 54 h8 M36 50 v8 M32 54 h8 M28 56 v6 M25 59 h6" />
          </g>
        </>
      );
      break;
    case 'temporale':
      contenuto = (
        <>
          <Nuvola x={0} y={-4} scuro />
          <path d="M33 44 L26 54 H33 L28 62 L40 50 H33 L37 44 Z" fill={SOLE} />
        </>
      );
      break;
  }
  return (
    <svg
      width={dimensione}
      height={dimensione}
      viewBox="0 0 64 64"
      role={titolo ? 'img' : undefined}
      aria-label={titolo}
      aria-hidden={titolo ? undefined : true}
    >
      {contenuto}
    </svg>
  );
}
