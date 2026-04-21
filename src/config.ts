/**
 * Site-wide configuration. Centralized so pages, SEO, and structured data all
 * read from one source.
 */
export const SITE = {
  name: "Torin Gunnell Digital",
  shortName: "TGD",
  tagline: "Wedding & event videography in Thunder Bay, Ontario.",
  description:
    "Cinematic wedding and event films by Torin Gunnell. Based in Thunder Bay, Ontario. Available across Northwestern Ontario and beyond.",
  url: "https://toringunnelldigital.com",
  locale: "en_CA",
  email: "torin.business.video@gmail.com",
  location: {
    city: "Thunder Bay",
    region: "Ontario",
    country: "CA",
  },
  social: {
    // TKTK — paste real URLs when ready
    instagram: "",
    youtube: "",
    vimeo: "",
  },
} as const;

export type SiteConfig = typeof SITE;
