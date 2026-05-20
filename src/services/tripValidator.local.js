const DEFAULT_COORDS = {
  lat: 48.8566,
  lng: 2.3522,
};

const DAY_MS = 1000 * 60 * 60 * 24;

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const hasValidCoords = (value) => {
  return (
    value &&
    Number.isFinite(Number(value.lat)) &&
    Number.isFinite(Number(value.lng))
  );
};

const normalizeText = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const parseLocalDate = (dateString) => {
  if (!dateString) return null;

  const [year, month, day] = String(dateString).split('-').map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};

const getExpectedDaysCount = (trip) => {
  const start = parseLocalDate(trip.start_date);
  const end = parseLocalDate(trip.end_date);

  if (start && end) {
    const diff = Math.floor((end - start) / DAY_MS) + 1;
    if (diff > 0 && diff < 90) return diff;
  }

  if (Array.isArray(trip.itinerary) && trip.itinerary.length > 0) {
    return trip.itinerary.length;
  }

  return 1;
};

const getFallbackCoords = (trip, day) => {
  if (hasValidCoords(day)) {
    return {
      lat: Number(day.lat),
      lng: Number(day.lng),
    };
  }

  const firstActivityWithCoords = (day.activities || []).find(hasValidCoords);

  if (firstActivityWithCoords) {
    return {
      lat: Number(firstActivityWithCoords.lat),
      lng: Number(firstActivityWithCoords.lng),
    };
  }

  const firstTripDayWithCoords = (trip.itinerary || []).find(hasValidCoords);

  if (firstTripDayWithCoords) {
    return {
      lat: Number(firstTripDayWithCoords.lat),
      lng: Number(firstTripDayWithCoords.lng),
    };
  }

  return DEFAULT_COORDS;
};

const isDepartureDay = (day, index, itineraryLength) => {
  if (day?.is_departure_day) return true;

  const title = normalizeText(day?.title || '');
  const description = normalizeText(day?.description || '');

  return (
    index === itineraryLength - 1 &&
    (title.includes('dernier') ||
      title.includes('depart') ||
      description.includes('depart'))
  );
};

const isDinnerActivity = (activity) => {
  const text = normalizeText(
    `${activity?.time || ''} ${activity?.name || ''} ${activity?.type || ''}`
  );

  const hour = Number(String(activity?.time || '').split(':')[0]);

  return (
    text.includes('diner') ||
    text.includes('soir') ||
    text.includes('restaurant') ||
    (activity?.type === 'repas' && Number.isFinite(hour) && hour >= 18)
  );
};

const isDepartureActivity = (activity) => {
  const text = normalizeText(`${activity?.name || ''} ${activity?.type || ''}`);
  return text.includes('depart');
};

const getActivityHour = (activity) => {
  const hour = Number(String(activity?.time || '').split(':')[0]);
  return Number.isFinite(hour) ? hour : null;
};

const sortActivitiesByTime = (activities) => {
  return [...activities].sort((a, b) => {
    const hourA = getActivityHour(a);
    const hourB = getActivityHour(b);

    if (hourA === null && hourB === null) return 0;
    if (hourA === null) return 1;
    if (hourB === null) return -1;

    return String(a.time || '').localeCompare(String(b.time || ''));
  });
};

const createFallbackActivity = ({
  time,
  name,
  description,
  type = 'visite',
  estimatedCost = '0€',
  coords,
  offset = 0,
}) => ({
  time,
  name,
  description,
  type,
  estimated_cost: estimatedCost,
  lat: Number(coords.lat) + offset,
  lng: Number(coords.lng) + offset,
});

const createFallbackDay = (trip, dayNumber, previousDay) => {
  const city =
    previousDay?.city ||
    trip.destination ||
    trip.arrival_city ||
    'Destination';

  const coords = getFallbackCoords(trip, previousDay || {});

  return {
    day: dayNumber,
    city,
    lat: coords.lat,
    lng: coords.lng,
    title: `Journée à ${city}`,
    description:
      'Journée complétée automatiquement pour garder un itinéraire cohérent.',
    hotel: previousDay?.hotel || `Hébergement recommandé à ${city}`,
    restaurant: previousDay?.restaurant || `Dîner libre à ${city}`,
    activities: [
      createFallbackActivity({
        time: '09:30',
        name: `Découverte de ${city}`,
        description: 'Activité simple ajoutée pour éviter une journée vide.',
        type: 'visite',
        estimatedCost: '0€ - 20€',
        coords,
        offset: 0.01,
      }),
      createFallbackActivity({
        time: '12:30',
        name: 'Déjeuner libre',
        description: 'Pause repas à adapter selon le quartier.',
        type: 'repas',
        estimatedCost: '15€ - 30€',
        coords,
        offset: 0.012,
      }),
      createFallbackActivity({
        time: '19:30',
        name: 'Soirée libre',
        description: 'Temps libre ajouté pour garder une fin de journée réaliste.',
        type: 'detente',
        estimatedCost: '0€',
        coords,
        offset: 0.014,
      }),
    ],
  };
};

const repairActivities = ({ trip, day, index, itineraryLength, warnings }) => {
  const coords = getFallbackCoords(trip, day);
  const departureDay = isDepartureDay(day, index, itineraryLength);

  let activities = Array.isArray(day.activities) ? [...day.activities] : [];

  if (activities.length === 0) {
    warnings.push(`Jour ${index + 1} : activités manquantes réparées.`);

    if (departureDay) {
      activities = [
        createFallbackActivity({
          time: trip.departure_time || trip.departureTime || '09:00',
          name: 'Départ',
          description: 'Trajet vers la gare ou l’aéroport.',
          type: 'transport',
          estimatedCost: 'Selon transport',
          coords,
        }),
      ];
    } else {
      activities = [
        createFallbackActivity({
          time: '09:30',
          name: `Découverte de ${day.city || trip.destination || 'la destination'}`,
          description: 'Activité principale ajoutée automatiquement.',
          type: 'visite',
          estimatedCost: '0€ - 20€',
          coords,
          offset: 0.01,
        }),
        createFallbackActivity({
          time: '12:30',
          name: 'Déjeuner libre',
          description: 'Pause repas à adapter selon le quartier.',
          type: 'repas',
          estimatedCost: '15€ - 30€',
          coords,
          offset: 0.012,
        }),
      ];
    }
  }

  activities = activities
    .filter((activity) => activity && activity.name)
    .map((activity, activityIndex) => {
      const activityCoords = hasValidCoords(activity)
        ? {
            lat: Number(activity.lat),
            lng: Number(activity.lng),
          }
        : {
            lat: coords.lat + activityIndex * 0.002,
            lng: coords.lng + activityIndex * 0.002,
          };

      if (!hasValidCoords(activity)) {
        warnings.push(
          `Jour ${index + 1} : coordonnées GPS manquantes réparées pour "${activity.name}".`
        );
      }

      return {
        ...activity,
        time: activity.time || '10:00',
        type: activity.type || 'visite',
        estimated_cost: activity.estimated_cost || activity.estimatedCost || '0€',
        lat: activityCoords.lat,
        lng: activityCoords.lng,
      };
    });

  if (departureDay) {
    const beforeCount = activities.length;

    activities = activities.filter((activity) => {
      if (isDinnerActivity(activity)) return false;

      const hour = getActivityHour(activity);
      const departureHour = Number(
        String(trip.departure_time || trip.departureTime || '').split(':')[0]
      );

      if (Number.isFinite(departureHour) && hour !== null && hour > departureHour) {
        return false;
      }

      return true;
    });

    if (activities.length !== beforeCount) {
      warnings.push(`Jour ${index + 1} : activité après départ supprimée.`);
    }

    const hasDeparture = activities.some(isDepartureActivity);

    if (!hasDeparture) {
      activities.push(
        createFallbackActivity({
          time: trip.departure_time || trip.departureTime || '09:00',
          name: 'Départ',
          description: 'Trajet vers la gare ou l’aéroport.',
          type: 'transport',
          estimatedCost: 'Selon transport',
          coords,
        })
      );
      warnings.push(`Jour ${index + 1} : départ ajouté.`);
    }
  } else {
    const hasEvening =
      activities.some(isDinnerActivity) ||
      activities.some((activity) => {
        const hour = getActivityHour(activity);
        return hour !== null && hour >= 18;
      }) ||
      !!day.restaurant;

    if (!hasEvening) {
      activities.push(
        createFallbackActivity({
          time: '19:30',
          name: 'Soirée libre',
          description:
            'Fin de journée libre ajoutée automatiquement pour éviter une journée incomplète.',
          type: 'detente',
          estimatedCost: '0€',
          coords,
          offset: 0.014,
        })
      );
      warnings.push(`Jour ${index + 1} : soirée libre ajoutée.`);
    }
  }

  return sortActivitiesByTime(activities);
};

const repairTransport = ({ trip, day, nextDay, index, warnings }) => {
  const currentCity = day.city;
  const nextCity = nextDay?.city;

  if (!nextDay || !currentCity || !nextCity || currentCity === nextCity) {
    if (day.transport_to_next) {
      warnings.push(`Jour ${index + 1} : transport inutile supprimé.`);
    }

    return undefined;
  }

  const existingOption = day.transport_to_next?.options?.[0];

  if (existingOption) {
    return {
      destination_city: day.transport_to_next.destination_city || nextCity,
      options: day.transport_to_next.options.map((option) => ({
        mode: option.mode || 'train',
        description:
          option.description ||
          `Trajet de ${currentCity} à ${nextCity}, ajouté pour relier les étapes.`,
        duration: option.duration || '1h30 - 3h',
        estimated_cost: option.estimated_cost || '20€ - 60€',
      })),
    };
  }

  warnings.push(`Jour ${index + 1} : transport inter-ville ajouté.`);

  return {
    destination_city: nextCity,
    options: [
      {
        mode: 'train',
        description: `Trajet recommandé de ${currentCity} à ${nextCity}.`,
        duration: '1h30 - 3h',
        estimated_cost: '20€ - 60€',
      },
    ],
  };
};

export const validateAndRepairTrip = (tripData = {}) => {
  const warnings = [];
  const expectedDays = getExpectedDaysCount(tripData);

  let itinerary = Array.isArray(tripData.itinerary)
    ? [...tripData.itinerary]
    : [];

  if (itinerary.length === 0) {
    warnings.push('Itinéraire absent : une journée a été créée.');
    itinerary = [createFallbackDay(tripData, 1, null)];
  }

  if (itinerary.length < expectedDays) {
    warnings.push(
      `Nombre de jours incomplet : ${itinerary.length}/${expectedDays}.`
    );

    while (itinerary.length < expectedDays) {
      itinerary.push(
        createFallbackDay(
          tripData,
          itinerary.length + 1,
          itinerary[itinerary.length - 1]
        )
      );
    }
  }

  if (itinerary.length > expectedDays) {
    warnings.push(
      `Nombre de jours trop élevé : ${itinerary.length}/${expectedDays}.`
    );
    itinerary = itinerary.slice(0, expectedDays);
  }

  itinerary = itinerary.map((day, index) => {
    const coords = getFallbackCoords(
      {
        ...tripData,
        itinerary,
      },
      day
    );

    if (!hasValidCoords(day)) {
      warnings.push(`Jour ${index + 1} : coordonnées GPS de journée réparées.`);
    }

    const normalizedDay = {
      ...day,
      day: index + 1,
      city: day.city || tripData.destination || 'Destination',
      lat: coords.lat,
      lng: coords.lng,
      title:
        day.title ||
        `Jour ${index + 1} — ${day.city || tripData.destination || 'Destination'}`,
      description:
        day.description ||
        'Journée complétée automatiquement pour garder un itinéraire exploitable.',
    };

    return {
      ...normalizedDay,
      activities: repairActivities({
        trip: tripData,
        day: normalizedDay,
        index,
        itineraryLength: itinerary.length,
        warnings,
      }),
    };
  });

  itinerary = itinerary.map((day, index) => {
    const nextDay = itinerary[index + 1];

    return {
      ...day,
      transport_to_next: repairTransport({
        trip: tripData,
        day,
        nextDay,
        index,
        warnings,
      }),
    };
  });

  const repairedTrip = {
    ...tripData,
    itinerary,
    validation: {
      status: warnings.length > 0 ? 'repaired' : 'valid',
      warnings,
      checked_at: new Date().toISOString(),
    },
  };

  return repairedTrip;
};

export const validateTrip = (tripData = {}) => {
  const repairedTrip = validateAndRepairTrip(tripData);

  return {
    isValid: repairedTrip.validation.warnings.length === 0,
    warnings: repairedTrip.validation.warnings,
    trip: repairedTrip,
  };
};
