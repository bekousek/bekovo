/**
 * Jediná paleta hry: Sweetie 16 (GrafxKid, volně k použití).
 * Všechny sprity, scény i UI berou barvy odsud, takže hra drží jeden styl.
 */
export const PAL = {
  night: '#1a1c2c',
  plum: '#5d275d',
  red: '#b13e53',
  orange: '#ef7d57',
  gold: '#ffcd75',
  lime: '#a7f070',
  green: '#38b764',
  teal: '#257179',
  navy: '#29366f',
  blue: '#3b5dc9',
  sky: '#41a6f6',
  cyan: '#73eff7',
  white: '#f4f4f4',
  silver: '#94b0c2',
  slate: '#566c86',
  ink: '#333c57',
} as const;

export type PalKey = keyof typeof PAL;
