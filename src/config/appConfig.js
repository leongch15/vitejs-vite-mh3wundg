export const APP_MODES = {
  LOCAL: 'local',
  AI: 'ai',
};

export const APP_MODE = APP_MODES.AI;

export const ROUTES = {
  HOME: '/',
  TRIPS: '/trips',
  TRIP_DETAIL: '/trip/:id',
  legacy: {
    TRIPS: '/mes-voyages',
    TRIP_DETAIL: '/voyage/:id',
  },
};

export const buildTripDetailRoute = (tripId) => {
  return `/trip/${tripId}`;
};

export const TRIP_STATUSES = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  VALID: 'valid',
  REPAIRED: 'repaired',
  ARCHIVED: 'archived',
};

export const VALIDATION_STATUSES = {
  VALID: 'valid',
  REPAIRED: 'repaired',
};

export const BUDGET_OPTIONS = [
  {
    value: 'economique',
    label: 'Économique',
    shortLabel: 'Éco',
    emoji: '💰',
  },
  {
    value: 'modere',
    label: 'Modéré',
    shortLabel: 'Modéré',
    emoji: '💰💰',
  },
  {
    value: 'confort',
    label: 'Confort',
    shortLabel: 'Confort',
    emoji: '💰💰💰',
  },
  {
    value: 'luxe',
    label: 'Luxe',
    shortLabel: 'Luxe',
    emoji: '💰💰💰💰',
  },
];

export const TRAVEL_STYLE_OPTIONS = [
  {
    value: 'essentiels',
    label: 'Essentiels',
    description: 'Les incontournables, sans surcharger le programme.',
    emoji: '⭐',
  },
  {
    value: 'detente',
    label: 'Détente',
    description: 'Moins de pression, plus de pauses et de temps libre.',
    emoji: '😌',
  },
  {
    value: 'immersion',
    label: 'Immersion',
    description: 'Un rythme plus complet pour découvrir davantage.',
    emoji: '🌍',
  },
  {
    value: 'insolite',
    label: 'Insolite',
    description: 'Des lieux plus locaux, moins évidents et plus originaux.',
    emoji: '✨',
  },
  {
    value: 'nature',
    label: 'Nature',
    description: 'Plus de balades, parcs, points de vue et respiration.',
    emoji: '🌿',
  },
  {
    value: 'gastronomie',
    label: 'Gastronomie',
    description: 'Plus de marchés, adresses locales et pauses food.',
    emoji: '🍽️',
  },
];

export const WALKING_LEVEL_OPTIONS = [
  {
    value: 'faible',
    label: 'Peu — moins de 5 km',
    shortLabel: 'Faible',
  },
  {
    value: 'moyen',
    label: 'Moyen — 5 à 10 km',
    shortLabel: 'Moyen',
  },
  {
    value: 'eleve',
    label: 'Beaucoup — 10 km et plus',
    shortLabel: 'Élevé',
  },
];

export const ORGANIZATION_LEVEL_OPTIONS = [
  {
    value: 'idees',
    label: 'Juste les grandes idées',
  },
  {
    value: 'planning',
    label: 'Un planning prêt à suivre',
  },
  {
    value: 'complet',
    label: 'Tout organiser à ma place',
  },
];

export const STORAGE_KEYS = {
  TRIPS: 'capi_trips',
};

export const GENERATION_DEFAULTS = {
  destination: 'Paris',
  daysCount: 3,
  travelers: 2,
  budget: 'modere',
  travelStyle: 'essentiels',
  walkingLevel: 'moyen',
  organizationLevel: 'planning',
};

export const DEMO_SETTINGS = {
  showDemoBadge: true,
  simulatedGenerationDelayMs: 1200,
};

export const AI_SETTINGS = {
  tripGenerationEndpoint: '/api/generate-trip',
  timeoutMs: 45000,
  fallbackToLocal: true,
};

export const APP_CONFIG = {
  mode: APP_MODE,
  modes: APP_MODES,
  routes: ROUTES,
  tripStatuses: TRIP_STATUSES,
  validationStatuses: VALIDATION_STATUSES,
  budgetOptions: BUDGET_OPTIONS,
  travelStyleOptions: TRAVEL_STYLE_OPTIONS,
  walkingLevelOptions: WALKING_LEVEL_OPTIONS,
  organizationLevelOptions: ORGANIZATION_LEVEL_OPTIONS,
  storageKeys: STORAGE_KEYS,
  generationDefaults: GENERATION_DEFAULTS,
  demo: DEMO_SETTINGS,
  ai: AI_SETTINGS,
};
