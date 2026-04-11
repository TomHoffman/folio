export type LogoGridItem = {
  id: string;
  name: string;
  /** Path under `public`, e.g. `/svg/clients/bhf.svg` */
  src: string;
};

/**
 * Full client list (row-major order for the first 18 on **desktop**; mobile tickertape uses
 * the first 16 in four 2×2 groups). SVGs are exported at consistent frame sizes.
 */
export const defaultLogoGridItems: LogoGridItem[] = [
  { id: "bhf", name: "British Heart Foundation", src: "/svg/clients/bhf.svg" },
  { id: "globant", name: "Globant", src: "/svg/clients/globant.svg" },
  { id: "bbc", name: "BBC", src: "/svg/clients/bbc.svg" },
  { id: "capitalone", name: "Capital One", src: "/svg/clients/capitalone.svg" },
  { id: "zeppelin", name: "Zeppelin", src: "/svg/clients/zeppelin.svg" },
  { id: "grundfos", name: "Grundfos", src: "/svg/clients/grundfos.svg" },
  { id: "volta", name: "Volta Trucks", src: "/svg/clients/volta.svg" },
  { id: "unicef", name: "UNICEF", src: "/svg/clients/unicef.svg" },
  { id: "accenture", name: "Accenture", src: "/svg/clients/accenture.svg" },
  { id: "astrazeneca", name: "AstraZeneca", src: "/svg/clients/astrazeneca.svg" },
  { id: "uk-gov", name: "UK Government", src: "/svg/clients/uk-gov.svg" },
  { id: "x-shore", name: "X Shore", src: "/svg/clients/x-shore.svg" },
  { id: "mc-saatchi", name: "M&C Saatchi", src: "/svg/clients/mc-saatchi.svg" },
  { id: "google", name: "Google", src: "/svg/clients/google.svg" },
  { id: "pernod", name: "Pernod Ricard", src: "/svg/clients/pernod.svg" },
  { id: "m-and-s", name: "M&S", src: "/svg/clients/m-and-s.svg" },
  { id: "thales", name: "Thales", src: "/svg/clients/thales.svg" },
  { id: "licel", name: "Licel", src: "/svg/clients/licel.svg" },
  /* Pool (never more than 18 visible on desktop; these rotate in) */
  { id: "aib", name: "AIB", src: "/svg/clients/aib.svg" },
  { id: "deloitte", name: "Deloitte", src: "/svg/clients/deloitte.svg" },
  { id: "microsoft", name: "Microsoft", src: "/svg/clients/microsoft.svg" },
  { id: "mondelez", name: "Mondelēz", src: "/svg/clients/mondelez.svg" },
  { id: "sky", name: "Sky", src: "/svg/clients/sky.svg" },
  { id: "youtube", name: "YouTube", src: "/svg/clients/youtube.svg" },
];
