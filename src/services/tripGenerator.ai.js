import {
  AI_SETTINGS,
} from '@/config/appConfig';

import {
  TRIP_PROMPT_VERSION,
  TRIP_SYSTEM_PROMPT,
} from '@/services/prompts/tripPrompt';

import {
  generateLocalTrip,
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

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const serverMessage =
      typeof data === 'object'
        ? data.message || data.error || JSON.stringify(data)
        : data;

    throw new Error(
      `Erreur endpoint IA : ${response.status} — ${serverMessage || 'Erreur serveur inconnue'}`
    );
  }

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

const getDaysCountFromForm = (form = {}) => {
  if (form.days_count || form.daysCount) {
    return Number(form.days_count || form.daysCount);
  }

  if (form.start_date && form.end_date) {
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (Number.isFinite(diff) && diff > 0) return diff;
  }

  return 3;
};

const generateFallbackTrip = ({ form }) => {
  // Important : le fallback ne parse plus le prompt texte.
  // Il utilise formData en priorité pour éviter qu’un Danemark ou une Italie
  // retombe sur Paris si l’IA échoue.
  const params = form ? { ...form } : {};

  return generateLocalTrip({
    destination: params.destination || 'Paris',
    daysCount: getDaysCountFromForm(params),
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
      ai_provider: 'local',
      prompt_version: TRIP_PROMPT_VERSION,
      ai_error: error?.message || 'Erreur IA inconnue',
      fallback_used: true,
      fallback_at: new Date().toISOString(),
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
