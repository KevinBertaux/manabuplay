export const CONSENT_VERSION = '2026-03-10';
export const CONSENT_STORAGE_KEY = 'manabuplay_consent';

export const CONSENT_CATEGORIES = Object.freeze([
  {
    id: 'necessary',
    label: 'Essentiel',
    description: 'Stockages obligatoires pour faire fonctionner ManabuPlay.',
    locked: true,
  },
  {
    id: 'analytics',
    label: 'Mesure d\'audience',
    description: 'Permet de comprendre l\'usage du site (anonyme, hors cookies obligatoires).',
    locked: false,
  },
  {
    id: 'ads',
    label: 'Publicité',
    description: 'Active les services partenaires de monétisation et le ciblage contextuel.',
    locked: false,
  },
]);

export const CONSENT_STATUSES = Object.freeze({
  UNKNOWN: 'unknown',
  GRANTED: 'granted',
  DENIED: 'denied',
  CUSTOM: 'custom',
});
