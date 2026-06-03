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

const buildSummary = ({ score, blockers, warnings }) => {
  if (blockers.length > 0) {
    return `Voyage à corriger avant affichage public : ${blockers.length} blocage(s) et ${warnings.length} avertissement(s).`;
  }

  if (score >= 85) {
    return `Voyage solide : score ${score}/100, sans blocage détecté.`;
  }

  if (score >= 70) {
    return `Voyage exploitable mais perfectible : score ${score}/100, ${warnings.length} avertissement(s).`;
  }

  return `Voyage fragile : score ${score}/100, ${warnings.length} avertissement(s). Une relance IA ou réparation est recommandée.`;
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
        addIssue(warnings, {
          id: 'weak_last_day',
          severity: 'medium',
          message: 'Le dernier jour semble trop léger alors que le départ n’est pas clairement tôt.',
          path: `itinerary[${itinerary.length - 1}].activities`,
        });
        addRepair(repairs, {
          id: 'repair_weak_last_day',
          priority: 'medium',
          message: 'Ajouter 1 à 3 activités légères avant le départ.',
          target: `itinerary[${itinerary.length - 1}]`,
        });
      }
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
    const cityCounts = itinerary.reduce((acc, day) => {
      const city = normalizeText(day.city);
      if (!city) return acc;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    const cityEntries = Object.entries(cityCounts);
    const maxCity = cityEntries.sort((a, b) => b[1] - a[1])[0];
    const dominanceLimit = itinerary.length >= 10 ? Math.ceil(itinerary.length * 0.45) : Math.ceil(itinerary.length * 0.65);

    if (maxCity && maxCity[1] > dominanceLimit) {
      addIssue(warnings, {
        id: 'city_over_dominance',
        severity: 'medium',
        message: `La ville "${maxCity[0]}" occupe ${maxCity[1]} jour(s), ce qui peut déséquilibrer le voyage.`,
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

  return {
    score,
    status,
    blockers,
    warnings,
    repairs,
    summary: buildSummary({ score, blockers, warnings }),
    checked_at: new Date().toISOString(),
    version: 'trip-quality-engine-v1.0.0',
  };
};

export default analyzeTripQuality;
