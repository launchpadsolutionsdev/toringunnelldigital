/**
 * Placeholder testimonials. Replace with real quotes from clients — keep
 * the structure identical so the Testimonials component still renders.
 */
export interface Testimonial {
  quote: string;
  attribution: string;
  context?: string; // e.g. "Married June 2024 at Lakeside Pavilion"
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "TKTK — placeholder testimonial. Replace with a real quote from a client. Two to three sentences reads best; longer quotes get scrolled past.",
    attribution: "Evelyn & Marcus",
    context: "Married September 2024",
  },
  {
    quote:
      "TKTK — second placeholder testimonial. Mix quotes that talk about the process with ones that talk about the final film.",
    attribution: "Harper & Jonah",
    context: "Married August 2024",
  },
  {
    quote:
      "TKTK — third placeholder. Short, specific quotes outperform generic praise.",
    attribution: "Sofia & Aiden",
    context: "Married July 2024",
  },
];
