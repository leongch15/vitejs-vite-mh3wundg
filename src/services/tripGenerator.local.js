import {
  getDestinationConfig,
  getCitiesForDestination as getDestinationCities,
  getCityConfig,
} from '@/data/destinations';

import {
  pickActivity,
  getActivitiesByCategory,
} from '@/data/activities';


const CITY_DATA = {
  Paris: {
    lat: 48.8566,
    lng: 2.3522,
    areas: ["Île de la Cité", "Saint-Germain", "Montmartre", "Marais", "Canal Saint-Martin"],
    landmarks: ["Notre-Dame", "Louvre", "Tour Eiffel", "Sacré-Cœur", "Jardin du Luxembourg"],
    food: ["bouillon parisien", "boulangerie artisanale", "brasserie locale", "marché couvert", "café de quartier"],
    nature: ["Jardin des Tuileries", "Parc des Buttes-Chaumont", "Coulée verte", "berges de Seine"],
    photo: ["Pont Alexandre III", "rue de l’Abreuvoir", "Place du Trocadéro", "toits de Montmartre"],
  },
  Rome: {
    lat: 41.9028,
    lng: 12.4964,
    areas: ["Centro Storico", "Trastevere", "Monti", "Vatican", "Testaccio"],
    landmarks: ["Colisée", "Forum romain", "Panthéon", "Fontaine de Trevi", "Piazza Navona"],
    food: ["trattoria locale", "pizzeria romaine", "gelateria artisanale", "marché de Campo de’ Fiori"],
    nature: ["Villa Borghese", "Jardin des Orangers", "Janiculum"],
    photo: ["Fontaine de Trevi tôt le matin", "Trastevere au coucher du soleil", "Pincio"],
  },
  Florence: {
    lat: 43.7696,
    lng: 11.2558,
    areas: ["Duomo", "Oltrarno", "Santa Croce", "San Lorenzo"],
    landmarks: ["Duomo", "Ponte Vecchio", "Galerie des Offices", "Palazzo Vecchio"],
    food: ["trattoria toscane", "marché central", "sandwich local", "gelato artisanal"],
    nature: ["Jardin de Boboli", "Piazzale Michelangelo"],
    photo: ["Ponte Vecchio", "Piazzale Michelangelo", "ruelles d’Oltrarno"],
  },
  Venise: {
    lat: 45.4408,
    lng: 12.3155,
    areas: ["San Marco", "Cannaregio", "Dorsoduro", "Rialto"],
    landmarks: ["Place Saint-Marc", "Pont du Rialto", "Palais des Doges", "Basilique Saint-Marc"],
    food: ["bacaro vénitien", "cicchetti", "osteria locale", "marché du Rialto"],
    nature: ["lagune", "Giudecca", "promenade au bord de l’eau"],
    photo: ["Rialto tôt le matin", "Dorsoduro", "canaux de Cannaregio"],
  },
  Barcelone: {
    lat: 41.3874,
    lng: 2.1686,
    areas: ["Barri Gòtic", "Eixample", "Gràcia", "El Born", "Barceloneta"],
    landmarks: ["Sagrada Família", "Parc Güell", "Casa Batlló", "Cathédrale de Barcelone"],
    food: ["bar à tapas", "marché de la Boqueria", "bodega locale", "churros"],
    nature: ["Montjuïc", "Parc de la Ciutadella", "front de mer"],
    photo: ["Bunkers del Carmel", "Parc Güell", "ruelles du Born"],
  },
  Valence: {
    lat: 39.4699,
    lng: -0.3763,
    areas: ["Ciutat Vella", "Ruzafa", "Cité des Arts", "Malvarrosa"],
    landmarks: ["Cité des Arts et des Sciences", "Marché Central", "Cathédrale de Valence"],
    food: ["paella valencienne", "horchata", "marché central", "bar local"],
    nature: ["Jardins du Turia", "plage de Malvarrosa", "Albufera"],
    photo: ["Cité des Arts", "Jardins du Turia", "front de mer"],
  },
  Madrid: {
    lat: 40.4168,
    lng: -3.7038,
    areas: ["Centro", "Malasaña", "Retiro", "La Latina", "Chueca"],
    landmarks: ["Palais Royal", "Plaza Mayor", "Musée du Prado", "Parc du Retiro"],
    food: ["bar à tapas", "mercado local", "chocolatería", "taberna madrilène"],
    nature: ["Parc du Retiro", "Casa de Campo"],
    photo: ["Gran Vía", "Palais Royal", "Temple de Debod"],
  },
  Copenhague: {
    lat: 55.6761,
    lng: 12.5683,
    areas: ["Indre By", "Nyhavn", "Nørrebro", "Vesterbro", "Christianshavn"],
    landmarks: ["Nyhavn", "Tivoli", "Rundetårn", "Amalienborg", "Christiansborg"],
    food: ["smørrebrød", "boulangerie danoise", "food hall", "café nordique"],
    nature: ["Jardins de Tivoli", "lacs de Copenhague", "Superkilen", "front de mer"],
    photo: ["Nyhavn", "Rundetårn", "Christianshavn", "maisons colorées"],
  },
  Odense: {
    lat: 55.4038,
    lng: 10.4024,
    areas: ["centre historique", "quartier H.C. Andersen", "port"],
    landmarks: ["Maison H.C. Andersen", "cathédrale Saint-Knud", "Møntergården"],
    food: ["café danois", "restaurant local", "boulangerie"],
    nature: ["parc Munke Mose", "rivière Odense"],
    photo: ["ruelles historiques", "quartier Andersen"],
  },
  Aarhus: {
    lat: 56.1629,
    lng: 10.2039,
    areas: ["Latinerkvarteret", "Aarhus Ø", "centre-ville", "Marselisborg"],
    landmarks: ["ARoS", "Den Gamle By", "Dokk1", "cathédrale d’Aarhus"],
    food: ["street food market", "café nordique", "restaurant local"],
    nature: ["Marselisborg", "bord de mer", "parc universitaire"],
    photo: ["Your Rainbow Panorama", "Aarhus Ø", "Den Gamle By"],
  },
  Aalborg: {
    lat: 57.0488,
    lng: 9.9217,
    areas: ["centre-ville", "front de fjord", "Jomfru Ane Gade"],
    landmarks: ["Utzon Center", "Kunsten Museum", "Aalborghus"],
    food: ["restaurant nordique simple", "café local", "street food"],
    nature: ["fjord", "parc Kildeparken"],
    photo: ["front de fjord", "Utzon Center"],
  },
  Skagen: {
    lat: 57.7209,
    lng: 10.5839,
    areas: ["centre de Skagen", "Grenen", "port"],
    landmarks: ["Grenen", "musée de Skagen", "église ensablée"],
    food: ["restaurant de poisson", "café côtier", "glace artisanale"],
    nature: ["plages", "dunes", "rencontre des deux mers"],
    photo: ["Grenen", "maisons jaunes", "dunes"],
  },
  Lyon: {
    lat: 45.764,
    lng: 4.8357,
    areas: ["Vieux Lyon", "Presqu’île", "Croix-Rousse", "Confluence", "Fourvière"],
    landmarks: ["Fourvière", "traboules", "Place Bellecour", "Musée des Confluences"],
    food: ["bouchon lyonnais", "halles Paul Bocuse", "boulangerie", "marché local"],
    nature: ["Parc de la Tête d’Or", "berges du Rhône", "Saône"],
    photo: ["Fourvière", "quais de Saône", "Croix-Rousse"],
  },
};

const COUNTRY_ROUTES = {
  italie: ["Rome", "Florence", "Venise"],
  espagne: ["Barcelone", "Valence", "Madrid"],
  danemark: ["Copenhague", "Odense", "Aarhus", "Aalborg", "Skagen", "Copenhague"],
};

const normalizeText = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const normalizeBudget = (budget = "modere") => {
  const b = normalizeText(budget);

  if (b.includes("eco")) return "economique";
  if (b.includes("confort")) return "confort";
  if (b.includes("luxe") || b.includes("premium")) return "luxe";
  return "modere";
};

const getCostByBudget = (budget) => {
  const b = normalizeBudget(budget);

  switch (b) {
    case "economique":
      return {
        activity: "0€ - 12€",
        meal: "10€ - 18€",
        dayPerPerson: 45,
        restaurantType: "adresse simple, marché ou street food",
        hotelType: "hébergement simple et bien placé",
      };
    case "confort":
      return {
        activity: "15€ - 35€",
        meal: "30€ - 50€",
        dayPerPerson: 115,
        restaurantType: "restaurant confortable et bien noté",
        hotelType: "hôtel confortable et central",
      };
    case "luxe":
      return {
        activity: "40€ - 90€",
        meal: "70€ - 150€",
        dayPerPerson: 230,
        restaurantType: "restaurant haut de gamme ou expérience premium",
        hotelType: "hôtel haut de gamme",
      };
    default:
      return {
        activity: "8€ - 25€",
        meal: "18€ - 35€",
        dayPerPerson: 75,
        restaurantType: "restaurant local avec bon rapport qualité/prix",
        hotelType: "hôtel bien situé de gamme modérée",
      };
  }
};

const getKnownCityName = (destination) => {
  const normalized = normalizeText(destination);

  return Object.keys(CITY_DATA).find((city) =>
    normalized.includes(normalizeText(city))
  );
};

const getCountryKey = (destination) => {
  const normalized = normalizeText(destination);

  if (normalized.includes("italie")) return "italie";
  if (normalized.includes("espagne")) return "espagne";
  if (normalized.includes("danemark")) return "danemark";

  return null;
};

const getStopsForDestination = (destination, daysCount) => {
  const countryKey = getCountryKey(destination);

  if (!countryKey) {
    const city = getKnownCityName(destination) || destination || "Paris";
    return [city];
  }

  const fullRoute = COUNTRY_ROUTES[countryKey];

  if (daysCount <= 3) return [fullRoute[0]];
  if (daysCount <= 5) return fullRoute.slice(0, Math.min(2, fullRoute.length));
  if (daysCount <= 7) return fullRoute.slice(0, Math.min(3, fullRoute.length));
  if (daysCount <= 9) return fullRoute.slice(0, Math.min(4, fullRoute.length));

  return fullRoute;
};

const distributeDaysAcrossStops = (stops, daysCount) => {
  if (stops.length === 1) {
    return Array.from({ length: daysCount }, () => stops[0]);
  }

  const result = [];
  const remainingStops = [...stops];

  while (result.length < daysCount && remainingStops.length > 0) {
    const stop = remainingStops.shift();
    const daysLeft = daysCount - result.length;
    const stopsLeft = remainingStops.length;

    let nights = 1;

    if (daysLeft - stopsLeft >= 3 && result.length === 0) nights = 3;
    else if (daysLeft - stopsLeft >= 2) nights = 2;

    for (let i = 0; i < nights && result.length < daysCount; i += 1) {
      result.push(stop);
    }
  }

  while (result.length < daysCount) {
    result.push(stops[stops.length - 1]);
  }

  return result.slice(0, daysCount);
};

const getCitiesForDestination = (destination, daysCount) => {
  return getDestinationCities(destination, daysCount);
};

const getCityData = (city) => {
  const cityConfig = getCityConfig(city);

  if (cityConfig) {
    return cityConfig;
  }

  return {
    lat: 48.8566,
    lng: 2.3522,
    recommendedDays: 2,
    areas: ["centre-ville", "quartier historique", "zone locale"],
    landmarks: [
      `centre de ${city}`,
      `quartier historique de ${city}`,
      `lieu emblématique de ${city}`,
    ],
    food: ["restaurant local", "marché", "café de quartier"],
    nature: ["parc local", "promenade agréable"],
    photo: ["point de vue", "rue photogénique"],
  };
};

const getKnownDestinationCity = (cityName = '', destinationConfig = null) => {
  if (!cityName || !destinationConfig?.cities) return null;

  const normalizedInput = normalizeText(cityName);

  return Object.keys(destinationConfig.cities).find((city) => {
    const normalizedCity = normalizeText(city);

    return (
      normalizedInput === normalizedCity ||
      normalizedInput.includes(normalizedCity) ||
      normalizedCity.includes(normalizedInput)
    );
  }) || null;
};

const cleanRouteOrder = (routeOrder = []) => {
  const withoutConsecutiveDuplicates = routeOrder.filter((city, index) => {
    return index === 0 || city !== routeOrder[index - 1];
  });

  if (
    withoutConsecutiveDuplicates.length > 1 &&
    withoutConsecutiveDuplicates[0] ===
      withoutConsecutiveDuplicates[withoutConsecutiveDuplicates.length - 1]
  ) {
    return withoutConsecutiveDuplicates.slice(0, -1);
  }

  return withoutConsecutiveDuplicates;
};

const getMaxStopsForDays = (daysCount = 3, hasExplicitReturnCity = false) => {
  if (daysCount <= 3) return 1;
  if (daysCount <= 5) return hasExplicitReturnCity ? 2 : 2;
  if (daysCount <= 7) return hasExplicitReturnCity ? 3 : 3;
  if (daysCount <= 9) return hasExplicitReturnCity ? 4 : 4;
  return hasExplicitReturnCity ? 5 : 5;
};

const uniqueRouteStops = (stops = []) => {
  return stops.filter((city, index) => index === 0 || city !== stops[index - 1]);
};

const buildRouteStops = ({
  destination,
  daysCount,
  arrivalCity,
  returnCity,
}) => {
  const destinationConfig = getDestinationConfig(destination);

  if (!destinationConfig) {
    const city = getKnownCityName(destination) || destination || 'Paris';
    return {
      stops: [city],
      arrivalCity: city,
      returnCity: null,
      hasExplicitReturnCity: false,
      isCountryRoute: false,
    };
  }

  if (destinationConfig.type === 'city') {
    const city = destinationConfig.arrivalCity || destinationConfig.label || destination;
    return {
      stops: [city],
      arrivalCity: city,
      returnCity: city,
      hasExplicitReturnCity: false,
      isCountryRoute: false,
    };
  }

  const routeOrder = cleanRouteOrder(destinationConfig.routeOrder || []);
  const configuredCities = Object.keys(destinationConfig.cities || {});
  const defaultStart = destinationConfig.arrivalCity || routeOrder[0] || configuredCities[0];

  const matchedArrivalCity =
    getKnownDestinationCity(arrivalCity, destinationConfig) ||
    getKnownDestinationCity(destination, destinationConfig) ||
    defaultStart;

  const matchedReturnCity = getKnownDestinationCity(returnCity, destinationConfig);
  const hasExplicitReturnCity = !!matchedReturnCity;

  const startIndex = Math.max(0, routeOrder.indexOf(matchedArrivalCity));
  let orderedRoute = routeOrder.slice(startIndex);

  if (!orderedRoute.length) {
    orderedRoute = routeOrder.length ? [...routeOrder] : [matchedArrivalCity];
  }

  if (orderedRoute[0] !== matchedArrivalCity) {
    orderedRoute.unshift(matchedArrivalCity);
  }

  let routeWithoutReturn = orderedRoute;

  if (hasExplicitReturnCity) {
    const returnIndex = orderedRoute.indexOf(matchedReturnCity);

    if (returnIndex > 0) {
      routeWithoutReturn = orderedRoute.slice(0, returnIndex + 1);
    } else if (matchedReturnCity === matchedArrivalCity) {
      routeWithoutReturn = orderedRoute.filter((city, index) => {
        return index === 0 || city !== matchedReturnCity;
      });
    }
  }

  const maxStops = getMaxStopsForDays(daysCount, hasExplicitReturnCity);
  const reservedReturnSlot =
    hasExplicitReturnCity &&
    matchedReturnCity !== matchedArrivalCity &&
    routeWithoutReturn[routeWithoutReturn.length - 1] !== matchedReturnCity;

  const maxMainStops = reservedReturnSlot ? Math.max(1, maxStops - 1) : maxStops;
  let selectedStops = routeWithoutReturn.slice(0, maxMainStops);

  if (!selectedStops.includes(matchedArrivalCity)) {
    selectedStops.unshift(matchedArrivalCity);
  }

  if (hasExplicitReturnCity) {
    const currentLast = selectedStops[selectedStops.length - 1];

    if (matchedReturnCity !== currentLast) {
      selectedStops.push(matchedReturnCity);
    }
  }

  selectedStops = uniqueRouteStops(selectedStops);

  return {
    stops: selectedStops,
    arrivalCity: matchedArrivalCity,
    returnCity: matchedReturnCity || null,
    hasExplicitReturnCity,
    isCountryRoute: true,
  };
};

const distributeDaysAcrossRouteStops = ({
  stops = [],
  destination,
  daysCount,
  returnCity,
  hasExplicitReturnCity,
}) => {
  if (!stops.length) {
    return Array.from({ length: daysCount }, () => 'Paris');
  }

  if (stops.length === 1) {
    return Array.from({ length: daysCount }, () => stops[0]);
  }

  const result = [];
  const routeStops = [...stops];

  const shouldReserveLastReturnDay =
    hasExplicitReturnCity &&
    returnCity &&
    routeStops.length > 1 &&
    routeStops[0] === returnCity &&
    routeStops[routeStops.length - 1] === returnCity;

  const finalReturnCity = shouldReserveLastReturnDay ? routeStops.pop() : null;
  const daysForMainRoute = finalReturnCity ? Math.max(1, daysCount - 1) : daysCount;

  routeStops.forEach((city, index) => {
    if (result.length >= daysForMainRoute) return;

    const cityData = getCityData(city);
    const recommendedDays = Math.max(1, Number(cityData.recommendedDays || 1));
    const remainingCitiesAfterThis = routeStops.length - index - 1;
    const remainingDays = daysForMainRoute - result.length;
    const maxDaysForThisCity = Math.max(1, remainingDays - remainingCitiesAfterThis);
    const daysInCity = Math.min(recommendedDays, maxDaysForThisCity);

    for (let i = 0; i < daysInCity && result.length < daysForMainRoute; i += 1) {
      result.push(city);
    }
  });

  while (result.length < daysForMainRoute) {
    result.push(routeStops[routeStops.length - 1]);
  }

  if (finalReturnCity) {
    result.push(finalReturnCity);
  }

  return result.slice(0, daysCount);
};

const getCitiesForTrip = ({
  destination,
  daysCount,
  arrivalCity,
  returnCity,
}) => {
  const route = buildRouteStops({
    destination,
    daysCount,
    arrivalCity,
    returnCity,
  });

  const cities = distributeDaysAcrossRouteStops({
    stops: route.stops,
    destination,
    daysCount,
    returnCity: route.returnCity,
    hasExplicitReturnCity: route.hasExplicitReturnCity,
  });

  return {
    cities,
    stops: uniqueRouteStops(cities),
    route,
  };
};

const parseStyle = (prompt = "") => {
  const style = normalizeText(
    prompt.match(/Style de voyage\s*:\s*([^\n]+)/i)?.[1] || ""
  );

  if (style.includes("detente")) return "detente";
  if (style.includes("immersion") || style.includes("voir absolument")) return "dense";
  if (style.includes("insolite")) return "insolite";
  if (style.includes("aventure") || style.includes("nature")) return "nature";
  if (style.includes("gastronom")) return "gastronomie";
  return "essentiels";
};

const parseInterests = (prompt = "") => {
  const p = normalizeText(prompt);
  const interests = [];

  if (p.includes("musee") || p.includes("monument") || p.includes("culture")) interests.push("culture");
  if (p.includes("restaurant") || p.includes("gastronomie") || p.includes("marche alimentaire")) interests.push("gastronomie");
  if (p.includes("nature") || p.includes("parc") || p.includes("jardin")) interests.push("nature");
  if (p.includes("plage") || p.includes("mer")) interests.push("plage");
  if (p.includes("shopping") || p.includes("boutique")) interests.push("shopping");
  if (p.includes("histoire") || p.includes("patrimoine")) interests.push("histoire");
  if (p.includes("photo") || p.includes("photogenique")) interests.push("photo");
  if (p.includes("romantique")) interests.push("romantique");
  if (p.includes("famille")) interests.push("famille");
  if (p.includes("vie nocturne") || p.includes("bar")) interests.push("vie_nocturne");

  return interests;
};

const pick = (list, index) => list[index % list.length];

const getDayTitle = ({ city, index, daysCount, style, isTransportDay }) => {
  if (index === 0 && daysCount > 1) return `Arrivée et première découverte de ${city}`;
  if (index === daysCount - 1 && daysCount > 1) return `Derniers moments à ${city}`;
  if (isTransportDay) return `Trajet et découverte douce de ${city}`;

  if (style === "gastronomie") return `Saveurs locales à ${city}`;
  if (style === "nature") return `Nature et points de vue autour de ${city}`;
  if (style === "insolite") return `Côté local et insolite de ${city}`;
  if (style === "dense") return `Les essentiels de ${city} en rythme intense`;
  if (style === "detente") return `Journée douce à ${city}`;

  return `Découverte de ${city}`;
};

const COUNTRY_CITY_GROUPS = {
  danemark: ['Copenhague', 'Odense', 'Aarhus', 'Aalborg', 'Skagen'],
  italie: ['Rome', 'Florence', 'Venise'],
  espagne: ['Barcelone', 'Valence', 'Madrid'],
};

const TRANSPORT_ROUTES = [
  {
    from: 'Copenhague',
    to: 'Odense',
    mode: 'train',
    duration: '1h15 - 1h30',
    costs: {
      economique: '15€ - 30€',
      modere: '20€ - 45€',
      confort: '30€ - 60€',
      luxe: '45€ - 80€',
    },
    description:
      'Train direct entre Copenhague et Odense, logique pour rejoindre l’île de Fionie sans détour.',
    bookingTip: 'Réserver à l’avance permet souvent d’obtenir un meilleur tarif.',
  },
  {
    from: 'Odense',
    to: 'Aarhus',
    mode: 'train',
    duration: '1h30 - 1h50',
    costs: {
      economique: '15€ - 35€',
      modere: '20€ - 45€',
      confort: '30€ - 60€',
      luxe: '45€ - 80€',
    },
    description:
      'Train vers Aarhus, pratique pour continuer progressivement vers le Jutland.',
    bookingTip: 'Trajet simple à faire en milieu de journée pour garder du temps à l’arrivée.',
  },
  {
    from: 'Aarhus',
    to: 'Aalborg',
    mode: 'train',
    duration: '1h20 - 1h40',
    costs: {
      economique: '12€ - 28€',
      modere: '18€ - 38€',
      confort: '25€ - 50€',
      luxe: '40€ - 70€',
    },
    description:
      'Train régional vers Aalborg, cohérent pour remonter le Jutland sans changer de logique de transport.',
    bookingTip: 'Départ le matin ou en début d’après-midi recommandé.',
  },
  {
    from: 'Aalborg',
    to: 'Skagen',
    mode: 'train régional',
    duration: '2h - 2h30',
    costs: {
      economique: '12€ - 25€',
      modere: '18€ - 35€',
      confort: '25€ - 45€',
      luxe: '35€ - 60€',
    },
    description:
      'Train régional vers Skagen, généralement avec correspondance vers le nord du Jutland.',
    bookingTip: 'Prévoir une marge en cas de correspondance.',
  },
  {
    from: 'Skagen',
    to: 'Copenhague',
    mode: 'train',
    duration: '5h30 - 6h30',
    costs: {
      economique: '35€ - 70€',
      modere: '45€ - 90€',
      confort: '65€ - 120€',
      luxe: '90€ - 160€',
    },
    description:
      'Long retour en train vers Copenhague, à réserver pour le dernier jour si le vol retour part de Copenhague.',
    bookingTip: 'À placer sur une journée volontairement allégée.',
  },
  {
    from: 'Copenhague',
    to: 'Aarhus',
    mode: 'train',
    duration: '3h - 3h30',
    costs: {
      economique: '25€ - 50€',
      modere: '35€ - 75€',
      confort: '50€ - 95€',
      luxe: '75€ - 130€',
    },
    description:
      'Train vers Aarhus, plus simple pour une démo sans voiture.',
    bookingTip: 'Bonne option si l’itinéraire saute Odense.',
    alternatives: [
      {
        mode: 'bus + ferry',
        duration: '3h15 - 4h',
        estimated_cost: '30€ - 70€',
        description:
          'Alternative possible via bus et ferry, intéressante pour varier le trajet mais moins simple avec des bagages.',
      },
    ],
  },
  {
    from: 'Rome',
    to: 'Florence',
    mode: 'train grande vitesse',
    duration: '1h30 - 1h45',
    costs: {
      economique: '20€ - 40€',
      modere: '30€ - 60€',
      confort: '45€ - 80€',
      luxe: '70€ - 120€',
    },
    description:
      'Train grande vitesse direct, le choix le plus logique pour relier Rome à Florence.',
    bookingTip: 'Réserver à l’avance pour éviter les tarifs élevés.',
  },
  {
    from: 'Florence',
    to: 'Venise',
    mode: 'train grande vitesse',
    duration: '2h - 2h20',
    costs: {
      economique: '20€ - 45€',
      modere: '30€ - 65€',
      confort: '45€ - 85€',
      luxe: '70€ - 130€',
    },
    description:
      'Train grande vitesse vers Venise, logique pour terminer l’itinéraire au nord-est de l’Italie.',
    bookingTip: 'Privilégier un départ en matinée pour profiter de Venise l’après-midi.',
  },
  {
    from: 'Rome',
    to: 'Venise',
    mode: 'train grande vitesse',
    duration: '3h45 - 4h30',
    costs: {
      economique: '35€ - 70€',
      modere: '50€ - 95€',
      confort: '70€ - 130€',
      luxe: '100€ - 170€',
    },
    description:
      'Trajet direct possible, utile si l’itinéraire court saute Florence.',
    bookingTip: 'À réserver tôt car les prix varient fortement.',
  },
  {
    from: 'Barcelone',
    to: 'Valence',
    mode: 'train',
    duration: '2h45 - 3h30',
    costs: {
      economique: '18€ - 35€',
      modere: '25€ - 55€',
      confort: '40€ - 75€',
      luxe: '60€ - 110€',
    },
    description:
      'Train côtier vers Valence, logique pour descendre progressivement le long de la Méditerranée.',
    bookingTip: 'Trajet confortable à faire en matinée ou après le déjeuner.',
  },
  {
    from: 'Valence',
    to: 'Madrid',
    mode: 'train grande vitesse',
    duration: '1h50 - 2h15',
    costs: {
      economique: '18€ - 40€',
      modere: '25€ - 70€',
      confort: '45€ - 90€',
      luxe: '70€ - 130€',
    },
    description:
      'Train grande vitesse vers Madrid, plus rapide et logique que la voiture.',
    bookingTip: 'Très bon trajet pour une transition courte entre deux villes.',
  },
  {
    from: 'Barcelone',
    to: 'Madrid',
    mode: 'train grande vitesse',
    duration: '2h30 - 3h15',
    costs: {
      economique: '25€ - 55€',
      modere: '35€ - 85€',
      confort: '60€ - 110€',
      luxe: '90€ - 160€',
    },
    description:
      'Train grande vitesse direct, utile si l’itinéraire ne passe pas par Valence.',
    bookingTip: 'Réserver tôt pour éviter les prix élevés aux heures de pointe.',
  },
];

const normalizeTransportCity = (city = '') => normalizeText(city).replace(/[^a-z0-9]/g, '');

const getCityCountryKey = (city = '') => {
  const normalized = normalizeTransportCity(city);

  return Object.entries(COUNTRY_CITY_GROUPS).find(([, cities]) =>
    cities.some((candidate) => normalizeTransportCity(candidate) === normalized)
  )?.[0] || null;
};

const findTransportRoute = (city, nextCity) => {
  const from = normalizeTransportCity(city);
  const to = normalizeTransportCity(nextCity);

  const direct = TRANSPORT_ROUTES.find(
    (route) => normalizeTransportCity(route.from) === from && normalizeTransportCity(route.to) === to
  );

  if (direct) return { ...direct, reversed: false };

  const reversed = TRANSPORT_ROUTES.find(
    (route) => normalizeTransportCity(route.from) === to && normalizeTransportCity(route.to) === from
  );

  if (reversed) return { ...reversed, reversed: true };

  return null;
};

const getGenericTransportRoute = (city, nextCity) => {
  const country = getCityCountryKey(city);
  const nextCountry = getCityCountryKey(nextCity);

  if (country && country === nextCountry) {
    if (country === 'italie') {
      return {
        mode: 'train',
        duration: '1h30 - 3h30',
        costs: {
          economique: '18€ - 40€',
          modere: '25€ - 70€',
          confort: '45€ - 90€',
          luxe: '70€ - 130€',
        },
        description: `Trajet en train recommandé entre ${city} et ${nextCity}, plus logique que la voiture pour ce type d’itinéraire.`,
        bookingTip: 'Comparer les horaires et réserver à l’avance si possible.',
      };
    }

    if (country === 'espagne') {
      return {
        mode: 'train',
        duration: '2h - 4h',
        costs: {
          economique: '18€ - 45€',
          modere: '25€ - 75€',
          confort: '45€ - 100€',
          luxe: '70€ - 150€',
        },
        description: `Trajet en train recommandé entre ${city} et ${nextCity}, cohérent pour limiter les détours.`,
        bookingTip: 'Les trains rapides peuvent être beaucoup moins chers en réservant tôt.',
      };
    }

    if (country === 'danemark') {
      return {
        mode: 'train',
        duration: '1h30 - 4h',
        costs: {
          economique: '15€ - 35€',
          modere: '20€ - 60€',
          confort: '35€ - 80€',
          luxe: '60€ - 120€',
        },
        description: `Trajet en train recommandé entre ${city} et ${nextCity}, pratique pour une démo sans voiture.`,
        bookingTip: 'Prévoir une marge si le trajet implique une correspondance.',
      };
    }
  }

  return {
    mode: 'train ou bus',
    duration: '1h30 - 4h',
    costs: {
      economique: '10€ - 35€',
      modere: '20€ - 60€',
      confort: '35€ - 90€',
      luxe: '60€ - 150€',
    },
    description: `Trajet recommandé de ${city} à ${nextCity}, à confirmer selon les horaires réels.`,
    bookingTip: 'Vérifier les horaires avant de réserver.',
  };
};

const getTransportCost = (route, budget) => {
  const budgetKey = normalizeBudget(budget);
  return route.costs?.[budgetKey] || route.estimated_cost || route.cost || '20€ - 60€';
};

const getTransportDescription = ({ route, city, nextCity, constraints }) => {
  const baseDescription = route.description || `Trajet recommandé de ${city} à ${nextCity}.`;
  const directionNote = route.reversed
    ? `Trajet inverse de l’itinéraire habituel, mais cohérent pour rejoindre ${nextCity}.`
    : '';
  const avoidCarNote = constraints.avoidCar
    ? ' Sans voiture : privilégier train, bus, ferry ou transport public selon le trajet.'
    : '';

  return [baseDescription, directionNote, avoidCarNote].filter(Boolean).join(' ');
};

const buildTransport = ({ city, nextCity, budget, avoidItems = '' }) => {
  if (!nextCity || city === nextCity) return undefined;

  const constraints = parseAvoidItems(avoidItems);
  const route = findTransportRoute(city, nextCity) || getGenericTransportRoute(city, nextCity);

  const primaryOption = {
    mode: constraints.avoidCar && normalizeText(route.mode).includes('voiture')
      ? 'train ou transport public'
      : route.mode,
    description: getTransportDescription({ route, city, nextCity, constraints }),
    duration: route.duration,
    estimated_cost: getTransportCost(route, budget),
    booking_tip: route.bookingTip,
  };

  const alternatives = (route.alternatives || [])
    .filter((alternative) => {
      if (!constraints.avoidCar) return true;
      const text = normalizeText(`${alternative.mode || ''} ${alternative.description || ''}`);
      return !text.includes('voiture') && !text.includes('location');
    })
    .map((alternative) => ({
      mode: alternative.mode,
      description: alternative.description,
      duration: alternative.duration,
      estimated_cost: alternative.estimated_cost || alternative.cost || getTransportCost(route, budget),
      booking_tip: alternative.bookingTip || route.bookingTip,
    }));

  return {
    destination_city: nextCity,
    from_city: city,
    options: [primaryOption, ...alternatives].slice(0, 2),
  };
};

const CATEGORY_TO_TYPE = {
  culture: 'visite',
  food: 'repas',
  nature: 'nature',
  photo: 'photo',
  rain: 'visite',
};


const parsePriceNumbers = (value = '') => {
  return String(value)
    .match(/\d+/g)
    ?.map(Number)
    .filter((number) => !Number.isNaN(number)) || [];
};

const getMaxEstimatedCost = (activity) => {
  const numbers = parsePriceNumbers(activity?.estimatedCost || activity?.estimated_cost || '');
  if (!numbers.length) return 0;
  return Math.max(...numbers);
};

const parseAvoidItems = (avoidItems = '') => {
  const value = normalizeText(avoidItems);

  return {
    raw: String(avoidItems || '').trim(),
    avoidCar:
      value.includes('voiture') ||
      value.includes('location') ||
      value.includes('conduire') ||
      value.includes('parking'),
    avoidExpensiveRestaurants:
      value.includes('restaurant cher') ||
      value.includes('restaurants chers') ||
      value.includes('cher') ||
      value.includes('premium') ||
      value.includes('luxe') ||
      value.includes('gastronomique'),
    avoidMuseums:
      value.includes('musee') ||
      value.includes('musées') ||
      value.includes('museum'),
    avoidLongWalks:
      value.includes('longue marche') ||
      value.includes('longues marches') ||
      value.includes('trop marcher') ||
      value.includes('beaucoup marcher') ||
      value.includes('marche longue') ||
      value.includes('marche soutenue') ||
      value.includes('a pied') ||
      value.includes('à pied'),
    avoidTouristy:
      value.includes('touristique') ||
      value.includes('attrape touriste') ||
      value.includes('trop connu') ||
      value.includes('foule') ||
      value.includes('bondé') ||
      value.includes('bonde'),
    avoidPaid:
      value.includes('payant') ||
      value.includes('payante') ||
      value.includes('payer') ||
      value.includes('activites cheres') ||
      value.includes('activités chères'),
  };
};

const hasAvoidConstraints = (constraints = {}) => {
  return !!(
    constraints.raw ||
    constraints.avoidCar ||
    constraints.avoidExpensiveRestaurants ||
    constraints.avoidMuseums ||
    constraints.avoidLongWalks ||
    constraints.avoidTouristy ||
    constraints.avoidPaid
  );
};

const getAvoidSummary = (constraints = {}) => {
  const labels = [];

  if (constraints.avoidCar) labels.push('voiture évitée');
  if (constraints.avoidExpensiveRestaurants) labels.push('restaurants chers évités');
  if (constraints.avoidMuseums) labels.push('musées évités');
  if (constraints.avoidLongWalks) labels.push('longues marches évitées');
  if (constraints.avoidTouristy) labels.push('lieux trop touristiques évités');
  if (constraints.avoidPaid) labels.push('activités payantes limitées');

  return labels;
};

const isMuseumLikeActivity = (activity) => {
  const text = normalizeText(`${activity?.name || ''} ${activity?.description || ''} ${(activity?.tags || []).join(' ')}`);

  return (
    text.includes('musee') ||
    text.includes('museum') ||
    text.includes('galerie') ||
    text.includes('gallery') ||
    text.includes('aros') ||
    text.includes('prado') ||
    text.includes('louvre') ||
    text.includes('orsay')
  );
};

const isLongWalkLikeActivity = (activity) => {
  const text = normalizeText(`${activity?.name || ''} ${activity?.description || ''} ${(activity?.tags || []).join(' ')}`);

  return (
    text.includes('longue balade') ||
    text.includes('grande balade') ||
    text.includes('balade nature') ||
    text.includes('randonnee') ||
    text.includes('randonnée') ||
    text.includes('dunes') ||
    text.includes('plage') ||
    text.includes('parc') ||
    text.includes('jardins') ||
    text.includes('front de mer') ||
    text.includes('point de vue') ||
    text.includes('belvedere') ||
    text.includes('belvédère') ||
    text.includes('marselisborg') ||
    text.includes('montjuic') ||
    text.includes('casa de campo') ||
    text.includes('albufera')
  );
};

const isTouristyActivity = (activity) => {
  const text = normalizeText(`${activity?.name || ''} ${activity?.description || ''} ${(activity?.tags || []).join(' ')}`);

  return (
    text.includes('mustsee') ||
    text.includes('must see') ||
    text.includes('incontournable') ||
    text.includes('iconique') ||
    text.includes('emblematique') ||
    text.includes('emblématique') ||
    text.includes('tour eiffel') ||
    text.includes('trocadero') ||
    text.includes('nyhavn') ||
    text.includes('colisee') ||
    text.includes('sagrada') ||
    text.includes('rialto')
  );
};

const isPremiumOrExpensiveActivity = (activity) => {
  const text = normalizeText(`${activity?.name || ''} ${activity?.description || ''} ${(activity?.tags || []).join(' ')}`);
  const maxCost = getMaxEstimatedCost(activity);

  return (
    text.includes('premium') ||
    text.includes('haut de gamme') ||
    text.includes('gastronomique') ||
    maxCost >= 60 ||
    (String(activity?.estimatedCost || '').includes('kr') && maxCost >= 250)
  );
};

const isPaidActivity = (activity) => {
  const tags = activity?.tags || [];
  const cost = String(activity?.estimatedCost || '').trim();
  const numbers = parsePriceNumbers(cost);

  return tags.includes('paid') || (numbers.length > 0 && Math.max(...numbers) > 0);
};

const shouldAvoidActivity = (activity, constraints = {}, category = '') => {
  if (!activity) return false;

  if (constraints.avoidMuseums && isMuseumLikeActivity(activity)) return true;
  if (constraints.avoidLongWalks && isLongWalkLikeActivity(activity)) return true;
  if (constraints.avoidTouristy && isTouristyActivity(activity)) return true;
  if (constraints.avoidPaid && category !== 'food' && isPaidActivity(activity)) return true;
  if (constraints.avoidExpensiveRestaurants && category === 'food' && isPremiumOrExpensiveActivity(activity)) return true;

  return false;
};

const getFallbackCategoriesForAvoid = (category = '', constraints = {}) => {
  if (category === 'food') return ['food'];

  if (constraints.avoidMuseums && category === 'culture') {
    return ['photo', 'nature', 'culture'];
  }

  if (constraints.avoidLongWalks && (category === 'nature' || category === 'photo')) {
    return ['culture', 'photo', 'food'];
  }

  if (constraints.avoidTouristy) {
    return ['food', 'nature', 'photo', 'culture'];
  }

  return [category, 'culture', 'photo', 'nature'];
};

const pickFromFilteredList = (activities = [], index = 0, constraints = {}, category = '') => {
  const filtered = activities.filter((activity) => !shouldAvoidActivity(activity, constraints, category));
  const source = filtered.length ? filtered : activities;

  if (!source.length) return null;

  return source[index % source.length];
};

const getConcreteActivity = (city, category, index = 0, constraints = {}) => {
  const categories = getFallbackCategoriesForAvoid(category, constraints);

  for (const candidateCategory of categories) {
    const activities = getActivitiesByCategory(city, candidateCategory);
    const candidate = pickFromFilteredList(activities, index, constraints, candidateCategory);

    if (candidate && !shouldAvoidActivity(candidate, constraints, candidateCategory)) {
      return candidate;
    }
  }

  return pickActivity(city, category, index);
};

const adaptActivityForAvoidItems = (activity, constraints = {}) => {
  if (!activity || !hasAvoidConstraints(constraints)) return activity;

  let description = activity.description || '';
  const avoidSummary = getAvoidSummary(constraints);

  if (constraints.avoidLongWalks && activity.type !== 'repas') {
    description = addSentence(
      description,
      'Version adaptée pour limiter la marche : privilégiez taxi, métro, bus ou accès direct.'
    );
  }

  if (constraints.avoidCar && activity.type === 'transport') {
    description = addSentence(
      description,
      'Voiture évitée : privilégiez train, métro, bus, tram ou taxi selon le contexte.'
    );
  }

  if (constraints.avoidExpensiveRestaurants && activity.type === 'repas') {
    description = addSentence(
      description,
      'Restaurant cher évité : option locale ou abordable privilégiée.'
    );
  }

  if (avoidSummary.length && !description.includes('Contrainte prise en compte')) {
    description = addSentence(description, `Contrainte prise en compte : ${avoidSummary.join(', ')}.`);
  }

  return {
    ...activity,
    description,
  };
};

const activityToTripActivity = ({
  activity,
  time,
  type,
  fallbackName,
  fallbackDescription,
  fallbackCost,
  fallbackCoord,
  offset = 0,
  constraints = {},
}) => {
  if (!activity) {
    return {
      time,
      name: fallbackName,
      description: fallbackDescription,
      type,
      estimated_cost: fallbackCost,
      lat: fallbackCoord.lat + offset,
      lng: fallbackCoord.lng + offset,
    };
  }

  return adaptActivityForAvoidItems(
    {
      time,
      activity_id: activity.id,
      name: activity.name,
      description: activity.description,
      type: type || 'visite',
      estimated_cost: activity.estimatedCost,
      duration: activity.duration,
      tags: activity.tags,
      lat: activity.lat,
      lng: activity.lng,
    },
    constraints
  );
};

const getMainActivityCategory = ({ style, interests }) => {
  if (style === 'gastronomie' || interests.includes('gastronomie')) return 'food';
  if (style === 'nature' || interests.includes('nature')) return 'nature';
  if (interests.includes('photographie') || interests.includes('photo')) return 'photo';
  return 'culture';
};

const getSecondaryActivityCategory = ({ style, interests }) => {
  if (style === 'insolite') return 'photo';
  if (style === 'gastronomie' || interests.includes('gastronomie')) return 'food';
  if (style === 'nature' || interests.includes('nature')) return 'nature';
  if (interests.includes('photographie') || interests.includes('photo')) return 'photo';
  return 'culture';
};

const buildActivity = ({ time, name, description, type, cost, coord, offset }) => ({
  time,
  name,
  description,
  type,
  estimated_cost: cost,
  lat: coord.lat + offset,
  lng: coord.lng + offset,
});

const normalizeWalkingLevel = (walkingLevel = 'moyen') => {
  const value = normalizeText(walkingLevel);

  if (value.includes('faible') || value.includes('peu') || value.includes('moins')) return 'faible';
  if (value.includes('eleve') || value.includes('beaucoup') || value.includes('10')) return 'eleve';
  return 'moyen';
};

const getWalkingProfile = (walkingLevel = 'moyen') => {
  const level = normalizeWalkingLevel(walkingLevel);

  if (level === 'faible') {
    return {
      level,
      label: 'marche faible',
      dayNote:
        'Rythme pensé pour limiter la marche : les activités restent présentes, mais sont pensées avec taxi, métro, bus ou trajets courts.',
      activityNote:
        'Accessible sans longue marche, en privilégiant taxi ou transport en commun si besoin.',
      transportNote:
        'Prévoyez taxi, bus ou métro pour éviter les longues liaisons à pied.',
    };
  }

  if (level === 'eleve') {
    return {
      level,
      label: 'marche élevée',
      dayNote:
        'Rythme plus actif : la journée peut intégrer davantage de marche, de points de vue et de balades.',
      activityNote:
        'Convient à une journée active avec marche plus soutenue.',
      transportNote:
        'Les trajets à pied sont davantage assumés si cela rend la journée plus agréable.',
    };
  }

  return {
    level: 'moyen',
    label: 'marche modérée',
    dayNote:
      'Rythme équilibré : les visites sont organisées pour éviter les détours inutiles.',
    activityNote:
      'Rythme équilibré, avec des trajets raisonnables entre les étapes.',
    transportNote:
      'Les trajets restent équilibrés entre marche et transports.',
  };
};

const addSentence = (text = '', sentence = '') => {
  const cleanText = String(text || '').trim();
  if (!sentence) return cleanText;
  if (!cleanText) return sentence;
  if (cleanText.includes(sentence)) return cleanText;
  return `${cleanText} ${sentence}`;
};

const parseTimeToMinutes = (timeValue = '') => {
  const match = String(timeValue || '').match(/(\d{1,2})\s*[:hH]\s*(\d{2})?/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2] || 0);

  if (Number.isNaN(hours) || hours < 0 || hours > 23) return null;
  if (Number.isNaN(minutes) || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
};

const formatMinutesToTime = (minutesValue, fallback = '15:00') => {
  if (typeof minutesValue !== 'number' || Number.isNaN(minutesValue)) return fallback;

  const bounded = Math.max(0, Math.min(23 * 60 + 59, minutesValue));
  const hours = Math.floor(bounded / 60);
  const minutes = bounded % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const addMinutesToTime = (timeValue, minutesToAdd, fallback = '15:00') => {
  const base = parseTimeToMinutes(timeValue);

  if (base === null) return fallback;

  return formatMinutesToTime(base + minutesToAdd, fallback);
};

const getArrivalProfile = (arrivalTime = '') => {
  const minutes = parseTimeToMinutes(arrivalTime);

  if (minutes === null) {
    return {
      period: 'standard',
      arrivalTime: '15:00',
      firstActivityTime: '17:30',
      dinnerTime: '20:00',
    };
  }

  if (minutes >= 19 * 60) {
    return {
      period: 'late',
      arrivalTime: formatMinutesToTime(minutes),
      dinnerTime: formatMinutesToTime(Math.min(minutes + 60, 22 * 60), '20:30'),
    };
  }

  if (minutes <= 10 * 60 + 30) {
    return {
      period: 'early',
      arrivalTime: formatMinutesToTime(minutes),
      firstActivityTime: formatMinutesToTime(Math.max(minutes + 90, 10 * 60 + 30), '10:30'),
      lunchTime: '12:30',
      afternoonTime: '15:30',
      dinnerTime: '20:00',
    };
  }

  if (minutes <= 14 * 60) {
    return {
      period: 'midday',
      arrivalTime: formatMinutesToTime(minutes),
      lunchTime: formatMinutesToTime(Math.max(minutes + 60, 12 * 60 + 30), '12:30'),
      firstActivityTime: formatMinutesToTime(Math.max(minutes + 120, 15 * 60), '15:00'),
      dinnerTime: '20:00',
    };
  }

  return {
    period: 'afternoon',
    arrivalTime: formatMinutesToTime(minutes),
    firstActivityTime: formatMinutesToTime(Math.max(minutes + 90, 17 * 60), '17:30'),
    dinnerTime: '20:00',
  };
};

const getDepartureProfile = (departureTime = '') => {
  const minutes = parseTimeToMinutes(departureTime);

  if (minutes === null) {
    return {
      period: 'standard',
      departureTime: '15:00',
      morningTime: '09:30',
      lunchTime: '12:00',
    };
  }

  if (minutes <= 10 * 60) {
    return {
      period: 'early',
      departureTime: formatMinutesToTime(minutes),
    };
  }

  if (minutes <= 14 * 60) {
    return {
      period: 'midday',
      departureTime: formatMinutesToTime(minutes),
      morningTime: formatMinutesToTime(Math.max(9 * 60, minutes - 180), '09:00'),
    };
  }

  if (minutes <= 18 * 60) {
    return {
      period: 'afternoon',
      departureTime: formatMinutesToTime(minutes),
      morningTime: '09:30',
      lunchTime: '12:00',
    };
  }

  return {
    period: 'late',
    departureTime: formatMinutesToTime(minutes),
    morningTime: '09:30',
    lunchTime: '12:30',
    afternoonTime: '15:30',
  };
};

const isSnackLikeFood = (activity) => {
  const text = normalizeText(`${activity?.name || ''} ${activity?.description || ''}`);

  return (
    text.includes('boulangerie') ||
    text.includes('glace') ||
    text.includes('gelato') ||
    text.includes('churros') ||
    text.includes('horchata') ||
    text.includes('cafe') ||
    text.includes('pause sucree') ||
    text.includes('pause sucr') ||
    text.includes('viennoiserie')
  );
};

const getFoodForMeal = (city, index, meal = 'lunch', constraints = {}) => {
  const foodActivities = getActivitiesByCategory(city, 'food');

  if (!foodActivities.length) return getConcreteActivity(city, 'food', index, constraints);

  const removeExpensiveIfNeeded = (activities) => {
    if (!constraints.avoidExpensiveRestaurants) return activities;

    const filtered = activities.filter(
      (activity) => !isPremiumOrExpensiveActivity(activity)
    );

    return filtered.length ? filtered : activities;
  };

  if (meal === 'dinner') {
    const dinnerOptions = removeExpensiveIfNeeded(
      foodActivities.filter((activity) => !isSnackLikeFood(activity))
    );
    return dinnerOptions[index % dinnerOptions.length] || foodActivities[index % foodActivities.length];
  }

  if (meal === 'snack') {
    const snackOptions = removeExpensiveIfNeeded(foodActivities.filter(isSnackLikeFood));
    return snackOptions[index % snackOptions.length] || foodActivities[index % foodActivities.length];
  }

  const lunchOptions = removeExpensiveIfNeeded(foodActivities);
  return lunchOptions[index % lunchOptions.length];
};

const getExtraWalkingActivity = (city, index, constraints = {}) => {
  return (
    getConcreteActivity(city, 'photo', index + 2, constraints) ||
    getConcreteActivity(city, 'nature', index + 2, constraints) ||
    getConcreteActivity(city, 'culture', index + 3, constraints)
  );
};

const buildActivities = ({
  city,
  dayIndex,
  daysCount,
  budget,
  style,
  interests,
  isTransportDay,
  walkingLevel = 'moyen',
  arrivalTime = '',
  departureTime = '',
  avoidItems = '',
}) => {
  const data = getCityData(city);
  const coord = { lat: data.lat, lng: data.lng };
  const costs = getCostByBudget(budget);
  const walking = getWalkingProfile(walkingLevel);
  const constraints = parseAvoidItems(avoidItems);
  const pickConcrete = (category, index = 0) => getConcreteActivity(city, category, index, constraints);

  const isArrival = dayIndex === 0 && daysCount > 1;
  const isDeparture = dayIndex === daysCount - 1 && daysCount > 1;
  const arrivalProfile = getArrivalProfile(arrivalTime);
  const departureProfile = getDepartureProfile(departureTime);

  const mainCategory = getMainActivityCategory({ style, interests });
  const secondaryCategory = getSecondaryActivityCategory({ style, interests });

  const culture1 = pickConcrete('culture', dayIndex);
  const culture2 = pickConcrete('culture', dayIndex + 1);
  const culture3 = pickConcrete('culture', dayIndex + 2);

  const lunch = getFoodForMeal(city, dayIndex, 'lunch', constraints);
  const dinner = getFoodForMeal(city, dayIndex + 1, 'dinner', constraints);
  const snack = getFoodForMeal(city, dayIndex + 2, 'snack', constraints);

  const nature1 = pickConcrete('nature', dayIndex);
  const nature2 = pickConcrete('nature', dayIndex + 1);
  const photo1 = pickConcrete('photo', dayIndex);
  const photo2 = pickConcrete('photo', dayIndex + 1);

  const mainActivity = pickConcrete(mainCategory, dayIndex) || culture1;
  const secondaryActivity =
    pickConcrete(secondaryCategory, dayIndex + 1) ||
    culture2 ||
    nature1 ||
    photo1;

  const addUnique = (activities, activity) => {
    if (!activity) return activities;

    const alreadyExists = activities.some(
      (item) => item.name && activity.name && item.name === activity.name
    );

    return alreadyExists ? activities : [...activities, activity];
  };

  const buildConcrete = ({
    activity,
    time,
    type,
    fallbackName,
    fallbackDescription,
    fallbackCost,
    offset = 0,
    walkingNote = false,
  }) => {
    const built = activityToTripActivity({
      activity,
      time,
      type,
      fallbackName,
      fallbackDescription,
      fallbackCost,
      fallbackCoord: coord,
      offset,
      constraints,
    });

    if (!walkingNote || built.type === 'repas') return built;

    return {
      ...built,
      description: addSentence(built.description, walking.activityNote),
    };
  };

  const mainForWalking = walking.level === 'faible' ? culture1 || mainActivity : mainActivity;
  const secondaryForWalking = walking.level === 'faible' ? culture2 || secondaryActivity : secondaryActivity;
  const lateForWalking = walking.level === 'faible' ? photo1 || culture3 : photo1 || nature1 || photo2;

  if (isArrival) {
    const arrivalActivity =
      walking.level === 'faible' ? culture1 || photo1 : photo1 || nature1 || culture1;

    const arrivalBase = {
      time: arrivalProfile.arrivalTime,
      name: `Arrivée à ${city}`,
      description: addSentence(
        arrivalProfile.period === 'late'
          ? 'Arrivée tardive : installation, récupération et programme très léger.'
          : arrivalProfile.period === 'early'
            ? 'Arrivée tôt : installation puis vraie demi-journée possible sans charger le programme.'
            : 'Installation et première prise de repères, sans programme trop chargé.',
        walking.transportNote
      ),
      type: 'transport',
      estimated_cost: '0€',
      lat: coord.lat,
      lng: coord.lng,
    };

    if (arrivalProfile.period === 'late') {
      return [
        arrivalBase,
        buildConcrete({
          activity: dinner || lunch,
          time: arrivalProfile.dinnerTime,
          type: 'repas',
          fallbackName: `Dîner local à ${city}`,
          fallbackDescription: `Dîner simple dans un ${costs.restaurantType}, sans visite lourde après l’arrivée.`,
          fallbackCost: costs.meal,
          offset: 0.014,
        }),
      ];
    }

    if (arrivalProfile.period === 'early') {
      const halfDayActivities = [
        arrivalBase,
        buildConcrete({
          activity: culture1 || arrivalActivity,
          time: arrivalProfile.firstActivityTime,
          type: culture1 ? 'visite' : photo1 ? 'photo' : nature1 ? 'nature' : 'visite',
          fallbackName: `Première vraie découverte de ${city}`,
          fallbackDescription: 'Demi-journée possible grâce à une arrivée tôt.',
          fallbackCost: costs.activity,
          offset: 0.01,
          walkingNote: true,
        }),
        buildConcrete({
          activity: lunch,
          time: arrivalProfile.lunchTime,
          type: 'repas',
          fallbackName: 'Déjeuner local accessible',
          fallbackDescription: `Pause repas dans un ${costs.restaurantType}.`,
          fallbackCost: costs.meal,
          offset: 0.013,
        }),
        buildConcrete({
          activity: walking.level === 'eleve' ? photo1 || nature1 || culture2 : photo1 || culture2 || nature1,
          time: arrivalProfile.afternoonTime,
          type: photo1 ? 'photo' : nature1 ? 'nature' : 'visite',
          fallbackName: `Découverte complémentaire à ${city}`,
          fallbackDescription: 'Activité courte et réaliste pour compléter la première journée.',
          fallbackCost: costs.activity,
          offset: 0.018,
          walkingNote: true,
        }),
      ];

      if (style !== 'detente') {
        halfDayActivities.push(
          buildConcrete({
            activity: dinner || lunch,
            time: arrivalProfile.dinnerTime,
            type: 'repas',
            fallbackName: `Dîner local à ${city}`,
            fallbackDescription: `Dîner simple dans un ${costs.restaurantType}.`,
            fallbackCost: costs.meal,
            offset: 0.014,
          })
        );
      }

      return halfDayActivities;
    }

    return [
      arrivalBase,
      buildConcrete({
        activity: arrivalActivity,
        time: arrivalProfile.firstActivityTime,
        type: walking.level === 'faible' ? 'visite' : photo1 ? 'photo' : nature1 ? 'nature' : 'visite',
        fallbackName: `Première découverte accessible de ${city}`,
        fallbackDescription: 'Première activité simple pour ressentir l’ambiance locale.',
        fallbackCost: '0€',
        offset: 0.01,
        walkingNote: true,
      }),
      buildConcrete({
        activity: dinner || lunch,
        time: arrivalProfile.dinnerTime,
        type: 'repas',
        fallbackName: `Dîner local à ${city}`,
        fallbackDescription: `Dîner simple dans un ${costs.restaurantType}.`,
        fallbackCost: costs.meal,
        offset: 0.014,
      }),
    ];
  }

  if (isDeparture) {
    return buildDepartureDayActivities({
      city,
      budget,
      walkingLevel,
      departureTime,
      culture1,
      photo1,
      nature1,
      lunch,
      coord,
      costs,
      buildConcrete,
    });
  }

  if (isTransportDay) {
    return [
      {
        time: '10:00',
        name: `Trajet vers ${city}`,
        description: addSentence(
          addSentence(
            'Déplacement inter-ville avec une journée volontairement allégée.',
            walking.transportNote
          ),
          constraints.avoidCar ? 'Voiture évitée : trajet pensé en train, bus, métro, tram ou taxi.' : ''
        ),
        type: 'transport',
        estimated_cost: '20€ - 60€',
        lat: coord.lat,
        lng: coord.lng,
      },
      buildConcrete({
        activity: walking.level === 'eleve' ? photo1 || culture1 : culture1 || photo1,
        time: '15:30',
        type: walking.level === 'eleve' && photo1 ? 'photo' : 'visite',
        fallbackName: `Première découverte de ${city}`,
        fallbackDescription: 'Découverte douce du quartier principal après le trajet.',
        fallbackCost: costs.activity,
        offset: 0.012,
        walkingNote: true,
      }),
      buildConcrete({
        activity: dinner || lunch,
        time: '20:00',
        type: 'repas',
        fallbackName: `Dîner local à ${city}`,
        fallbackDescription: `Adresse cohérente avec un budget ${normalizeBudget(budget)}.`,
        fallbackCost: costs.meal,
        offset: 0.016,
      }),
    ];
  }

  let activities = [];

  if (style === 'detente') {
    activities = addUnique(
      activities,
      buildConcrete({
        activity: walking.level === 'faible' ? culture1 || mainActivity : nature1 || photo1 || mainActivity,
        time: '09:45',
        type: walking.level === 'faible' ? 'visite' : nature1 ? 'nature' : photo1 ? 'photo' : CATEGORY_TO_TYPE[mainCategory] || 'visite',
        fallbackName: `Découverte douce de ${city}`,
        fallbackDescription: 'Activité principale légère, sans pression.',
        fallbackCost: costs.activity,
        offset: 0.01,
        walkingNote: true,
      })
    );

    activities = addUnique(
      activities,
      buildConcrete({
        activity: lunch,
        time: '12:30',
        type: 'repas',
        fallbackName: 'Déjeuner local accessible',
        fallbackDescription: `Pause repas dans un ${costs.restaurantType}.`,
        fallbackCost: costs.meal,
        offset: 0.013,
      })
    );

    activities = addUnique(
      activities,
      buildConcrete({
        activity: lateForWalking,
        time: '16:30',
        type: lateForWalking === nature1 || lateForWalking === nature2 ? 'nature' : lateForWalking === photo1 || lateForWalking === photo2 ? 'photo' : 'visite',
        fallbackName: 'Pause détente et spot agréable',
        fallbackDescription: 'Temps libre guidé pour garder une journée respirante.',
        fallbackCost: '0€',
        offset: 0.022,
        walkingNote: true,
      })
    );

    return activities;
  }

  if (style === 'gastronomie' || interests.includes('gastronomie')) {
    activities = addUnique(
      activities,
      buildConcrete({
        activity: culture1 || photo1,
        time: '09:30',
        type: culture1 ? 'visite' : 'photo',
        fallbackName: `Découverte de ${city}`,
        fallbackDescription: 'Découverte principale de la journée avant les pauses gourmandes.',
        fallbackCost: costs.activity,
        offset: 0.01,
        walkingNote: true,
      })
    );

    activities = addUnique(
      activities,
      buildConcrete({
        activity: lunch,
        time: '12:15',
        type: 'repas',
        fallbackName: 'Déjeuner local',
        fallbackDescription: `Pause repas dans un ${costs.restaurantType}.`,
        fallbackCost: costs.meal,
        offset: 0.013,
      })
    );

    activities = addUnique(
      activities,
      buildConcrete({
        activity: snack || culture2,
        time: '15:00',
        type: snack ? 'repas' : 'visite',
        fallbackName: 'Pause gourmande locale',
        fallbackDescription: 'Marché, café, spécialité ou adresse locale à tester.',
        fallbackCost: costs.meal,
        offset: 0.018,
      })
    );

    activities = addUnique(
      activities,
      buildConcrete({
        activity: lateForWalking,
        time: '17:30',
        type: lateForWalking === nature1 || lateForWalking === nature2 ? 'nature' : lateForWalking === photo1 || lateForWalking === photo2 ? 'photo' : 'visite',
        fallbackName: 'Spot agréable de fin de journée',
        fallbackDescription: 'Pause visuelle ou balade courte avant le dîner.',
        fallbackCost: '0€',
        offset: 0.022,
        walkingNote: true,
      })
    );

    activities = addUnique(
      activities,
      buildConcrete({
        activity: dinner || lunch,
        time: '20:00',
        type: 'repas',
        fallbackName: 'Dîner recommandé',
        fallbackDescription: 'Dîner cohérent avec le budget choisi.',
        fallbackCost: costs.meal,
        offset: 0.015,
      })
    );

    return activities;
  }

  if (style === 'nature' || interests.includes('nature')) {
    activities = addUnique(
      activities,
      buildConcrete({
        activity: walking.level === 'faible' ? culture1 || nature1 : nature1 || mainActivity,
        time: '09:30',
        type: walking.level === 'faible' ? 'visite' : nature1 ? 'nature' : CATEGORY_TO_TYPE[mainCategory] || 'visite',
        fallbackName: `Nature et respiration à ${city}`,
        fallbackDescription: 'Début de journée plus calme avec un lieu ouvert ou une découverte accessible.',
        fallbackCost: costs.activity,
        offset: 0.01,
        walkingNote: true,
      })
    );

    activities = addUnique(
      activities,
      buildConcrete({
        activity: lunch,
        time: '12:30',
        type: 'repas',
        fallbackName: 'Déjeuner local accessible',
        fallbackDescription: `Pause repas dans un ${costs.restaurantType}.`,
        fallbackCost: costs.meal,
        offset: 0.013,
      })
    );

    activities = addUnique(
      activities,
      buildConcrete({
        activity: walking.level === 'faible' ? photo1 || culture2 : nature2 || photo1 || secondaryActivity,
        time: '14:30',
        type: walking.level === 'faible' ? (photo1 ? 'photo' : 'visite') : nature2 ? 'nature' : photo1 ? 'photo' : CATEGORY_TO_TYPE[secondaryCategory] || 'visite',
        fallbackName: `Deuxième pause nature à ${city}`,
        fallbackDescription: 'Activité respirante, adaptée au niveau de marche choisi.',
        fallbackCost: costs.activity,
        offset: 0.018,
        walkingNote: true,
      })
    );

    if (walking.level !== 'faible') {
      activities = addUnique(
        activities,
        buildConcrete({
          activity: photo1 || photo2,
          time: '17:30',
          type: 'photo',
          fallbackName: 'Point de vue ou spot photo',
          fallbackDescription: 'Fin de journée pensée pour une belle lumière ou un lieu photogénique.',
          fallbackCost: '0€',
          offset: 0.022,
          walkingNote: true,
        })
      );
    }

    activities = addUnique(
      activities,
      buildConcrete({
        activity: dinner || lunch,
        time: '20:00',
        type: 'repas',
        fallbackName: 'Dîner recommandé',
        fallbackDescription: 'Restaurant cohérent avec le budget choisi.',
        fallbackCost: costs.meal,
        offset: 0.015,
      })
    );

    return activities;
  }

  if (style === 'dense') {
    const denseBlocks = [
      { activity: culture1 || mainActivity, time: '08:45', type: 'visite', name: `Premier temps fort à ${city}`, desc: 'Début de journée tôt pour profiter au maximum.' },
      { activity: culture2 || secondaryActivity, time: '10:45', type: 'visite', name: `Deuxième temps fort à ${city}`, desc: 'Deuxième temps fort dans une zone cohérente.' },
      { activity: lunch, time: '12:30', type: 'repas', name: 'Déjeuner local accessible', desc: `Pause repas dans un ${costs.restaurantType}.` },
      { activity: culture3 || nature1 || photo1, time: '14:30', type: culture3 ? 'visite' : nature1 ? 'nature' : 'photo', name: `Visite complémentaire à ${city}`, desc: 'Ajout d’une étape supplémentaire pour un rythme plus intense.' },
      { activity: lateForWalking, time: '17:30', type: lateForWalking === nature1 || lateForWalking === nature2 ? 'nature' : lateForWalking === photo1 || lateForWalking === photo2 ? 'photo' : 'visite', name: 'Spot de fin de journée', desc: 'Pause visuelle ou respiration avant le dîner.' },
    ];

    denseBlocks.forEach((block) => {
      activities = addUnique(
        activities,
        buildConcrete({
          activity: block.activity,
          time: block.time,
          type: block.type,
          fallbackName: block.name,
          fallbackDescription: block.desc,
          fallbackCost: block.type === 'repas' ? costs.meal : costs.activity,
          offset: 0.01,
          walkingNote: block.type !== 'repas',
        })
      );
    });

    if (walking.level === 'eleve') {
      activities = addUnique(
        activities,
        buildConcrete({
          activity: getExtraWalkingActivity(city, dayIndex, constraints),
          time: '18:30',
          type: 'photo',
          fallbackName: 'Point de vue bonus',
          fallbackDescription: 'Bonus ajouté car le niveau de marche accepté est élevé.',
          fallbackCost: '0€',
          offset: 0.03,
          walkingNote: true,
        })
      );
    }

    activities = addUnique(
      activities,
      buildConcrete({
        activity: dinner || lunch,
        time: '20:00',
        type: 'repas',
        fallbackName: 'Dîner recommandé',
        fallbackDescription: 'Restaurant cohérent avec le budget choisi.',
        fallbackCost: costs.meal,
        offset: 0.015,
      })
    );

    return activities;
  }

  activities = addUnique(
    activities,
    buildConcrete({
      activity: style === 'insolite' ? photo1 || mainForWalking : mainForWalking,
      time: '09:30',
      type:
        style === 'insolite'
          ? photo1
            ? 'photo'
            : CATEGORY_TO_TYPE[mainCategory] || 'visite'
          : CATEGORY_TO_TYPE[mainCategory] || 'visite',
      fallbackName: `Découverte de ${city}`,
      fallbackDescription: 'Activité principale de la journée.',
      fallbackCost: costs.activity,
      offset: 0.01,
      walkingNote: true,
    })
  );

  activities = addUnique(
    activities,
    buildConcrete({
      activity: lunch,
      time: '12:30',
      type: 'repas',
      fallbackName: 'Déjeuner local accessible',
      fallbackDescription: `Pause repas dans un ${costs.restaurantType}.`,
      fallbackCost: costs.meal,
      offset: 0.013,
    })
  );

  activities = addUnique(
    activities,
    buildConcrete({
      activity: secondaryForWalking,
      time: '14:30',
      type: walking.level === 'faible' ? 'visite' : CATEGORY_TO_TYPE[secondaryCategory] || 'visite',
      fallbackName: `Deuxième découverte à ${city}`,
      fallbackDescription: 'Deuxième activité dans une zone cohérente.',
      fallbackCost: costs.activity,
      offset: 0.018,
      walkingNote: true,
    })
  );

  activities = addUnique(
    activities,
    buildConcrete({
      activity: lateForWalking,
      time: '17:30',
      type: lateForWalking === nature1 || lateForWalking === nature2 ? 'nature' : lateForWalking === photo1 || lateForWalking === photo2 ? 'photo' : 'visite',
      fallbackName: 'Spot agréable de fin de journée',
      fallbackDescription: 'Pause visuelle ou respiration avant le dîner.',
      fallbackCost: '0€',
      offset: 0.022,
      walkingNote: true,
    })
  );

  if (walking.level === 'eleve') {
    activities = addUnique(
      activities,
      buildConcrete({
        activity: getExtraWalkingActivity(city, dayIndex, constraints),
        time: '18:30',
        type: 'photo',
        fallbackName: 'Point de vue bonus',
        fallbackDescription: 'Bonus ajouté car le niveau de marche accepté est élevé.',
        fallbackCost: '0€',
        offset: 0.03,
        walkingNote: true,
      })
    );
  }

  activities = addUnique(
    activities,
    buildConcrete({
      activity: dinner || lunch,
      time: '20:00',
      type: 'repas',
      fallbackName: 'Dîner recommandé',
      fallbackDescription: 'Restaurant cohérent avec le budget choisi.',
      fallbackCost: costs.meal,
      offset: 0.015,
    })
  );

  return activities;
};


const buildDayDescription = ({ city, style, interests, isTransportDay, walkingLevel = 'moyen', avoidItems = '' }) => {
  const walking = getWalkingProfile(walkingLevel);
  const constraints = parseAvoidItems(avoidItems);
  const avoidSummary = getAvoidSummary(constraints);
  let description = '';

  if (isTransportDay) {
    description = `Journée plus légère avec trajet vers ${city}, puis découverte simple à l’arrivée.`;
  } else if (style === "detente") {
    description = `Journée douce à ${city}, avec peu de pression et suffisamment de temps libre.`;
  } else if (style === "dense") {
    description = `Journée dense mais structurée pour voir un maximum de choses sans perdre le fil.`;
  } else if (style === "insolite") {
    description = `Journée pensée pour sortir des lieux trop classiques et découvrir une facette plus locale.`;
  } else if (style === "nature") {
    description = `Journée équilibrée avec davantage de respiration, de balades et de points de vue.`;
  } else if (style === "gastronomie" || interests.includes("gastronomie")) {
    description = `Journée construite autour des découvertes locales, des pauses gourmandes et des quartiers vivants.`;
  } else {
    description = `Journée organisée par temps forts pour garder un rythme agréable.`;
  }

  const avoidNote = avoidSummary.length
    ? `Contraintes prises en compte : ${avoidSummary.join(', ')}.`
    : '';

  return `${description} ${walking.dayNote} ${avoidNote}`.trim();
};


const isDinnerLikeActivity = (activity) => {
  const text = normalizeText(
    `${activity?.time || ''} ${activity?.name || ''} ${activity?.description || ''} ${activity?.type || ''}`
  );
  const activityMinutes = parseTimeToMinutes(activity?.time);

  return (
    text.includes('diner') ||
    text.includes('dîner') ||
    text.includes('soir') ||
    (activity?.type === 'repas' && activityMinutes !== null && activityMinutes >= 18 * 60)
  );
};

const removeDinnerAndAfterDeparture = (activities = [], departureTime = '') => {
  const departureMinutes = parseTimeToMinutes(departureTime);

  return activities.filter((activity) => {
    if (!activity) return false;

    if (normalizeText(activity.name || '') === 'depart') return true;

    if (isDinnerLikeActivity(activity)) return false;

    const activityMinutes = parseTimeToMinutes(activity.time);

    if (
      departureMinutes !== null &&
      activityMinutes !== null &&
      activityMinutes >= departureMinutes
    ) {
      return false;
    }

    return true;
  });
};

const buildDepartureDayActivities = ({
  city,
  budget,
  walkingLevel,
  departureTime,
  culture1,
  photo1,
  nature1,
  lunch,
  coord,
  costs,
  buildConcrete,
}) => {
  const departureProfile = getDepartureProfile(departureTime);
  const walking = getWalkingProfile(walkingLevel);

  const departureBase = {
    time: departureProfile.departureTime || departureTime || '15:00',
    name: 'Départ',
    description:
      departureProfile.period === 'early'
        ? 'Départ tôt : aucune activité prévue avant le trajet.'
        : 'Trajet vers la gare ou l’aéroport. Aucun dîner n’est prévu le jour du départ.',
    type: 'transport',
    estimated_cost: 'Selon transport',
    lat: coord.lat,
    lng: coord.lng,
  };

  if (departureProfile.period === 'early') {
    return [departureBase];
  }

  const morningActivity = buildConcrete({
    activity: walking.level === 'faible' ? culture1 || photo1 : photo1 || culture1 || nature1,
    time: departureProfile.morningTime || '09:30',
    type: walking.level === 'faible' ? 'visite' : photo1 ? 'photo' : culture1 ? 'visite' : 'nature',
    fallbackName: `Dernier moment léger à ${city}`,
    fallbackDescription:
      departureProfile.period === 'midday'
        ? 'Activité très courte avant un départ en milieu de journée.'
        : 'Dernière activité courte avant le départ.',
    fallbackCost: '0€',
    offset: 0.01,
    walkingNote: true,
  });

  const activities = [morningActivity];

  if (departureProfile.period === 'late') {
    activities.push(
      buildConcrete({
        activity: lunch,
        time: departureProfile.lunchTime || '12:30',
        type: 'repas',
        fallbackName: 'Déjeuner pratique avant départ',
        fallbackDescription: 'Repas simple dans un quartier bien connecté avant le départ.',
        fallbackCost: costs.meal,
        offset: 0.012,
      })
    );

    if (departureProfile.afternoonTime) {
      activities.push(
        buildConcrete({
          activity: photo1 || culture1 || nature1,
          time: departureProfile.afternoonTime,
          type: photo1 ? 'photo' : culture1 ? 'visite' : 'nature',
          fallbackName: 'Dernière activité courte',
          fallbackDescription:
            'Activité courte possible grâce à un départ tardif. Aucun dîner complet n’est ajouté le jour du départ.',
          fallbackCost: '0€',
          offset: 0.018,
          walkingNote: true,
        })
      );
    }
  }

  if (departureProfile.period === 'afternoon' && departureProfile.lunchTime) {
    activities.push(
      buildConcrete({
        activity: lunch,
        time: departureProfile.lunchTime,
        type: 'repas',
        fallbackName: 'Déjeuner pratique avant départ',
        fallbackDescription: 'Repas simple avant le trajet. Aucun dîner n’est prévu le jour du départ.',
        fallbackCost: costs.meal,
        offset: 0.012,
      })
    );
  }

  activities.push(departureBase);

  return removeDinnerAndAfterDeparture(activities, departureBase.time);
};

const cleanDepartureDayActivities = (activities = [], departureTime = '', isDepartureDay = false) => {
  if (!isDepartureDay) return activities;
  return removeDinnerAndAfterDeparture(activities, departureTime);
};


const getWeatherAlternativesForCities = (cities = [], constraints = {}) => {
  const alternatives = Array.from(
    new Set(
      cities
        .flatMap((city) => getActivitiesByCategory(city, 'rain'))
        .filter((activity) => !shouldAvoidActivity(activity, constraints, 'rain'))
        .slice(0, 3)
        .map((activity) => `${activity.name} — ${activity.description}`)
    )
  );

  return alternatives.length > 0
    ? alternatives
    : [
        "Remplacer les longues balades par un café, un marché couvert ou une visite courte adaptée aux contraintes.",
        "Décaler les points de vue ou spots photo à une journée plus dégagée.",
        "Privilégier les quartiers centraux pour limiter les trajets sous la pluie.",
      ];
};

export const generateLocalTrip = ({
  destination,
  daysCount,
  budget,
  travelers,
  style,
  interests,
  walkingLevel,
  arrivalCity,
  returnCity,
  arrivalTime,
  departureTime,
  avoidItems,
}) => {
  const routePlan = getCitiesForTrip({
    destination,
    daysCount,
    arrivalCity,
    returnCity,
  });
  const cities = routePlan.cities;
  const routeStops = routePlan.stops;
  const costs = getCostByBudget(budget);
  const budgetKey = normalizeBudget(budget);
  const destinationConfig = getDestinationConfig(destination);
  const constraints = parseAvoidItems(avoidItems);
  const avoidSummary = getAvoidSummary(constraints);
  const routeSummary =
    routeStops.length > 1
      ? ` Parcours prévu : ${routeStops.join(' → ')}.`
      : '';

  const itinerary = cities.map((city, index) => {
    const data = getCityData(city);
    const previousCity = cities[index - 1];
    const nextCity = cities[index + 1];
    const isTransportDay = !!previousCity && previousCity !== city;
    const isDepartureDay = index === daysCount - 1 && daysCount > 1;

    return {
      day: index + 1,
      city,
      lat: data.lat,
      lng: data.lng,
      title: getDayTitle({
        city,
        index,
        daysCount,
        style,
        isTransportDay,
      }),
      description: buildDayDescription({
        city,
        style,
        interests,
        isTransportDay,
        walkingLevel,
        arrivalTime,
        departureTime,
        avoidItems,
      }),
      hotel: `${costs.hotelType} à ${city}`,
      is_departure_day: isDepartureDay,
      hide_dinner: isDepartureDay,
      restaurant: isDepartureDay
        ? ''
        : budgetKey === "luxe"
          ? `Restaurant premium recommandé à ${city}`
          : `Restaurant local adapté au budget à ${city}`,
      activities: cleanDepartureDayActivities(
        buildActivities({
          city,
          dayIndex: index,
          daysCount,
          budget,
          style,
          interests,
          isTransportDay,
          walkingLevel,
          arrivalTime,
          departureTime,
          avoidItems,
        }),
        departureTime,
        isDepartureDay
      ),
      transport_to_next: buildTransport({
        city,
        nextCity,
        budget,
        avoidItems,
      }),
    };
  });

  const total = costs.dayPerPerson * daysCount * Number(travelers || 1);

  return {
    summary: `Capi a préparé un itinéraire de ${daysCount} jour(s) à ${destination}, avec une route logique, des journées complètes, un budget ${budgetKey} et un niveau de ${getWalkingProfile(walkingLevel).label}.${routeSummary}${avoidSummary.length ? ` Contraintes prises en compte : ${avoidSummary.join(', ')}.` : ''} L’hébergement est recommandé mais non inclus dans l’estimation.`,
    estimated_total_cost: `${total}€ estimés`,
    currency: destinationConfig?.currency || "EUR",
    currency_symbol: destinationConfig?.currencySymbol || "€",
    tips: [
      "Les prix sont estimatifs : vérifiez les tarifs avant réservation.",
      "L’hébergement n’est pas inclus dans le budget sauf mention contraire.",
      "Réservez les transports inter-villes à l’avance si le voyage comporte plusieurs étapes.",
      "Gardez une marge de temps entre deux activités pour éviter un planning trop serré.",
      getWalkingProfile(walkingLevel).level === 'faible'
        ? "Le niveau de marche faible conserve des activités, mais suppose d’utiliser taxi, métro, bus ou trajets courts pour éviter les longues distances à pied."
        : getWalkingProfile(walkingLevel).level === 'eleve'
          ? "Le niveau de marche élevé ajoute davantage de points de vue, balades ou étapes actives quand le style du voyage le permet."
          : "Le niveau de marche moyen garde un équilibre entre déplacements à pied et transports.",
      avoidSummary.length
        ? `Contraintes fortes intégrées : ${avoidSummary.join(', ')}.`
        : null,
      "Adaptez les activités extérieures selon la météo réelle du jour.",
    ].filter(Boolean),
    must_book: [
      "Les transports inter-villes si le voyage comporte plusieurs étapes",
      "Les activités très demandées ou avec créneau horaire",
      "Un restaurant du soir pour les journées les plus chargées",
    ],
    weather_alternative: getWeatherAlternativesForCities(cities, constraints),
    itinerary,
  };
};

export const parsePrompt = (prompt) => {
  const destination =
    prompt.match(/voyage à ([^\.\n]+)/i)?.[1]?.trim() || "Paris";

  const daysCount = Number(
    prompt.match(/Durée\s*:\s*(\d+)\s*jours/i)?.[1] || 3
  );

  const budget =
    prompt.match(/Budget\s*:\s*([^\n]+)/i)?.[1]?.split(" ")[0]?.trim() ||
    "modéré";

  const travelers = Number(
    prompt.match(/Voyageurs\s*:\s*(\d+)/i)?.[1] || 2
  );

  const arrivalCity =
  prompt.match(/Ville d’arrivée\s*:\s*([^\n]+)/i)?.[1]?.trim();

  const returnCity =
  prompt.match(/Ville de retour\s*:\s*([^\n]+)/i)?.[1]?.trim();

  const walkingLevel =
  prompt.match(/Niveau de marche accepté\s*:\s*([^\n]+)/i)?.[1]?.trim();

  const arrivalTime =
  prompt.match(/Heure d[’']arrivée\s*:\s*([^\n]+)/i)?.[1]?.trim() ||
  prompt.match(/Heure d’arrivée\s*:\s*([^\n]+)/i)?.[1]?.trim();

  const departureTime =
  prompt.match(/Heure de départ\s*:\s*([^\n]+)/i)?.[1]?.trim() ||
  prompt.match(/Heure de retour\s*:\s*([^\n]+)/i)?.[1]?.trim();

  const avoidItems =
  prompt.match(/Éléments à éviter\s*:\s*([^\n]+)/i)?.[1]?.trim();

  return {
    destination,
    daysCount: Math.max(1, daysCount),
    budget,
    travelers,
    style: parseStyle(prompt),
    interests: parseInterests(prompt),
    arrivalCity,
    returnCity,
    walkingLevel,
    arrivalTime,
    departureTime,
    avoidItems,
  };
};

export const generateLocalTripFromPrompt = (prompt) => {
  const params = parsePrompt(prompt);
  return generateLocalTrip(params);
};
