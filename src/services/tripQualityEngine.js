const clamp = (value, min = 0, max = 100) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
};

const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const compactText = (...values) => normalizeText(values.filter(Boolean).join(' '));

const toArray = (value) => (Array.isArray(value) ? value : []);

const getTripText = (trip = {}) => {
  const days = toArray(trip.itinerary);

  return compactText(
    trip.destination,
    trip.summary,
    trip.estimated_total_cost,
    trip.currency,
    trip.currency_symbol,
    toArray(trip.tips).join(' '),
    toArray(trip.must_book).join(' '),
    toArray(trip.weather_alternative).join(' '),
    days
      .map((day) =>
        compactText(
          day.city,
          day.title,
          day.description,
          day.hotel,
          day.restaurant,
          toArray(day.activities)
            .map((activity) =>
              compactText(
                activity.time,
                activity.name,
                activity.description,
                activity.type,
                activity.estimated_cost,
                activity.duration,
                toArray(activity.tags).join(' ')
              )
            )
            .join(' ')
        )
      )
      .join(' ')
  );
};

const parseDate = (dateString) => {
  if (!dateString) return null;

  const [year, month, day] = String(dateString).split('-').map(Number);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return null;

  return date;
};

const getExpectedDaysCount = (formData = {}, trip = {}) => {
  const directDays = Number(formData.days_count || formData.daysCount || trip.days_count || trip.daysCount);

  if (Number.isFinite(directDays) && directDays > 0) {
    return directDays;
  }

  const start = parseDate(formData.start_date || trip.start_date);
  const end = parseDate(formData.end_date || trip.end_date);

  if (start && end) {
    const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (diff > 0 && diff < 120) return diff;
  }

  return null;
};

const getDayDate = (formData = {}, dayIndex) => {
  const start = parseDate(formData.start_date);

  if (!start) return null;

  const date = new Date(start);
  date.setDate(start.getDate() + dayIndex);

  return date;
};

const getHourFromTime = (time) => {
  const match = String(time || '').match(/(\d{1,2})/);
  if (!match) return null;

  const hour = Number(match[1]);
  return Number.isFinite(hour) ? hour : null;
};

const isValidCoord = (value, min, max) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
};

const hasValidLatLng = (item = {}) => {
  return isValidCoord(item.lat, -90, 90) && isValidCoord(item.lng, -180, 180);
};

const addIssue = (bucket, issue) => {
  bucket.push({
    id: issue.id,
    severity: issue.severity || 'medium',
    message: issue.message,
    path: issue.path || null,
    impact: issue.impact || null,
  });
};

const addRepair = (repairs, repair) => {
  repairs.push({
    id: repair.id,
    priority: repair.priority || 'medium',
    message: repair.message,
    target: repair.target || null,
  });
};

const scoreImpact = {
  p0: 35,
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
};

const getInterestRules = () => ({
  culture: ['musee', 'museum', 'galerie', 'monument', 'patrimoine', 'architecture', 'chateau', 'palais'],
  histoire: ['histoire', 'historique', 'antique', 'medieval', 'viking', 'catacombe', 'ruines', 'patrimoine'],
  gastronomie: ['gastronomie', 'food', 'marche', 'restaurant', 'bistrot', 'trattoria', 'street food', 'degustation', 'specialite', 'cuisine'],
  nature: ['nature', 'parc', 'jardin', 'foret', 'plage', 'cote', 'falaise', 'lac', 'mer', 'deer', 'dyrehave', 'strand'],
  plage: ['plage', 'lido', 'beach', 'strand', 'mer', 'baignade', 'cote', 'ile', 'isola'],
  romantique: ['romantique', 'coucher de soleil', 'sunset', 'balade', 'quais', 'vue', 'panorama', 'diner cosy', 'couple'],
  photo: ['photo', 'spot', 'vue', 'panorama', 'belvedere', 'rooftop', 'coucher de soleil', 'instagram'],
  shopping: ['shopping', 'boutique', 'concept store', 'marche', 'galeries', 'magasin', 'vintage', 'artisan'],
  famille: ['famille', 'enfant', 'pause', 'ludique', 'accessible', 'zoo', 'aquarium', 'parc'],
  aventure: ['aventure', 'randonnee', 'kayak', 'velo', 'excursion', 'outdoor', 'falaise', 'exploration'],
  'vie nocturne': ['vie nocturne', 'bar', 'cocktail', 'rooftop', 'jazz', 'club', 'soir', 'soiree', 'nightlife'],
  bien_etre: ['bien etre', 'spa', 'thermes', 'bain', 'sauna', 'relax', 'detente'],
  'bien-être': ['bien etre', 'spa', 'thermes', 'bain', 'sauna', 'relax', 'detente'],
});

const getInterests = (formData = {}) => {
  if (Array.isArray(formData.interests)) return formData.interests.filter(Boolean);
  if (typeof formData.interests === 'string') {
    return formData.interests
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getActivityNames = (trip = {}) => {
  return toArray(trip.itinerary).flatMap((day, dayIndex) =>
    toArray(day.activities).map((activity, activityIndex) => ({
      name: String(activity?.name || '').trim(),
      normalized: normalizeText(activity?.name || ''),
      dayIndex,
      activityIndex,
    }))
  );
};

const looksLikeDinner = (activity = {}) => {
  const text = compactText(activity.name, activity.description, activity.type);
  const hour = getHourFromTime(activity.time);

  return (
    text.includes('diner') ||
    text.includes('restaurant du soir') ||
    text.includes('souper') ||
    (text.includes('soir') && text.includes('repas')) ||
    (activity.type === 'repas' && hour !== null && hour >= 18)
  );
};

const looksLikeInternalWording = (text) => {
  const normalized = normalizeText(text);

  return (
    normalized.includes('ajout automatique') ||
    normalized.includes('variable') ||
    normalized.includes('non precisee') ||
    normalized.includes('non precise') ||
    normalized.includes('selon transport') ||
    normalized.includes('a verifier') ||
    normalized.includes('activite proposee par capi')
  );
};

const isCityTrip = (trip = {}, formData = {}) => {
  const destination = normalizeText(formData.destination || trip.destination);
  const cities = [...new Set(toArray(trip.itinerary).map((day) => normalizeText(day.city)).filter(Boolean))];

  return cities.length === 1 && destination && cities[0] && (destination === cities[0] || cities[0].includes(destination) || destination.includes(cities[0]));
};


const DESTINATION_KEYWORDS = {
  paris: ['paris', 'montmartre', 'louvre', 'seine', 'trocadero', 'marais', 'saint-germain'],
  france: ['paris', 'lyon', 'marseille', 'nice', 'bordeaux', 'strasbourg', 'lille', 'nantes', 'toulouse'],
  danemark: [
    'danemark',
    'denmark',
    'copenhague',
    'copenhagen',
    'odense',
    'aarhus',
    'aalborg',
    'skagen',
    'roskilde',
    'helsingor',
    'helsingør',
    'billund',
    'tivoli',
    'nyhavn',
  ],
  denmark: [
    'danemark',
    'denmark',
    'copenhague',
    'copenhagen',
    'odense',
    'aarhus',
    'aalborg',
    'skagen',
    'roskilde',
    'helsingor',
    'helsingør',
    'billund',
    'tivoli',
    'nyhavn',
  ],
  italie: [
    'italie',
    'italy',
    'rome',
    'roma',
    'florence',
    'firenze',
    'venise',
    'venezia',
    'venice',
    'naples',
    'napoli',
    'bologne',
    'bologna',
    'verone',
    'verona',
    'pise',
    'pisa',
    'milan',
    'milano',
    'turin',
    'torino',
    'sienne',
    'siena',
  ],
  italy: [
    'italie',
    'italy',
    'rome',
    'roma',
    'florence',
    'firenze',
    'venise',
    'venezia',
    'venice',
    'naples',
    'napoli',
    'bologne',
    'bologna',
    'verone',
    'verona',
    'pise',
    'pisa',
    'milan',
    'milano',
    'turin',
    'torino',
    'sienne',
    'siena',
  ],
  espagne: ['espagne', 'spain', 'barcelone', 'barcelona', 'madrid', 'valence', 'valencia', 'seville', 'sevilla', 'grenade', 'granada'],
  portugal: ['portugal', 'lisbonne', 'lisbon', 'porto', 'faro', 'sintra', 'coimbra'],
};

const getDestinationKeywords = (destination = '') => {
  const normalized = normalizeText(destination);

  if (!normalized) return [];

  const directKey = Object.keys(DESTINATION_KEYWORDS).find((key) => normalized.includes(key));

  if (directKey) return DESTINATION_KEYWORDS[directKey];

  return [normalized];
};

const isDestinationClearlyIncoherent = ({ trip, formData, tripText }) => {
  const requestedDestination = normalizeText(formData.destination || '');
  const generatedDestination = normalizeText(trip.destination || '');
  const cities = toArray(trip.itinerary).map((day) => normalizeText(day.city)).filter(Boolean);

  if (!requestedDestination) return false;

  // Cas direct : le voyage généré annonce explicitement une autre destination connue.
  const wrongKnownDestinations = Object.keys(DESTINATION_KEYWORDS).filter((key) => !requestedDestination.includes(key));

  if (
    generatedDestination &&
    generatedDestination !== requestedDestination &&
    wrongKnownDestinations.some((key) => generatedDestination.includes(key)) &&
    !tripText.includes(requestedDestination)
  ) {
    return true;
  }

  const keywords = getDestinationKeywords(requestedDestination);

  if (keywords.length === 0) return false;

  const expectedHit = keywords.some((keyword) => tripText.includes(normalizeText(keyword)));

  if (expectedHit) return false;

  // Si aucune ville / aucun lieu attendu n’apparaît, et que des villes sont présentes, c’est suspect.
  return cities.length > 0;
};

const isOnlyDepartureDay = (day = {}) => {
  const activities = toArray(day.activities);

  if (activities.length !== 1) return false;

  const text = compactText(activities[0]?.name, activities[0]?.description, activities[0]?.type);

  return text.includes('depart') || text.includes('aeroport') || text.includes('gare');
};

const hasActivityAfterDeparture = (day = {}, departureHour) => {
  if (departureHour === null || departureHour === undefined) return false;

  return toArray(day.activities).some((activity) => {
    const hour = getHourFromTime(activity?.time);
    if (hour === null) return false;

    // On laisse une marge si l’activité est le départ lui-même.
    const text = compactText(activity?.name, activity?.description, activity?.type);
    if (text.includes('depart') || text.includes('aeroport') || text.includes('gare')) {
      return hour > departureHour + 1;
    }

    return hour > departureHour;
  });
};

const getCityDominance = (itinerary = []) => {
  const cityCounts = itinerary.reduce((acc, day) => {
    const city = normalizeText(day.city);
    if (!city) return acc;
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
  const dominant = entries[0] || null;

  return {
    cityCounts,
    dominantCity: dominant?.[0] || null,
    dominantCount: dominant?.[1] || 0,
    cityCount: entries.length,
  };
};

const isExcessiveCityDominance = ({ trip, formData }) => {
  const itinerary = toArray(trip.itinerary);

  if (itinerary.length < 8 || isCityTrip(trip, formData)) {
    return false;
  }

  const { dominantCount, cityCount } = getCityDominance(itinerary);

  if (cityCount <= 1 && itinerary.length >= 8) return true;

  if (itinerary.length >= 10 && dominantCount >= Math.ceil(itinerary.length * 0.6)) {
    return true;
  }

  if (itinerary.length >= 12 && dominantCount >= 6) {
    return true;
  }

  return false;
};



const getBudgetLevel = (formData = {}, trip = {}) => {
  const raw = normalizeText(formData.budget || trip.budget || '');

  if (raw.includes('eco')) return 'economique';
  if (raw.includes('luxe') || raw.includes('luxury')) return 'luxe';
  if (raw.includes('confort')) return 'confort';
  if (raw.includes('modere') || raw.includes('moderate')) return 'modere';

  return 'modere';
};

const getTravelersCount = (formData = {}, trip = {}) => {
  const travelers = Number(formData.travelers || trip.travelers || 1);
  return Number.isFinite(travelers) && travelers > 0 ? travelers : 1;
};

const parseMoneyAmount = (value = '') => {
  const text = String(value || '')
    .replace(/\s/g, '')
    .replace(',', '.');

  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)/g)].map((match) => Number(match[1]));
  const amounts = matches.filter((amount) => Number.isFinite(amount) && amount > 0);

  if (amounts.length === 0) return null;

  return Math.max(...amounts);
};

const estimateMinimumTripCost = ({ destination, budget, travelers, daysCount }) => {
  const normalizedDestination = normalizeText(destination);

  const destinationMultiplier =
    normalizedDestination.includes('danemark') ||
    normalizedDestination.includes('denmark') ||
    normalizedDestination.includes('copenhague') ||
    normalizedDestination.includes('copenhagen')
      ? 1.45
      : normalizedDestination.includes('paris')
        ? 1.25
        : normalizedDestination.includes('italie') || normalizedDestination.includes('italy')
          ? 1.15
          : 1;

  const dailyBaseByBudget = {
    economique: 75,
    modere: 115,
    confort: 160,
    luxe: 260,
  };

  const base = dailyBaseByBudget[budget] || dailyBaseByBudget.modere;

  return Math.round(base * destinationMultiplier * travelers * Math.max(daysCount || 1, 1));
};

const hasClearlyLowBudget = ({ trip, formData, expectedDays }) => {
  const amount = parseMoneyAmount(trip.estimated_total_cost);
  if (!amount) return false;

  const travelers = getTravelersCount(formData, trip);
  const budget = getBudgetLevel(formData, trip);
  const minimum = estimateMinimumTripCost({
    destination: formData.destination || trip.destination,
    budget,
    travelers,
    daysCount: expectedDays || toArray(trip.itinerary).length || 1,
  });

  return amount < minimum * 0.65;
};

const isGenericActivity = (activity = {}) => {
  const text = compactText(activity.name, activity.description);

  const genericPatterns = [
    'soiree libre',
    'temps libre',
    'dejeuner libre',
    'diner libre',
    'restaurant local',
    'bistrot local',
    'cafe local',
    'pause gourmande',
    'selon vos envies',
    'quartier anime',
    'balade libre',
    'activite libre',
    'a proximite',
    'zone centrale',
    'a verifier',
    'selon transport',
    'variable',
  ];

  return genericPatterns.some((pattern) => text.includes(pattern));
};

const countGenericActivities = (trip = {}) => {
  return toArray(trip.itinerary).reduce((total, day) => {
    return total + toArray(day.activities).filter(isGenericActivity).length;
  }, 0);
};

const isMajorCityChangeTransportMissing = (day = {}, nextDay = null) => {
  if (!nextDay) return false;

  const currentCity = normalizeText(day.city);
  const nextCity = normalizeText(nextDay.city);

  if (!currentCity || !nextCity || currentCity === nextCity) return false;

  return !day.transport_to_next || !toArray(day.transport_to_next.options).length;
};

const getMissingTransports = (itinerary = []) => {
  const missing = [];

  itinerary.forEach((day, index) => {
    const nextDay = itinerary[index + 1];

    if (isMajorCityChangeTransportMissing(day, nextDay)) {
      missing.push({
        dayIndex: index,
        from: day.city,
        to: nextDay.city,
      });
    }
  });

  return missing;
};

const getDayActivitySpan = (day = {}) => {
  const hours = toArray(day.activities)
    .map((activity) => getHourFromTime(activity.time))
    .filter((hour) => hour !== null)
    .sort((a, b) => a - b);

  if (hours.length < 2) {
    return {
      firstHour: hours[0] ?? null,
      lastHour: hours[0] ?? null,
      span: 0,
    };
  }

  return {
    firstHour: hours[0],
    lastHour: hours[hours.length - 1],
    span: hours[hours.length - 1] - hours[0],
  };
};

const getApproxDistanceKm = (a = {}, b = {}) => {
  if (!hasValidLatLng(a) || !hasValidLatLng(b)) return null;

  const toRad = (value) => (Number(value) * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(Number(b.lat) - Number(a.lat));
  const dLng = toRad(Number(b.lng) - Number(a.lng));
  const lat1 = toRad(Number(a.lat));
  const lat2 = toRad(Number(b.lat));

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
};

const getDayJumpDistances = (day = {}) => {
  const activities = toArray(day.activities).filter(hasValidLatLng);
  const distances = [];

  for (let index = 0; index < activities.length - 1; index += 1) {
    const distance = getApproxDistanceKm(activities[index], activities[index + 1]);

    if (distance !== null) {
      distances.push(distance);
    }
  }

  return distances;
};

const isDayPotentiallyTooDispersed = ({ day, walkingLevel }) => {
  const activities = toArray(day.activities);
  if (activities.length < 4) return false;

  const normalizedWalking = normalizeText(walkingLevel || '');
  const jumpDistances = getDayJumpDistances(day);
  const longJumps = jumpDistances.filter((distance) => distance >= 3.5).length;
  const veryLongJumps = jumpDistances.filter((distance) => distance >= 7).length;
  const { span } = getDayActivitySpan(day);

  if (veryLongJumps >= 1 && span >= 8) return true;
  if (longJumps >= 2) return true;
  if ((normalizedWalking.includes('faible') || normalizedWalking.includes('moderee') || normalizedWalking.includes('moyen')) && span >= 12) return true;

  return false;
};

const hasWeakInterestCoverage = ({ tripText, interest }) => {
  const normalizedInterest = normalizeText(interest);
  const rules =
    getInterestRules()[normalizedInterest] ||
    getInterestRules()[interest] ||
    getInterestRules()[normalizedInterest.replace(/\s+/g, '_')];

  if (!rules || rules.length === 0) return false;

  const hits = rules.filter((keyword) => tripText.includes(normalizeText(keyword))).length;

  return hits === 1;
};

const getP1WarningCount = (warnings = []) => {
  const p1WarningIds = new Set([
    'budget_probably_too_low',
    'many_generic_activities',
    'repeated_activities',
    'interest_weakly_covered',
    'missing_transport_between_cities',
    'day_too_dispersed',
  ]);

  return warnings.filter((warning) => p1WarningIds.has(warning.id) || warning.severity === 'medium').length;
};


const buildSummary = ({ score, blockers, warnings }) => {
  const p1Count = getP1WarningCount(warnings);

  if (blockers.length > 0) {
    return `Voyage bloqué : ${blockers.length} blocker(s) P0/P1 et ${warnings.length} avertissement(s).`;
  }

  if (score >= 85 && p1Count === 0) {
    return `Voyage solide : score ${score}/100, sans blocage détecté.`;
  }

  if (score >= 70) {
    return `Voyage exploitable mais perfectible : score ${score}/100, ${warnings.length} avertissement(s), dont ${p1Count} warning(s) P1.`;
  }

  return `Voyage fragile : score ${score}/100, ${warnings.length} avertissement(s), dont ${p1Count} warning(s) P1. Une relance IA ou réparation est recommandée.`;
};

export const analyzeTripQuality = (trip = {}, formData = {}) => {
  const blockers = [];
  const warnings = [];
  const repairs = [];

  const itinerary = toArray(trip.itinerary);
  const expectedDays = getExpectedDaysCount(formData, trip);
  const tripText = getTripText(trip);
  const destination = String(formData.destination || trip.destination || 'voyage');
  const returnCity = normalizeText(formData.return_city || formData.returnCity || trip.return_city || trip.returnCity);
  const departureHour = getHourFromTime(formData.departure_time || formData.departureTime || trip.departure_time || trip.departureTime);

  if (isDestinationClearlyIncoherent({ trip, formData, tripText })) {
    addIssue(blockers, {
      id: 'destination_incoherent',
      severity: 'p0',
      message: `La destination générée semble incohérente avec la destination demandée (${destination}).`,
      path: 'destination',
    });
    addRepair(repairs, {
      id: 'repair_destination_incoherent',
      priority: 'critical',
      message: 'Ne pas afficher ce voyage : relancer la génération avec la destination du formulaire ou utiliser le fallback formData.',
      target: 'destination',
    });
  }

  if (itinerary.length === 0) {
    addIssue(blockers, {
      id: 'itinerary_missing',
      severity: 'critical',
      message: 'L’itinéraire est absent ou vide.',
      path: 'itinerary',
    });
    addRepair(repairs, {
      id: 'repair_missing_itinerary',
      priority: 'critical',
      message: 'Relancer la génération IA ou utiliser le fallback local.',
      target: 'itinerary',
    });
  }

  if (expectedDays && itinerary.length > 0 && itinerary.length !== expectedDays) {
    addIssue(blockers, {
      id: 'day_count_mismatch',
      severity: 'critical',
      message: `Le voyage contient ${itinerary.length} jour(s), mais ${expectedDays} étaient attendus.`,
      path: 'itinerary',
    });
    addRepair(repairs, {
      id: 'repair_day_count',
      priority: 'critical',
      message: 'Réparer le nombre de jours ou relancer la génération en imposant la durée exacte.',
      target: 'itinerary',
    });
  }

  itinerary.forEach((day, dayIndex) => {
    if (!day || typeof day !== 'object') {
      addIssue(blockers, {
        id: 'invalid_day',
        severity: 'critical',
        message: `Le jour ${dayIndex + 1} est invalide.`,
        path: `itinerary[${dayIndex}]`,
      });
      return;
    }

    if (!day.city) {
      addIssue(warnings, {
        id: 'missing_city',
        severity: 'medium',
        message: `Le jour ${dayIndex + 1} n’a pas de ville principale.`,
        path: `itinerary[${dayIndex}].city`,
      });
    }

    if (!hasValidLatLng(day)) {
      addIssue(warnings, {
        id: 'invalid_day_coordinates',
        severity: 'medium',
        message: `Le jour ${dayIndex + 1} n’a pas de coordonnées GPS valides.`,
        path: `itinerary[${dayIndex}].lat/lng`,
      });
      addRepair(repairs, {
        id: 'repair_day_coordinates',
        priority: 'medium',
        message: `Compléter les coordonnées GPS du jour ${dayIndex + 1}.`,
        target: `itinerary[${dayIndex}]`,
      });
    }

    const activities = toArray(day.activities);

    if (activities.length === 0) {
      addIssue(blockers, {
        id: 'empty_day',
        severity: 'high',
        message: `Le jour ${dayIndex + 1} ne contient aucune activité.`,
        path: `itinerary[${dayIndex}].activities`,
      });
      addRepair(repairs, {
        id: 'repair_empty_day',
        priority: 'high',
        message: `Ajouter au moins une activité réaliste au jour ${dayIndex + 1}.`,
        target: `itinerary[${dayIndex}].activities`,
      });
    }

    activities.forEach((activity, activityIndex) => {
      if (!activity?.name) {
        addIssue(warnings, {
          id: 'missing_activity_name',
          severity: 'medium',
          message: `Une activité du jour ${dayIndex + 1} n’a pas de nom.`,
          path: `itinerary[${dayIndex}].activities[${activityIndex}].name`,
        });
      }

      if (!hasValidLatLng(activity)) {
        addIssue(warnings, {
          id: 'invalid_activity_coordinates',
          severity: 'low',
          message: `L’activité "${activity?.name || activityIndex + 1}" du jour ${dayIndex + 1} n’a pas de coordonnées valides.`,
          path: `itinerary[${dayIndex}].activities[${activityIndex}].lat/lng`,
        });
      }

      const hour = getHourFromTime(activity?.time);
      const activityText = compactText(activity?.name, activity?.description, activity?.type);

      if (activityText.includes('diner') && hour !== null && hour < 18) {
        addIssue(blockers, {
          id: 'dinner_at_lunch_time',
          severity: 'high',
          message: `Le jour ${dayIndex + 1}, un dîner semble placé avant 18h.`,
          path: `itinerary[${dayIndex}].activities[${activityIndex}]`,
        });
        addRepair(repairs, {
          id: 'repair_dinner_time',
          priority: 'high',
          message: 'Déplacer ce dîner le soir ou le reformuler en déjeuner.',
          target: `itinerary[${dayIndex}].activities[${activityIndex}]`,
        });
      }

      if (looksLikeInternalWording(activityText)) {
        addIssue(warnings, {
          id: 'internal_or_generic_wording',
          severity: 'low',
          message: `Formulation interne ou trop générique détectée : "${activity?.name || 'activité'}".`,
          path: `itinerary[${dayIndex}].activities[${activityIndex}]`,
        });
        addRepair(repairs, {
          id: 'repair_generic_wording',
          priority: 'low',
          message: 'Remplacer la formulation technique par une phrase utile côté utilisateur.',
          target: `itinerary[${dayIndex}].activities[${activityIndex}]`,
        });
      }
    });
  });


  if (hasClearlyLowBudget({ trip, formData, expectedDays })) {
    addIssue(warnings, {
      id: 'budget_probably_too_low',
      severity: 'medium',
      message: 'Le budget total semble probablement trop bas pour la destination, la durée, le nombre de voyageurs ou le niveau de budget choisi.',
      path: 'estimated_total_cost',
    });
    addRepair(repairs, {
      id: 'repair_low_budget',
      priority: 'medium',
      message: 'Recalculer le budget côté app avec hébergement, repas, activités, transports locaux, inter-villes et marge de sécurité.',
      target: 'budget',
    });
  }

  const genericActivityCount = countGenericActivities(trip);

  if (genericActivityCount >= 3) {
    addIssue(warnings, {
      id: 'many_generic_activities',
      severity: 'medium',
      message: `${genericActivityCount} activité(s) semblent trop génériques ou peu exploitables.`,
      path: 'itinerary.activities',
    });
    addRepair(repairs, {
      id: 'repair_many_generic_activities',
      priority: 'medium',
      message: 'Remplacer les formulations vagues par des lieux, quartiers, durées ou conseils concrets.',
      target: 'itinerary.activities',
    });
  }

  const missingTransports = getMissingTransports(itinerary);

  if (missingTransports.length > 0) {
    const examples = missingTransports
      .slice(0, 3)
      .map((item) => `jour ${item.dayIndex + 1} : ${item.from} → ${item.to}`)
      .join(', ');

    addIssue(warnings, {
      id: 'missing_transport_between_cities',
      severity: 'medium',
      message: `Transport inter-ville manquant alors que la ville change (${examples}).`,
      path: 'itinerary.transport_to_next',
    });
    addRepair(repairs, {
      id: 'repair_missing_intercity_transport',
      priority: 'medium',
      message: 'Ajouter transport_to_next avec mode, durée et coût estimé sur chaque changement de ville.',
      target: 'itinerary.transport_to_next',
    });
  }

  itinerary.forEach((day, dayIndex) => {
    if (
      isDayPotentiallyTooDispersed({
        day,
        walkingLevel: formData.walking_level || formData.walkingLevel || trip.walking_level || trip.walkingLevel,
      })
    ) {
      addIssue(warnings, {
        id: 'day_too_dispersed',
        severity: 'medium',
        message: `Le jour ${dayIndex + 1} semble trop dispersé ou trop long pour le niveau de marche demandé.`,
        path: `itinerary[${dayIndex}]`,
      });
      addRepair(repairs, {
        id: 'repair_dispersed_day',
        priority: 'medium',
        message: `Regrouper les activités du jour ${dayIndex + 1} par quartier ou ajouter des transports conseillés.`,
        target: `itinerary[${dayIndex}]`,
      });
    }
  });

  if (itinerary.length > 0) {
    const lastDay = itinerary[itinerary.length - 1];
    const lastActivities = toArray(lastDay.activities);

    if (lastActivities.length === 0) {
      addIssue(blockers, {
        id: 'last_day_empty',
        severity: 'high',
        message: 'Le dernier jour est vide.',
        path: `itinerary[${itinerary.length - 1}].activities`,
      });
      addRepair(repairs, {
        id: 'repair_last_day_empty',
        priority: 'high',
        message: 'Ajouter une demi-journée légère ou un départ explicite selon l’heure de départ.',
        target: `itinerary[${itinerary.length - 1}]`,
      });
    }

    if (lastActivities.length === 1) {
      const onlyActivityText = compactText(lastActivities[0]?.name, lastActivities[0]?.description, lastActivities[0]?.type);
      const isOnlyDeparture = onlyActivityText.includes('depart') || onlyActivityText.includes('gare') || onlyActivityText.includes('aeroport');

      if (isOnlyDeparture && (departureHour === null || departureHour >= 12)) {
        addIssue(blockers, {
          id: 'last_day_only_departure_without_early_departure',
          severity: 'high',
          message: 'Le dernier jour contient seulement un départ alors que le départ n’est pas clairement tôt.',
          path: `itinerary[${itinerary.length - 1}].activities`,
        });
        addRepair(repairs, {
          id: 'repair_weak_last_day',
          priority: 'high',
          message: 'Ajouter 1 à 3 activités légères avant le départ.',
          target: `itinerary[${itinerary.length - 1}]`,
        });
      }
    }

    if (hasActivityAfterDeparture(lastDay, departureHour)) {
      addIssue(blockers, {
        id: 'activity_after_departure',
        severity: 'p0',
        message: 'Le dernier jour contient une activité après l’heure de départ.',
        path: `itinerary[${itinerary.length - 1}].activities`,
      });
      addRepair(repairs, {
        id: 'repair_activity_after_departure',
        priority: 'critical',
        message: 'Supprimer ou déplacer les activités après l’heure de départ.',
        target: `itinerary[${itinerary.length - 1}]`,
      });
    }

    if (lastActivities.some(looksLikeDinner)) {
      addIssue(blockers, {
        id: 'dinner_on_departure_day',
        severity: 'high',
        message: 'Un dîner complet apparaît sur le dernier jour.',
        path: `itinerary[${itinerary.length - 1}].activities`,
      });
      addRepair(repairs, {
        id: 'repair_departure_dinner',
        priority: 'high',
        message: 'Supprimer le dîner complet du dernier jour ou le remplacer par un déjeuner si le départ est tardif.',
        target: `itinerary[${itinerary.length - 1}]`,
      });
    }

    if (returnCity) {
      const lastCity = normalizeText(lastDay.city);

      if (lastCity && !lastCity.includes(returnCity) && !returnCity.includes(lastCity)) {
        addIssue(blockers, {
          id: 'return_city_not_respected',
          severity: 'high',
          message: `Le dernier jour n’est pas centré sur la ville de retour demandée (${formData.return_city || formData.returnCity}).`,
          path: `itinerary[${itinerary.length - 1}].city`,
        });
        addRepair(repairs, {
          id: 'repair_return_city',
          priority: 'high',
          message: 'Replacer le dernier jour dans la ville de retour ou ajouter un retour la veille.',
          target: `itinerary[${itinerary.length - 1}]`,
        });
      }

      if (departureHour !== null && departureHour < 12 && itinerary.length >= 2) {
        const previousNightCity = normalizeText(itinerary[itinerary.length - 2]?.city);

        if (previousNightCity && !previousNightCity.includes(returnCity) && !returnCity.includes(previousNightCity)) {
          addIssue(blockers, {
            id: 'last_night_far_from_return_city',
            severity: 'critical',
            message: `Départ matinal depuis ${formData.return_city || formData.returnCity}, mais la dernière nuit semble prévue ailleurs.`,
            path: `itinerary[${itinerary.length - 2}].city`,
          });
          addRepair(repairs, {
            id: 'repair_last_night_return_city',
            priority: 'critical',
            message: 'Forcer la dernière nuit dans la ville de retour.',
            target: `itinerary[${itinerary.length - 2}]`,
          });
        }
      }
    }
  }

  const names = getActivityNames(trip).filter((item) => item.normalized);
  const nameCounts = names.reduce((acc, item) => {
    acc[item.normalized] = (acc[item.normalized] || 0) + 1;
    return acc;
  }, {});

  const repeatedNames = Object.entries(nameCounts).filter(([, count]) => count > 1);

  if (repeatedNames.length > 0) {
    const repeatedLabel = repeatedNames.slice(0, 5).map(([name, count]) => `${name} x${count}`).join(', ');

    addIssue(repeatedNames.length >= 3 ? blockers : warnings, {
      id: 'repeated_activities',
      severity: repeatedNames.length >= 3 ? 'high' : 'medium',
      message: `Activités répétées détectées : ${repeatedLabel}.`,
      path: 'itinerary.activities',
    });
    addRepair(repairs, {
      id: 'repair_repeated_activities',
      priority: repeatedNames.length >= 3 ? 'high' : 'medium',
      message: 'Remplacer les répétitions par des lieux alternatifs ou des expériences différentes.',
      target: 'itinerary.activities',
    });
  }

  if (itinerary.length >= 7 && !isCityTrip(trip, formData)) {
    const { dominantCity, dominantCount } = getCityDominance(itinerary);
    const dominanceLimit = itinerary.length >= 10 ? Math.ceil(itinerary.length * 0.45) : Math.ceil(itinerary.length * 0.65);

    if (isExcessiveCityDominance({ trip, formData })) {
      addIssue(blockers, {
        id: 'city_over_dominance_p0',
        severity: 'high',
        message: `La ville "${dominantCity}" occupe ${dominantCount} jour(s), ce qui déséquilibre fortement le voyage.`,
        path: 'itinerary.city',
      });
      addRepair(repairs, {
        id: 'repair_city_balance_p0',
        priority: 'high',
        message: 'Relancer la génération en imposant plusieurs bases ou étapes cohérentes.',
        target: 'itinerary',
      });
    } else if (dominantCity && dominantCount > dominanceLimit) {
      addIssue(warnings, {
        id: 'city_over_dominance',
        severity: 'medium',
        message: `La ville "${dominantCity}" occupe ${dominantCount} jour(s), ce qui peut déséquilibrer le voyage.`,
        path: 'itinerary.city',
      });
      addRepair(repairs, {
        id: 'repair_city_balance',
        priority: 'medium',
        message: 'Rééquilibrer la route avec une base ou étape supplémentaire.',
        target: 'itinerary',
      });
    }
  }

  const avoidItems = normalizeText(formData.avoid_items || formData.avoidItems || '');

  if (avoidItems.includes('voiture') || avoidItems.includes('car')) {
    const forbiddenCarWords = ['location de voiture', 'voiture de location', 'prendre une voiture', 'en voiture', 'car rental'];
    const hasCar = forbiddenCarWords.some((word) => tripText.includes(word));

    if (hasCar) {
      addIssue(blockers, {
        id: 'avoid_car_not_respected',
        severity: 'critical',
        message: 'La contrainte “voiture à éviter” n’est pas respectée.',
        path: 'itinerary',
      });
      addRepair(repairs, {
        id: 'repair_avoid_car',
        priority: 'critical',
        message: 'Remplacer les trajets voiture par train, bus, ferry, métro, tram ou taxi.',
        target: 'transport',
      });
    }
  }

  if (trip.currency && trip.currency_symbol) {
    const currency = normalizeText(trip.currency);
    const symbol = String(trip.currency_symbol || '').trim();

    if (currency === 'dkk' && symbol === '€') {
      addIssue(warnings, {
        id: 'currency_symbol_mismatch',
        severity: 'medium',
        message: 'La devise et le symbole semblent incohérents.',
        path: 'currency/currency_symbol',
      });
      addRepair(repairs, {
        id: 'repair_currency_display',
        priority: 'medium',
        message: 'Utiliser une seule devise principale ou afficher clairement la conversion.',
        target: 'budget',
      });
    }
  }

  if (trip.estimated_total_cost && typeof trip.estimated_total_cost === 'string') {
    const costText = normalizeText(trip.estimated_total_cost);

    if (costText.includes('dkk') && trip.estimated_total_cost.includes('€')) {
      addIssue(warnings, {
        id: 'mixed_budget_display',
        severity: 'medium',
        message: 'Le budget mélange probablement euros et devise locale.',
        path: 'estimated_total_cost',
      });
      addRepair(repairs, {
        id: 'repair_mixed_budget',
        priority: 'medium',
        message: 'Recalculer le budget côté app en catégories claires.',
        target: 'budget',
      });
    }
  }

  const interests = getInterests(formData);
  const interestRules = getInterestRules();

  interests.forEach((interest) => {
    const normalizedInterest = normalizeText(interest);
    const rules =
      interestRules[normalizedInterest] ||
      interestRules[interest] ||
      interestRules[normalizedInterest.replace(/\s+/g, '_')];

    if (!rules || rules.length === 0) return;

    const covered = rules.some((keyword) => tripText.includes(normalizeText(keyword)));

    if (!covered) {
      addIssue(warnings, {
        id: `interest_not_visible_${normalizedInterest.replace(/\s+/g, '_')}`,
        severity: 'medium',
        message: `L’intérêt "${interest}" n’est pas assez visible dans l’itinéraire.`,
        path: 'itinerary',
      });
      addRepair(repairs, {
        id: `repair_interest_${normalizedInterest.replace(/\s+/g, '_')}`,
        priority: 'medium',
        message: `Ajouter au moins une activité concrète liée à "${interest}".`,
        target: 'itinerary.activities',
      });
      return;
    }

    if (hasWeakInterestCoverage({ tripText, interest })) {
      addIssue(warnings, {
        id: 'interest_weakly_covered',
        severity: 'medium',
        message: `L’intérêt "${interest}" est présent mais semble peu couvert.`,
        path: 'itinerary',
      });
      addRepair(repairs, {
        id: `repair_weak_interest_${normalizedInterest.replace(/\s+/g, '_')}`,
        priority: 'medium',
        message: `Renforcer l’intérêt "${interest}" avec une activité plus visible ou mieux décrite.`,
        target: 'itinerary.activities',
      });
    }
  });

  // Quelques règles critiques de destination connues, volontairement limitées pour le Lot 7.1.
  const destinationText = normalizeText(formData.destination || trip.destination);

  if (destinationText.includes('paris')) {
    itinerary.forEach((day, dayIndex) => {
      const dayDate = getDayDate(formData, dayIndex);
      const isTuesday = dayDate?.getDay() === 2;
      const dayText = compactText(
        day.title,
        day.description,
        toArray(day.activities).map((activity) => compactText(activity.name, activity.description)).join(' ')
      );

      if (isTuesday && dayText.includes('louvre')) {
        addIssue(blockers, {
          id: 'louvre_on_tuesday',
          severity: 'critical',
          message: 'Le Louvre est placé un mardi, jour de fermeture habituel.',
          path: `itinerary[${dayIndex}]`,
        });
        addRepair(repairs, {
          id: 'repair_louvre_on_tuesday',
          priority: 'critical',
          message: 'Déplacer le Louvre sur un autre jour et remplacer le mardi par Montmartre, Marais ou Tour Eiffel.',
          target: `itinerary[${dayIndex}]`,
        });
      }

      if (dayText.includes('marche saint-pierre') && (dayText.includes('dejeuner') || dayText.includes('repas') || dayText.includes('food'))) {
        addIssue(warnings, {
          id: 'marche_saint_pierre_food_confusion',
          severity: 'medium',
          message: 'Le Marché Saint-Pierre semble utilisé comme marché alimentaire alors qu’il est surtout lié au textile.',
          path: `itinerary[${dayIndex}]`,
        });
        addRepair(repairs, {
          id: 'repair_marche_saint_pierre',
          priority: 'medium',
          message: 'Utiliser le Marché Saint-Pierre comme spot shopping/textile, pas comme déjeuner.',
          target: `itinerary[${dayIndex}]`,
        });
      }
    });
  }

  const allIssues = [...blockers, ...warnings];
  const penalty = allIssues.reduce((total, issue) => total + (scoreImpact[issue.severity] || scoreImpact.medium), 0);
  const score = clamp(Math.round(100 - penalty), 0, 100);

  const status =
    blockers.length > 0
      ? 'blocked'
      : score >= 85
        ? 'strong'
        : score >= 70
          ? 'usable'
          : 'fragile';

  const p1_warnings = warnings.filter(
    (warning) => warning.severity === 'medium' ||
      [
        'budget_probably_too_low',
        'many_generic_activities',
        'repeated_activities',
        'interest_weakly_covered',
        'missing_transport_between_cities',
        'day_too_dispersed',
      ].includes(warning.id)
  );

  return {
    score,
    status,
    blockers,
    warnings,
    p1_warnings,
    p1_warning_count: p1_warnings.length,
    repairs,
    summary: buildSummary({ score, blockers, warnings }),
    checked_at: new Date().toISOString(),
    version: 'trip-quality-engine-v1.1.0',
  };
};

export default analyzeTripQuality;
