const AI_PROVIDER = (process.env.AI_PROVIDER || 'openai').toLowerCase();

const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

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
    trip: sanitizeTrip(parseTripJson(outputText), 'openai'),
    source: 'openai',
    model: OPENAI_MODEL,
    promptVersion: promptVersion || null,
    usage: data.usage || null,
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
    trip: sanitizeTrip(parseTripJson(outputText), 'gemini'),
    source: 'gemini',
    model: GEMINI_MODEL,
    promptVersion: promptVersion || null,
    usage: data.usageMetadata || null,
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
