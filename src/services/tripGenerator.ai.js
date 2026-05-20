import {
  AI_SETTINGS,
} from '@/config/appConfig';

import {
  TRIP_PROMPT_VERSION,
  TRIP_SYSTEM_PROMPT,
} from '@/services/prompts/tripPrompt';

import {
  generateLocalTrip,
  generateLocalTripFromPrompt,
  parsePrompt,
} from '@/services/tripGenerator.local';

const parseJsonSafely = (value) => {
  if (!value) {
    throw new Error('Réponse IA vide.');
  }

  if (typeof value === 'object') {
    return value;
  }

  const cleaned = String(value)
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(cleaned);
};

const callServerlessTripEndpoint = async ({ prompt, form, signal }) => {
  const response = await fetch(AI_SETTINGS.tripGenerationEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      prompt,
      form,
      promptVersion: TRIP_PROMPT_VERSION,
      systemPrompt: TRIP_SYSTEM_PROMPT,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur endpoint IA : ${response.status}`);
  }

  const data = await response.json();

  return parseJsonSafely(data.trip || data.result || data.content || data);
};

const withTimeout = async (promiseFactory, timeoutMs) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await promiseFactory(controller.signal);
  } finally {
    window.clearTimeout(timeout);
  }
};

const generateFallbackTrip = ({ prompt, form }) => {
  if (prompt) {
    return generateLocalTripFromPrompt(prompt);
  }

  const params = form ? { ...form } : {};
  return generateLocalTrip({
    destination: params.destination || 'Paris',
    daysCount: params.days_count || params.daysCount || 3,
    budget: params.budget || 'modere',
    travelers: params.travelers || 2,
    style: params.travel_style || params.style || 'essentiels',
    interests: params.interests || [],
    arrivalCity: params.arrival_city || params.arrivalCity,
    returnCity: params.return_city || params.returnCity,
    walkingLevel: params.walking_level || params.walkingLevel || 'moyen',
    arrivalTime: params.arrival_time || params.arrivalTime,
    departureTime: params.departure_time || params.departureTime,
    avoidItems: params.avoid_items || params.avoidItems,
  });
};

export const generateTripWithAI = async ({
  prompt,
  form,
  fallbackToLocal = AI_SETTINGS.fallbackToLocal,
} = {}) => {
  try {
    const trip = await withTimeout(
      (signal) => callServerlessTripEndpoint({ prompt, form, signal }),
      AI_SETTINGS.timeoutMs
    );

    return {
      ...trip,
      generation_source: 'ai',
      prompt_version: TRIP_PROMPT_VERSION,
    };
  } catch (error) {
    console.warn('[Capi] Génération IA indisponible, fallback local utilisé.', error);

    if (!fallbackToLocal) {
      throw error;
    }

    const fallbackTrip = generateFallbackTrip({ prompt, form });

    return {
      ...fallbackTrip,
      generation_source: 'local_fallback',
      prompt_version: TRIP_PROMPT_VERSION,
      ai_error: error?.message || 'Erreur IA inconnue',
    };
  }
};

export const previewTripAIRequest = ({ prompt, form } = {}) => {
  return {
    endpoint: AI_SETTINGS.tripGenerationEndpoint,
    promptVersion: TRIP_PROMPT_VERSION,
    payload: {
      prompt,
      form,
      promptVersion: TRIP_PROMPT_VERSION,
      systemPrompt: TRIP_SYSTEM_PROMPT,
    },
  };
};
