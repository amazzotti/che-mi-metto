import type { ReactNode } from 'react';

function Icona({ children, dimensione = 22 }: { children: ReactNode; dimensione?: number }) {
  return (
    <svg
      width={dimensione}
      height={dimensione}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconaOggi = () => (
  <Icona>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icona>
);

export const IconaSettimana = () => (
  <Icona>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" strokeWidth={2.6} />
  </Icona>
);

export const IconaArmadio = () => (
  <Icona>
    <path d="M12 6.5a2 2 0 1 1 2-2" />
    <path d="M12 6.5v1.5L3.5 14.2A1.6 1.6 0 0 0 4.4 17h15.2a1.6 1.6 0 0 0 .9-2.8L12 8" />
  </Icona>
);

export const IconaOutfit = () => (
  <Icona>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  </Icona>
);

export const IconaProfilo = () => (
  <Icona>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </Icona>
);

export const IconaPiu = ({ dimensione }: { dimensione?: number }) => (
  <Icona dimensione={dimensione}>
    <path d="M12 5v14M5 12h14" />
  </Icona>
);

export const IconaAggiorna = ({ dimensione = 18 }: { dimensione?: number }) => (
  <Icona dimensione={dimensione}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </Icona>
);

export const IconaPosizione = ({ dimensione = 16 }: { dimensione?: number }) => (
  <Icona dimensione={dimensione}>
    <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </Icona>
);

export const IconaChiudi = () => (
  <Icona>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icona>
);

export const IconaCestino = ({ dimensione = 18 }: { dimensione?: number }) => (
  <Icona dimensione={dimensione}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Icona>
);

export const IconaFoto = () => (
  <Icona>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icona>
);

export const IconaMescola = ({ dimensione = 18 }: { dimensione?: number }) => (
  <Icona dimensione={dimensione}>
    <path d="M3 7h3c4 0 6 10 10 10h5M3 17h3c1.5 0 2.7-1.4 3.8-3.2M14.2 10.2C15.3 8.4 16.5 7 18 7h3" />
    <path d="M18 4l3 3-3 3M18 14l3 3-3 3" />
  </Icona>
);

export const IconaCondividi = () => (
  <Icona dimensione={18}>
    <path d="M12 3v12M7 8l5-5 5 5" />
    <path d="M5 13v7h14v-7" />
  </Icona>
);
