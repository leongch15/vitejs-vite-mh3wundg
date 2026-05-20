export const DESTINATIONS = {
  paris: {
    type: 'city',
    label: 'Paris',
    country: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    arrivalCity: 'Paris',
    returnCity: 'Paris',
    routeOrder: ['Paris'],
    cities: {
      Paris: {
        lat: 48.8566,
        lng: 2.3522,
        recommendedDays: 3,
        areas: [
          'Île de la Cité',
          'Saint-Germain',
          'Montmartre',
          'Le Marais',
          'Canal Saint-Martin',
          'Quartier Latin',
        ],
        landmarks: [
          'Notre-Dame',
          'Musée du Louvre',
          'Tour Eiffel',
          'Sacré-Cœur',
          'Jardin du Luxembourg',
          'Place des Vosges',
        ],
        food: [
          'bouillon parisien',
          'boulangerie artisanale',
          'brasserie locale',
          'marché couvert',
          'café de quartier',
        ],
        nature: [
          'Jardin des Tuileries',
          'Parc des Buttes-Chaumont',
          'Coulée verte',
          'berges de Seine',
        ],
        photo: [
          'Pont Alexandre III',
          'rue de l’Abreuvoir',
          'Place du Trocadéro',
          'toits de Montmartre',
        ],
      },
    },
  },

  danemark: {
    type: 'country',
    label: 'Danemark',
    country: 'Danemark',
    currency: 'DKK',
    currencySymbol: 'kr',
    arrivalCity: 'Copenhague',
    returnCity: 'Copenhague',
    routeOrder: ['Copenhague', 'Odense', 'Aarhus', 'Aalborg', 'Skagen', 'Copenhague'],
    cities: {
      Copenhague: {
        lat: 55.6761,
        lng: 12.5683,
        recommendedDays: 3,
        areas: ['Indre By', 'Nyhavn', 'Nørrebro', 'Vesterbro', 'Christianshavn'],
        landmarks: ['Nyhavn', 'Tivoli', 'Rundetårn', 'Amalienborg', 'Christiansborg'],
        food: ['smørrebrød', 'boulangerie danoise', 'food hall', 'café nordique'],
        nature: ['lacs de Copenhague', 'Superkilen', 'front de mer', 'Jardins de Tivoli'],
        photo: ['Nyhavn', 'Rundetårn', 'Christianshavn', 'maisons colorées'],
      },
      Odense: {
        lat: 55.4038,
        lng: 10.4024,
        recommendedDays: 1,
        areas: ['centre historique', 'quartier H.C. Andersen', 'port'],
        landmarks: ['Maison H.C. Andersen', 'cathédrale Saint-Knud', 'Møntergården'],
        food: ['café danois', 'restaurant local', 'boulangerie'],
        nature: ['parc Munke Mose', 'rivière Odense'],
        photo: ['ruelles historiques', 'quartier Andersen'],
      },
      Aarhus: {
        lat: 56.1629,
        lng: 10.2039,
        recommendedDays: 2,
        areas: ['Latinerkvarteret', 'Aarhus Ø', 'centre-ville', 'Marselisborg'],
        landmarks: ['ARoS', 'Den Gamle By', 'Dokk1', 'cathédrale d’Aarhus'],
        food: ['street food market', 'café nordique', 'restaurant local'],
        nature: ['Marselisborg', 'bord de mer', 'parc universitaire'],
        photo: ['Your Rainbow Panorama', 'Aarhus Ø', 'Den Gamle By'],
      },
      Aalborg: {
        lat: 57.0488,
        lng: 9.9217,
        recommendedDays: 1,
        areas: ['centre-ville', 'front de fjord', 'Jomfru Ane Gade'],
        landmarks: ['Utzon Center', 'Kunsten Museum', 'Aalborghus'],
        food: ['restaurant nordique simple', 'café local', 'street food'],
        nature: ['fjord', 'parc Kildeparken'],
        photo: ['front de fjord', 'Utzon Center'],
      },
      Skagen: {
        lat: 57.7209,
        lng: 10.5839,
        recommendedDays: 1,
        areas: ['centre de Skagen', 'Grenen', 'port'],
        landmarks: ['Grenen', 'musée de Skagen', 'église ensablée'],
        food: ['restaurant de poisson', 'café côtier', 'glace artisanale'],
        nature: ['plages', 'dunes', 'rencontre des deux mers'],
        photo: ['Grenen', 'maisons jaunes', 'dunes'],
      },
    },
  },

  italie: {
    type: 'country',
    label: 'Italie',
    country: 'Italie',
    currency: 'EUR',
    currencySymbol: '€',
    arrivalCity: 'Rome',
    returnCity: 'Venise',
    routeOrder: ['Rome', 'Florence', 'Venise'],
    cities: {
      Rome: {
        lat: 41.9028,
        lng: 12.4964,
        recommendedDays: 3,
        areas: ['Centro Storico', 'Trastevere', 'Monti', 'Vatican', 'Testaccio'],
        landmarks: ['Colisée', 'Forum romain', 'Panthéon', 'Fontaine de Trevi', 'Piazza Navona'],
        food: ['trattoria locale', 'pizzeria romaine', 'gelateria artisanale', 'marché de Campo de’ Fiori'],
        nature: ['Villa Borghese', 'Jardin des Orangers', 'Janiculum'],
        photo: ['Fontaine de Trevi tôt le matin', 'Trastevere au coucher du soleil', 'Pincio'],
      },
      Florence: {
        lat: 43.7696,
        lng: 11.2558,
        recommendedDays: 2,
        areas: ['Duomo', 'Oltrarno', 'Santa Croce', 'San Lorenzo'],
        landmarks: ['Duomo', 'Ponte Vecchio', 'Galerie des Offices', 'Palazzo Vecchio'],
        food: ['trattoria toscane', 'marché central', 'sandwich local', 'gelato artisanal'],
        nature: ['Jardin de Boboli', 'Piazzale Michelangelo'],
        photo: ['Ponte Vecchio', 'Piazzale Michelangelo', 'ruelles d’Oltrarno'],
      },
      Venise: {
        lat: 45.4408,
        lng: 12.3155,
        recommendedDays: 2,
        areas: ['San Marco', 'Cannaregio', 'Dorsoduro', 'Rialto'],
        landmarks: ['Place Saint-Marc', 'Pont du Rialto', 'Palais des Doges', 'Basilique Saint-Marc'],
        food: ['bacaro vénitien', 'cicchetti', 'osteria locale', 'marché du Rialto'],
        nature: ['lagune', 'Giudecca', 'promenade au bord de l’eau'],
        photo: ['Rialto tôt le matin', 'Dorsoduro', 'canaux de Cannaregio'],
      },
    },
  },

  espagne: {
    type: 'country',
    label: 'Espagne',
    country: 'Espagne',
    currency: 'EUR',
    currencySymbol: '€',
    arrivalCity: 'Barcelone',
    returnCity: 'Madrid',
    routeOrder: ['Barcelone', 'Valence', 'Madrid'],
    cities: {
      Barcelone: {
        lat: 41.3874,
        lng: 2.1686,
        recommendedDays: 3,
        areas: ['Barri Gòtic', 'Eixample', 'Gràcia', 'El Born', 'Barceloneta'],
        landmarks: ['Sagrada Família', 'Parc Güell', 'Casa Batlló', 'Cathédrale de Barcelone'],
        food: ['bar à tapas', 'marché de la Boqueria', 'bodega locale', 'churros'],
        nature: ['Montjuïc', 'Parc de la Ciutadella', 'front de mer'],
        photo: ['Bunkers del Carmel', 'Parc Güell', 'ruelles du Born'],
      },
      Valence: {
        lat: 39.4699,
        lng: -0.3763,
        recommendedDays: 2,
        areas: ['Ciutat Vella', 'Ruzafa', 'Cité des Arts', 'Malvarrosa'],
        landmarks: ['Cité des Arts et des Sciences', 'Marché Central', 'Cathédrale de Valence'],
        food: ['paella valencienne', 'horchata', 'marché central', 'bar local'],
        nature: ['Jardins du Turia', 'plage de Malvarrosa', 'Albufera'],
        photo: ['Cité des Arts', 'Jardins du Turia', 'front de mer'],
      },
      Madrid: {
        lat: 40.4168,
        lng: -3.7038,
        recommendedDays: 2,
        areas: ['Centro', 'Malasaña', 'Retiro', 'La Latina', 'Chueca'],
        landmarks: ['Palais Royal', 'Plaza Mayor', 'Musée du Prado', 'Parc du Retiro'],
        food: ['bar à tapas', 'mercado local', 'chocolatería', 'taberna madrilène'],
        nature: ['Parc du Retiro', 'Casa de Campo'],
        photo: ['Gran Vía', 'Palais Royal', 'Temple de Debod'],
      },
    },
  },
};

export function normalizeText(value = '') {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function getDestinationKey(destination = '') {
  const normalized = normalizeText(destination);

  if (normalized.includes('danemark') || normalized.includes('copenhague')) return 'danemark';
  if (normalized.includes('italie') || normalized.includes('rome') || normalized.includes('florence') || normalized.includes('venise')) return 'italie';
  if (normalized.includes('espagne') || normalized.includes('barcelone') || normalized.includes('valence') || normalized.includes('madrid')) return 'espagne';
  if (normalized.includes('paris')) return 'paris';

  return null;
}

export function getDestinationConfig(destination = '') {
  const key = getDestinationKey(destination);
  return key ? DESTINATIONS[key] : null;
}

export function getCityConfig(cityName = '') {
  const normalizedCity = normalizeText(cityName);

  for (const destination of Object.values(DESTINATIONS)) {
    for (const [city, config] of Object.entries(destination.cities)) {
      if (normalizeText(city) === normalizedCity) {
        return {
          city,
          ...config,
        };
      }
    }
  }

  return null;
}

export function getLogicalRoute(destination = '', daysCount = 3) {
  const config = getDestinationConfig(destination);

  if (!config) {
    return ['Paris'];
  }

  if (config.type === 'city') {
    return [config.arrivalCity];
  }

  const fullRoute = config.routeOrder || [];

  if (daysCount <= 3) return [fullRoute[0]];
  if (daysCount <= 5) return fullRoute.slice(0, 2);
  if (daysCount <= 7) return fullRoute.slice(0, 3);
  if (daysCount <= 9) return fullRoute.slice(0, 4);

  return fullRoute;
}

export function distributeDaysByRecommendedDuration(route = [], destination = '', daysCount = 3) {
  const config = getDestinationConfig(destination);

  if (!config || route.length === 0) {
    return Array.from({ length: daysCount }, () => 'Paris');
  }

  if (route.length === 1) {
    return Array.from({ length: daysCount }, () => route[0]);
  }

  const result = [];

  route.forEach((city) => {
    const recommendedDays = config.cities[city]?.recommendedDays || 1;

    for (let i = 0; i < recommendedDays; i += 1) {
      if (result.length < daysCount) {
        result.push(city);
      }
    }
  });

  while (result.length < daysCount) {
    result.push(route[route.length - 1]);
  }

  return result.slice(0, daysCount);
}

export function getCitiesForDestination(destination = '', daysCount = 3) {
  const route = getLogicalRoute(destination, daysCount);
  return distributeDaysByRecommendedDuration(route, destination, daysCount);
}