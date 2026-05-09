export type HomeHeroGridCardTheme = "default" | "blue";

export type HomeHeroGridCardImageMedia = {
  kind: "image";
  /** One URL, or several to cycle through while the panel is active. */
  sources: string | string[];
  /** Milliseconds between images when multiple `sources`. Defaults to 2000. */
  rotationMs?: number;
};

export type HomeHeroGridCardVideoMedia = {
  kind: "video";
  src: string;
  poster?: string;
};

export type HomeHeroGridCardRiveMedia = {
  kind: "rive";
  /** Path under `public/` or absolute URL to a `.riv` file. */
  src: string;
  artboard?: string;
  animations?: string | string[];
  stateMachines?: string | string[];
};

export type HomeHeroGridCardMedia =
  | HomeHeroGridCardImageMedia
  | HomeHeroGridCardVideoMedia
  | HomeHeroGridCardRiveMedia;

export type HomeHeroGridCard = {
  id: string;
  label: string;
  body: string;
  textMaxChars?: number;
  theme: HomeHeroGridCardTheme;
  media: HomeHeroGridCardMedia;
};

export const HOME_HERO_GRID_IMAGE_ROTATION_MS_DEFAULT = 2000;

export const homeHeroGridCards: HomeHeroGridCard[] = [
  {
    id: "bhf-redesign",
    label: "BHF Redesign",
    body:
      "I have designed the regular donations flows for 2 of the UK's biggest charities on sites getting millions of visitors every month.",
      textMaxChars: 28,
      theme: "default",
    media: {
      kind: "image",
      sources: "/images/home/hero-grid/bhf-phone.jpg",
    },
  },
  {
    id: "licel-design",
    label: "Licel design",
    body:
      "Working directly with the founders, I defined the brand and design language to take a pioneer in app security from start-up to scale up.",
    textMaxChars: 25,
    theme: "default",
    media: {
      kind: "image",
      sources: [
        "/images/home/hero-grid/licel-menu.jpg",
        "/images/home/hero-grid/licel-authenticator.jpg",
      ],
    },
  },
  {
    id: "hero-example-video",
    label: "Video (example)",
    body:
      "Example looping video in the panel slot - replace `media.src` with your file under `public/` (or a URL) when ready.",
    textMaxChars: 25,
    theme: "default",
    media: {
      kind: "video",
      src: "/videos/home-hero-example.webm",
    },
  },
  {
    id: "hero-example-rive",
    label: "Rive (example)",
    body:
      "Example Rive runtime file - swap `public/rive/home-hero-example.riv` (or `media.src`) for your animation.",
    textMaxChars: 25,
    theme: "default",
    media: {
      kind: "rive",
      src: "/rive/home-hero-example.riv",
    },
  },
];

export const HOME_HERO_GRID_CARD_IDS = homeHeroGridCards.map((card) => card.id);

const homeHeroGridCardMap = new Map(homeHeroGridCards.map((card) => [card.id, card]));

export function getHomeHeroGridCardById(id: string): HomeHeroGridCard {
  return homeHeroGridCardMap.get(id) ?? homeHeroGridCards[0];
}
