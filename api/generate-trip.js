const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';

const DEFAULT_SYSTEM_PROMPT = `
Tu es Capi, un assistant expert en création d'itinéraires de voyage réalistes.
Tu dois répondre uniquement avec un objet JSON strict, sans markdown.
Le JSON doit contenir un voyage complet compatible avec l'application Capi.
Chaque jour et chaque activité doivent contenir des coordonnées GPS numériques.
Le nombre de jours doit être strictement respecté.
Le dernier jour doit avoir is_departure_day=true, hide_dinner=true et ne doit jamais contenir de dîner complet.
`.trim();

const tripJsonSchema = {
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
            anyOf: [
              { type: 'string' },
              { type: 'null' },
            ],
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

const extractOutputText = (openaiResponse) => {
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

const parseTripJson = (value) => {
  if (!value) {
    throw new Error('Réponse IA vide.');
  }

  if (typeof value === 'object') return value;

  const cleaned = String(value)
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(cleaned);
};

const sanitizeTrip = (trip) => {
  const itinerary = Array.isArray(trip.itinerary) ? trip.itinerary : [];

  return {
    ...trip,
    generation_source: 'ai',
    generated_at: new Date().toISOString(),
    itinerary: itinerary.map((day, index) => ({
      ...day,
      day: Number(day.day || index + 1),
      restaurant: day.hide_dinner || day.is_departure_day ? null : day.restaurant,
      transport_to_next: day.transport_to_next || null,
      activities: Array.isArray(day.activities) ? day.activities : [],
    })),
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

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'missing_openai_api_key',
      message: 'La variable d’environnement OPENAI_API_KEY est manquante côté serveur.',
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

    const userContent =
      prompt ||
      `Génère un voyage Capi à partir de ce formulaire JSON : ${JSON.stringify(form)}`;

    const openaiResponse = await fetch(OPENAI_RESPONSES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
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
            schema: tripJsonSchema,
          },
        },
      }),
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return res.status(openaiResponse.status).json({
        error: 'openai_error',
        message: data?.error?.message || 'Erreur OpenAI.',
        details: data?.error || data,
      });
    }

    const outputText = extractOutputText(data);
    const trip = sanitizeTrip(parseTripJson(outputText));

    return res.status(200).json({
      trip,
      source: 'openai',
      model: DEFAULT_MODEL,
      promptVersion: promptVersion || null,
      usage: data.usage || null,
    });
  } catch (error) {
    console.error('[api/generate-trip]', error);

    return res.status(500).json({
      error: 'generate_trip_failed',
      message: error?.message || 'Impossible de générer le voyage.',
    });
  }
}
