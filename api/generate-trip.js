const AI_PROVIDER = (process.env.AI_PROVIDER || 'openai').toLowerCase();

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const OPENAI_PRICING_USD_PER_1M_TOKENS = {
  'gpt-4.1-mini': {
    input: 0.4,
    output: 1.6,
  },
  'gpt-4o-mini': {
    input: 0.15,
    output: 0.6,
  },
};

const normalizeTokenUsage = (usage = {}) => {
  if (!usage || typeof usage !== 'object') {
    return {
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      raw: usage || null,
    };
  }

  const inputTokens =
    Number(usage.input_tokens) ||
    Number(usage.prompt_tokens) ||
    Number(usage.promptTokenCount) ||
    0;

  const outputTokens =
    Number(usage.output_tokens) ||
    Number(usage.completion_tokens) ||
    Number(usage.candidatesTokenCount) ||
    0;

  const totalTokens =
    Number(usage.total_tokens) ||
    Number(usage.totalTokenCount) ||
    inputTokens + outputTokens;

  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: totalTokens,
    raw: usage,
  };
};

const estimateProviderCostUsd = ({ provider, model, usage } = {}) => {
  if (provider !== 'openai') return 0;

  const pricing = OPENAI_PRICING_USD_PER_1M_TOKENS[model] || OPENAI_PRICING_USD_PER_1M_TOKENS['gpt-4.1-mini'];
  const normalizedUsage = normalizeTokenUsage(usage);
  const inputCost = (normalizedUsage.input_tokens / 1_000_000) * pricing.input;
  const outputCost = (normalizedUsage.output_tokens / 1_000_000) * pricing.output;
  const total = inputCost + outputCost;

  if (!Number.isFinite(total) || total < 0) return 0;

  return Number(total.toFixed(6));
};

const DEFAULT_SYSTEM_PROMPT = `
Tu es Capi, un assistant expert en création d'itinéraires de voyage réalistes.
Tu dois répondre uniquement avec un objet JSON strict, sans markdown.
Le JSON doit contenir un voyage complet compatible avec l'application Capi.
Chaque jour et chaque activité doivent contenir des coordonnées GPS numériques.
Le nombre de jours doit être strictement respecté.
Le dernier jour doit avoir is_departure_day=true, hide_dinner=true et ne doit jamais contenir de dîner complet.
`.trim();

const openAiTripJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'summary',
    'estimated_total_cost',
    'currency',
    'currency_symbol',
    'tips',
    'must_book',
    'weather_alternative',
    'itinerary',
  ],
  properties: {
    summary: { type: 'string' },
    estimated_total_cost: { type: 'string' },
    currency: { type: 'string' },
    currency_symbol: { type: 'string' },
    tips: {
      type: 'array',
      items: { type: 'string' },
    },
    must_book: {
      type: 'array',
      items: { type: 'string' },
    },
    weather_alternative: {
      type: 'array',
      items: { type: 'string' },
    },
    itinerary: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'day',
          'city',
          'lat',
          'lng',
          'title',
          'description',
          'hotel',
          'restaurant',
          'is_departure_day',
          'hide_dinner',
          'activities',
          'transport_to_next',
        ],
        properties: {
          day: { type: 'number' },
          city: { type: 'string' },
          lat: { type: 'number' },
          lng: { type: 'number' },
          title: { type: 'string' },
          description: { type: 'string' },
          hotel: { type: 'string' },
          restaurant: {
            anyOf: [{ type: 'string' }, { type: 'null' }],
          },
          is_departure_day: { type: 'boolean' },
          hide_dinner: { type: 'boolean' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: [
                'time',
                'name',
                'description',
                'type',
                'estimated_cost',
                'duration',
                'tags',
                'lat',
                'lng',
              ],
              properties: {
                time: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                type: {
                  type: 'string',
                  enum: [
                    'visite',
                    'repas',
                    'transport',
                    'detente',
                    'nature',
                    'photo',
                    'shopping',
                    'activite',
                  ],
                },
                estimated_cost: { type: 'string' },
                duration: { type: 'string' },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                },
                lat: { type: 'number' },
                lng: { type: 'number' },
              },
            },
          },
          transport_to_next: {
            anyOf: [
              { type: 'null' },
              {
                type: 'object',
                additionalProperties: false,
                required: ['destination_city', 'options'],
                properties: {
                  destination_city: { type: 'string' },
                  options: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      required: ['mode', 'description', 'duration', 'estimated_cost'],
                      properties: {
                        mode: { type: 'string' },
                        description: { type: 'string' },
                        duration: { type: 'string' },
                        estimated_cost: { type: 'string' },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
};

const geminiTripJsonSchema = {
  type: 'object',
  required: [
    'summary',
    'estimated_total_cost',
    'currency',
    'currency_symbol',
    'tips',
    'must_book',
    'weather_alternative',
    'itinerary',
  ],
  properties: {
    summary: { type: 'string' },
    estimated_total_cost: { type: 'string' },
    currency: { type: 'string' },
    currency_symbol: { type: 'string' },
    tips: {
      type: 'array',
      items: { type: 'string' },
    },
    must_book: {
      type: 'array',
      items: { type: 'string' },
    },
    weather_alternative: {
      type: 'array',
      items: { type: 'string' },
    },
    itinerary: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: [
          'day',
          'city',
          'lat',
          'lng',
          'title',
          'description',
          'hotel',
          'restaurant',
          'is_departure_day',
          'hide_dinner',
          'activities',
          'transport_to_next',
        ],
        properties: {
          day: { type: 'number' },
          city: { type: 'string' },
          lat: { type: 'number' },
          lng: { type: 'number' },
          title: { type: 'string' },
          description: { type: 'string' },
          hotel: { type: 'string' },
          restaurant: { type: ['string', 'null'] },
          is_departure_day: { type: 'boolean' },
          hide_dinner: { type: 'boolean' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              required: [
                'time',
                'name',
                'description',
                'type',
                'estimated_cost',
                'duration',
                'tags',
                'lat',
                'lng',
              ],
              properties: {
                time: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                type: {
                  type: 'string',
                  enum: [
                    'visite',
                    'repas',
                    'transport',
                    'detente',
                    'nature',
                    'photo',
                    'shopping',
                    'activite',
                  ],
                },
                estimated_cost: { type: 'string' },
                duration: { type: 'string' },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                },
                lat: { type: 'number' },
                lng: { type: 'number' },
              },
            },
          },
          transport_to_next: {
            type: ['object', 'null'],
            required: ['destination_city', 'options'],
            properties: {
              destination_city: { type: 'string' },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['mode', 'description', 'duration', 'estimated_cost'],
                  properties: {
                    mode: { type: 'string' },
                    description: { type: 'string' },
                    duration: { type: 'string' },
                    estimated_cost: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;

  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');

  return rawBody ? JSON.parse(rawBody) : {};
};

const extractOpenAiOutputText = (openaiResponse) => {
  if (openaiResponse.output_text) return openaiResponse.output_text;

  const output = openaiResponse.output || [];

  for (const item of output) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) {
        return content.text;
      }

      if (content.type === 'text' && content.text) {
        return content.text;
      }
    }
  }

  return '';
};

const extractGeminiOutputText = (geminiResponse) => {
  const parts = geminiResponse?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((part) => part.text)
    .filter(Boolean)
    .join('');

  if (text) return text;

  return geminiResponse?.text || '';
};

const ALLOWED_ACTIVITY_TYPES = new Set([
  'visite',
  'repas',
  'transport',
  'detente',
  'nature',
  'photo',
  'shopping',
  'activite',
]);

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
};

const toStringValue = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  return String(value);
};

const toNumberValue = (value, fallback = null) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const removeCodeFences = (value) => {
  return String(value)
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
};

const removeTrailingCommas = (value) => {
  return value.replace(/,\s*([}\]])/g, '$1');
};

const extractJsonObjectCandidate = (value) => {
  const cleaned = removeCodeFences(value);

  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    return cleaned;
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return cleaned;
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
};

const parseTripJson = (value) => {
  if (!value) {
    throw new Error('Réponse IA vide.');
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      throw new Error('Réponse IA invalide : le JSON racine doit être un objet, pas un tableau.');
    }

    return value;
  }

  const candidate = extractJsonObjectCandidate(value);

  const attempts = [
    candidate,
    removeTrailingCommas(candidate),
  ];

  let lastError = null;

  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt);

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Le JSON racine doit être un objet.');
      }

      return parsed;
    } catch (error) {
      lastError = error;
    }
  }

  const preview = candidate.slice(0, 400).replace(/\s+/g, ' ');

  throw new Error(
    `JSON IA non parsable : ${lastError?.message || 'erreur inconnue'}. Aperçu : ${preview}`
  );
};

const assertTripShape = (trip) => {
  if (!trip || typeof trip !== 'object' || Array.isArray(trip)) {
    throw new Error('Réponse IA invalide : le voyage doit être un objet JSON.');
  }

  if (!Array.isArray(trip.itinerary)) {
    throw new Error('Réponse IA invalide : itinerary doit être un tableau.');
  }

  if (trip.itinerary.length === 0) {
    throw new Error('Réponse IA invalide : itinerary est vide.');
  }

  const brokenDayIndex = trip.itinerary.findIndex(
    (day) => !day || typeof day !== 'object' || Array.isArray(day)
  );

  if (brokenDayIndex !== -1) {
    throw new Error(`Réponse IA invalide : le jour ${brokenDayIndex + 1} n’est pas un objet.`);
  }

  return true;
};

const normalizeActivity = (activity, activityIndex, day) => {
  const dayLat = toNumberValue(day.lat, 48.8566);
  const dayLng = toNumberValue(day.lng, 2.3522);
  const type = toStringValue(activity?.type, 'visite');

  return {
    time: toStringValue(activity?.time, activityIndex === 0 ? '09:30' : '10:00'),
    name: toStringValue(activity?.name, `Activité ${activityIndex + 1}`),
    description: toStringValue(activity?.description, 'Activité proposée par Capi.'),
    type: ALLOWED_ACTIVITY_TYPES.has(type) ? type : 'visite',
    estimated_cost: toStringValue(
      activity?.estimated_cost || activity?.estimatedCost,
      '0€'
    ),
    duration: toStringValue(activity?.duration, '1h'),
    tags: toArray(activity?.tags).map((tag) => toStringValue(tag)).filter(Boolean),
    lat: toNumberValue(activity?.lat, dayLat + activityIndex * 0.002),
    lng: toNumberValue(activity?.lng, dayLng + activityIndex * 0.002),
  };
};

const normalizeTransport = (transport) => {
  if (!transport || typeof transport !== 'object' || Array.isArray(transport)) {
    return null;
  }

  const options = toArray(transport.options)
    .filter((option) => option && typeof option === 'object')
    .map((option) => ({
      mode: toStringValue(option.mode, 'train'),
      description: toStringValue(option.description, 'Trajet recommandé entre deux étapes.'),
      duration: toStringValue(option.duration, 'Durée à vérifier'),
      estimated_cost: toStringValue(option.estimated_cost || option.estimatedCost, 'Selon transport'),
    }));

  if (!transport.destination_city && options.length === 0) {
    return null;
  }

  return {
    destination_city: toStringValue(transport.destination_city, ''),
    options,
  };
};

const sanitizeTrip = (trip, provider) => {
  assertTripShape(trip);

  const itinerary = trip.itinerary.map((day, index) => {
    const isLastDay = index === trip.itinerary.length - 1;
    const isDepartureDay = Boolean(day.is_departure_day) || isLastDay;
    const hideDinner = Boolean(day.hide_dinner) || isDepartureDay;

    const normalizedDay = {
      ...day,
      day: toNumberValue(day.day, index + 1),
      city: toStringValue(day.city, 'Ville à préciser'),
      lat: toNumberValue(day.lat, 48.8566),
      lng: toNumberValue(day.lng, 2.3522),
      title: toStringValue(day.title, `Jour ${index + 1}`),
      description: toStringValue(day.description, 'Journée générée par Capi.'),
      hotel: toStringValue(day.hotel, ''),
      restaurant: hideDinner ? null : toStringValue(day.restaurant, ''),
      is_departure_day: isDepartureDay,
      hide_dinner: hideDinner,
      transport_to_next: normalizeTransport(day.transport_to_next),
    };

    const activities = toArray(day.activities)
      .filter((activity) => activity && typeof activity === 'object')
      .map((activity, activityIndex) =>
        normalizeActivity(activity, activityIndex, normalizedDay)
      );

    return {
      ...normalizedDay,
      activities,
    };
  });

  return {
    ...trip,
    summary: toStringValue(trip.summary, 'Voyage généré par Capi.'),
    estimated_total_cost: toStringValue(trip.estimated_total_cost, 'Budget à vérifier'),
    currency: toStringValue(trip.currency, 'EUR'),
    currency_symbol: toStringValue(trip.currency_symbol, '€'),
    tips: toArray(trip.tips).map((item) => toStringValue(item)).filter(Boolean),
    must_book: toArray(trip.must_book).map((item) => toStringValue(item)).filter(Boolean),
    weather_alternative: toArray(trip.weather_alternative)
      .map((item) => toStringValue(item))
      .filter(Boolean),
    generation_source: 'ai',
    ai_provider: provider,
    generated_at: new Date().toISOString(),
    itinerary,
  };
};


const DAY_MS = 1000 * 60 * 60 * 24;

const parseDate = (dateString) => {
  if (!dateString) return null;

  const [year, month, day] = String(dateString).split('-').map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};

const getExpectedDaysCount = ({ form, prompt, trip }) => {
  if (form?.days_count || form?.daysCount) {
    const days = Number(form.days_count || form.daysCount);
    if (Number.isFinite(days) && days > 0) return days;
  }

  const start = parseDate(form?.start_date);
  const end = parseDate(form?.end_date);

  if (start && end) {
    const diff = Math.floor((end - start) / DAY_MS) + 1;
    if (diff > 0 && diff < 90) return diff;
  }

  const promptDays =
    String(prompt || '').match(/Durée\s*:\s*(\d+)\s*jours/i)?.[1] ||
    String(prompt || '').match(/Nombre exact de jours\s*:\s*(\d+)/i)?.[1];

  if (promptDays) {
    const days = Number(promptDays);
    if (Number.isFinite(days) && days > 0) return days;
  }

  if (Array.isArray(trip?.itinerary) && trip.itinerary.length > 0) {
    return trip.itinerary.length;
  }

  return null;
};

const getDepartureTime = ({ form, prompt }) => {
  return (
    form?.departure_time ||
    form?.departureTime ||
    String(prompt || '').match(/Heure de départ\s*:\s*([^\n]+)/i)?.[1]?.trim() ||
    String(prompt || '').match(/Heure de retour\s*:\s*([^\n]+)/i)?.[1]?.trim() ||
    ''
  );
};

const getHourFromTime = (time) => {
  const match = String(time || '').match(/(\d{1,2})/);
  if (!match) return null;

  const hour = Number(match[1]);
  return Number.isFinite(hour) ? hour : null;
};

const normalizeText = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const isDinnerLikeActivity = (activity) => {
  const text = normalizeText(
    `${activity?.time || ''} ${activity?.name || ''} ${activity?.type || ''} ${activity?.description || ''}`
  );
  const hour = getHourFromTime(activity?.time);

  return (
    text.includes('diner') ||
    text.includes('restaurant du soir') ||
    text.includes('soiree') ||
    text.includes('soir') ||
    (activity?.type === 'repas' && hour !== null && hour >= 18)
  );
};

const uniqueStrings = (list = []) => {
  const seen = new Set();

  return toArray(list)
    .map((item) => toStringValue(item).trim())
    .filter(Boolean)
    .filter((item) => {
      const key = normalizeText(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const getFallbackCoords = (trip, day) => {
  const dayLat = toNumberValue(day?.lat, null);
  const dayLng = toNumberValue(day?.lng, null);

  if (dayLat !== null && dayLng !== null) {
    return { lat: dayLat, lng: dayLng };
  }

  const firstActivity = (day?.activities || []).find(
    (activity) =>
      toNumberValue(activity?.lat, null) !== null &&
      toNumberValue(activity?.lng, null) !== null
  );

  if (firstActivity) {
    return {
      lat: Number(firstActivity.lat),
      lng: Number(firstActivity.lng),
    };
  }

  const firstDay = (trip?.itinerary || []).find(
    (item) => toNumberValue(item?.lat, null) !== null && toNumberValue(item?.lng, null) !== null
  );

  if (firstDay) {
    return {
      lat: Number(firstDay.lat),
      lng: Number(firstDay.lng),
    };
  }

  return {
    lat: 48.8566,
    lng: 2.3522,
  };
};

const createFallbackActivity = ({ day, index, time, name, type = 'visite' }) => {
  const coords = getFallbackCoords({ itinerary: [day] }, day);

  return {
    time,
    name,
    description: 'Ajout automatique pour garantir un itinéraire complet et exploitable.',
    type,
    estimated_cost: type === 'repas' ? '15€ - 30€' : '0€ - 20€',
    duration: type === 'repas' ? '1h' : '1h30',
    tags: ['auto-repair'],
    lat: coords.lat + index * 0.002,
    lng: coords.lng + index * 0.002,
  };
};

const createFallbackDay = ({ trip, dayNumber }) => {
  const previousDay = trip.itinerary?.[trip.itinerary.length - 1] || {};
  const city = previousDay.city || trip.destination || 'Destination';
  const coords = getFallbackCoords(trip, previousDay);

  return {
    day: dayNumber,
    city,
    lat: coords.lat,
    lng: coords.lng,
    title: `Journée à ${city}`,
    description: 'Journée ajoutée automatiquement pour respecter le nombre exact de jours.',
    hotel: previousDay.hotel || `Hébergement recommandé à ${city}`,
    restaurant: `Dîner libre à ${city}`,
    is_departure_day: false,
    hide_dinner: false,
    activities: [
      createFallbackActivity({
        day: { ...previousDay, lat: coords.lat, lng: coords.lng },
        index: 0,
        time: '09:30',
        name: `Découverte de ${city}`,
        type: 'visite',
      }),
      createFallbackActivity({
        day: { ...previousDay, lat: coords.lat, lng: coords.lng },
        index: 1,
        time: '12:30',
        name: 'Déjeuner libre',
        type: 'repas',
      }),
      createFallbackActivity({
        day: { ...previousDay, lat: coords.lat, lng: coords.lng },
        index: 2,
        time: '17:30',
        name: 'Temps libre',
        type: 'detente',
      }),
    ],
    transport_to_next: null,
  };
};

const ensureDayActivities = ({ trip, day, dayIndex, isLastDay, departureTime, warnings }) => {
  let activities = toArray(day.activities)
    .filter((activity) => activity && typeof activity === 'object')
    .map((activity, activityIndex) => normalizeActivity(activity, activityIndex, day));

  if (isLastDay) {
    const departureHour = getHourFromTime(departureTime);

    activities = activities.filter((activity) => {
      if (isDinnerLikeActivity(activity)) return false;

      const hour = getHourFromTime(activity.time);
      if (departureHour !== null && hour !== null && hour > departureHour) return false;

      return true;
    });

    const hasDeparture = activities.some((activity) =>
      normalizeText(activity.name).includes('depart')
    );

    if (!hasDeparture) {
      activities.push({
        time: departureTime || '09:00',
        name: 'Départ',
        description: 'Trajet vers la gare ou l’aéroport.',
        type: 'transport',
        estimated_cost: 'Selon transport',
        duration: 'Selon transport',
        tags: ['departure'],
        lat: day.lat,
        lng: day.lng,
      });
      warnings.push(`Jour ${dayIndex + 1} : départ ajouté automatiquement.`);
    }

    return activities.sort((a, b) => String(a.time).localeCompare(String(b.time)));
  }

  if (activities.length === 0) {
    activities = [
      createFallbackActivity({
        day,
        index: 0,
        time: '09:30',
        name: `Découverte de ${day.city || 'la destination'}`,
        type: 'visite',
      }),
      createFallbackActivity({
        day,
        index: 1,
        time: '12:30',
        name: 'Déjeuner libre',
        type: 'repas',
      }),
    ];

    warnings.push(`Jour ${dayIndex + 1} : activités ajoutées automatiquement.`);
  }

  const hasEvening =
    activities.some(isDinnerLikeActivity) ||
    activities.some((activity) => {
      const hour = getHourFromTime(activity.time);
      return hour !== null && hour >= 18;
    });

  if (!hasEvening) {
    activities.push(
      createFallbackActivity({
        day,
        index: activities.length,
        time: '19:30',
        name: 'Soirée libre',
        type: 'detente',
      })
    );
    warnings.push(`Jour ${dayIndex + 1} : soirée libre ajoutée automatiquement.`);
  }

  return activities.sort((a, b) => String(a.time).localeCompare(String(b.time)));
};

const ensureTransports = ({ itinerary, warnings }) => {
  return itinerary.map((day, index) => {
    const nextDay = itinerary[index + 1];

    if (!nextDay) {
      return {
        ...day,
        transport_to_next: null,
      };
    }

    if (!day.city || !nextDay.city || day.city === nextDay.city) {
      if (day.transport_to_next) {
        warnings.push(`Jour ${index + 1} : transport supprimé car la ville ne change pas.`);
      }

      return {
        ...day,
        transport_to_next: null,
      };
    }

    if (day.transport_to_next?.options?.length) {
      return day;
    }

    warnings.push(`Jour ${index + 1} : transport inter-ville ajouté automatiquement.`);

    return {
      ...day,
      transport_to_next: {
        destination_city: nextDay.city,
        options: [
          {
            mode: 'train',
            description: `Trajet recommandé de ${day.city} à ${nextDay.city}.`,
            duration: 'Durée à vérifier',
            estimated_cost: 'Selon transport',
          },
        ],
      },
    };
  });
};

const validatePostAITrip = ({ trip, form, prompt, provider }) => {
  const warnings = [];
  const expectedDays = getExpectedDaysCount({ form, prompt, trip });
  const departureTime = getDepartureTime({ form, prompt });

  if (!Array.isArray(trip.itinerary) || trip.itinerary.length === 0) {
    throw new Error('Réponse IA trop incomplète : itinerary absent ou vide.');
  }

  if (expectedDays && Math.abs(trip.itinerary.length - expectedDays) > Math.max(2, expectedDays / 2)) {
    throw new Error(
      `Réponse IA trop incohérente : ${trip.itinerary.length} jour(s) reçus pour ${expectedDays} attendu(s).`
    );
  }

  let itinerary = [...trip.itinerary];

  if (expectedDays && itinerary.length > expectedDays) {
    warnings.push(`Itinéraire tronqué : ${itinerary.length}/${expectedDays} jours.`);
    itinerary = itinerary.slice(0, expectedDays);
  }

  while (expectedDays && itinerary.length < expectedDays) {
    warnings.push(`Jour ${itinerary.length + 1} ajouté pour respecter la durée.`);
    itinerary.push(createFallbackDay({ trip: { ...trip, itinerary }, dayNumber: itinerary.length + 1 }));
  }

  itinerary = itinerary.map((day, index) => {
    const isLastDay = index === itinerary.length - 1;
    const coords = getFallbackCoords(trip, day);

    const normalizedDay = {
      ...day,
      day: index + 1,
      city: toStringValue(day.city, form?.destination || trip.destination || 'Destination'),
      lat: toNumberValue(day.lat, coords.lat),
      lng: toNumberValue(day.lng, coords.lng),
      title: toStringValue(day.title, `Jour ${index + 1}`),
      description: toStringValue(day.description, 'Journée générée par Capi.'),
      hotel: toStringValue(day.hotel, ''),
      is_departure_day: isLastDay ? true : Boolean(day.is_departure_day),
      hide_dinner: isLastDay ? true : Boolean(day.hide_dinner),
    };

    normalizedDay.restaurant =
      normalizedDay.hide_dinner || normalizedDay.is_departure_day
        ? null
        : toStringValue(day.restaurant, '');

    normalizedDay.activities = ensureDayActivities({
      trip,
      day: normalizedDay,
      dayIndex: index,
      isLastDay,
      departureTime,
      warnings,
    });

    return normalizedDay;
  });

  itinerary = ensureTransports({ itinerary, warnings });

  const repairedTrip = {
    ...trip,
    destination: trip.destination || form?.destination,
    tips: uniqueStrings(trip.tips),
    must_book: uniqueStrings(trip.must_book),
    weather_alternative: uniqueStrings(trip.weather_alternative),
    itinerary,
    generation_source: 'ai',
    ai_provider: provider,
    post_ai_validation: {
      status: warnings.length > 0 ? 'repaired' : 'valid',
      warnings,
      checked_at: new Date().toISOString(),
    },
  };

  return repairedTrip;
};

const callOpenAI = async ({ prompt, form, promptVersion, systemPrompt }) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('La variable d’environnement OPENAI_API_KEY est manquante côté serveur.');
  }

  const userContent =
    prompt ||
    `Génère un voyage Capi à partir de ce formulaire JSON : ${JSON.stringify(form)}`;

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: 'system',
          content: systemPrompt || DEFAULT_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
      temperature: 0.4,
      max_output_tokens: 12000,
      text: {
        format: {
          type: 'json_schema',
          name: 'capi_trip',
          strict: true,
          schema: openAiTripJsonSchema,
        },
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Erreur OpenAI.');
  }

  const outputText = extractOpenAiOutputText(data);

  return {
    trip: validatePostAITrip({
      trip: sanitizeTrip(parseTripJson(outputText), 'openai'),
      form,
      prompt,
      provider: 'openai',
    }),
    source: 'openai',
    model: OPENAI_MODEL,
    promptVersion: promptVersion || null,
    usage: data.usage || null,
    estimatedCostUsd: estimateProviderCostUsd({
      provider: 'openai',
      model: OPENAI_MODEL,
      usage: data.usage,
    }),
  };
};

const callGemini = async ({ prompt, form, promptVersion, systemPrompt }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('La variable d’environnement GEMINI_API_KEY est manquante côté serveur.');
  }

  const userContent =
    prompt ||
    `Génère un voyage Capi à partir de ce formulaire JSON : ${JSON.stringify(form)}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-goog-api-key': process.env.GEMINI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: systemPrompt || DEFAULT_SYSTEM_PROMPT,
          },
        ],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userContent,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 12000,
        responseMimeType: 'application/json',
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Erreur Gemini.');
  }

  const outputText = extractGeminiOutputText(data);

  return {
    trip: validatePostAITrip({
      trip: sanitizeTrip(parseTripJson(outputText), 'gemini'),
      form,
      prompt,
      provider: 'gemini',
    }),
    source: 'gemini',
    model: GEMINI_MODEL,
    promptVersion: promptVersion || null,
    usage: data.usageMetadata || null,
    estimatedCostUsd: estimateProviderCostUsd({
      provider: 'gemini',
      model: GEMINI_MODEL,
      usage: data.usageMetadata,
    }),
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'method_not_allowed',
      message: 'Seule la méthode POST est autorisée.',
    });
  }

  try {
    const body = await readBody(req);
    const {
      prompt,
      form,
      promptVersion,
      systemPrompt,
    } = body || {};

    if (!prompt && !form) {
      return res.status(400).json({
        error: 'missing_prompt',
        message: 'Le payload doit contenir un prompt ou un formulaire.',
      });
    }

    const provider = AI_PROVIDER === 'gemini' ? 'gemini' : 'openai';

    const result =
      provider === 'gemini'
        ? await callGemini({ prompt, form, promptVersion, systemPrompt })
        : await callOpenAI({ prompt, form, promptVersion, systemPrompt });

    return res.status(200).json(result);
  } catch (error) {
    console.error('[api/generate-trip]', error);

    return res.status(500).json({
      error: 'generate_trip_failed',
      provider: AI_PROVIDER,
      message: error?.message || 'Impossible de générer le voyage.',
    });
  }
}
