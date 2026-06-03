import {
  IS_AI_MODE,
  DEMO_SETTINGS,
} from '@/config/appConfig';

import { generateTripWithAI } from '@/services/tripGenerator.ai';
import { generateLocalTrip } from '@/services/tripGenerator.local';

import {
  createTrip,
  listTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  clearTrips,
} from '@/services/tripStorage.local';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getDaysCountFromForm = (form = {}) => {
  if (form.days_count || form.daysCount) {
    const days = Number(form.days_count || form.daysCount);
    if (Number.isFinite(days) && days > 0) return days;
  }

  if (form.start_date && form.end_date) {
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (Number.isFinite(diff) && diff > 0) return diff;
  }

  return 3;
};

const generateLocalTripFromForm = (form = {}) => {
  return generateLocalTrip({
    destination: form.destination || 'Paris',
    daysCount: getDaysCountFromForm(form),
    budget: form.budget || 'modere',
    travelers: form.travelers || 2,
    style: form.travel_style || form.style || 'essentiels',
    interests: form.interests || [],
    arrivalCity: form.arrival_city || form.arrivalCity,
    returnCity: form.return_city || form.returnCity,
    walkingLevel: form.walking_level || form.walkingLevel || 'moyen',
    arrivalTime: form.arrival_time || form.arrivalTime,
    departureTime: form.departure_time || form.departureTime,
    avoidItems: form.avoid_items || form.avoidItems,
  });
};

const generateTrip = async ({ prompt, form }) => {
  if (IS_AI_MODE) {
    return generateTripWithAI({
      prompt,
      form,
      fallbackToLocal: true,
    });
  }

  // Important : le mode local ne parse plus le prompt texte pour retrouver
  // la destination. Il utilise les vraies valeurs du formulaire.
  return generateLocalTripFromForm(form);
};

export const base44 = {
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt, form }) => {
        await sleep(DEMO_SETTINGS.simulatedGenerationDelayMs);
        return generateTrip({ prompt, form });
      },
    },
  },

  entities: {
    Trip: {
      create: async (tripData) => createTrip(tripData),

      list: async (sort = '-created_date', limit = 50) => listTrips(sort, limit),

      get: async (id) => getTrip(id),

      update: async (id, updates) => updateTrip(id, updates),

      delete: async (id) => deleteTrip(id),

      clearAll: async () => clearTrips(),
    },
  },

  auth: {
    me: async () => ({
      id: 'local_user',
      email: 'demo@capi.app',
      full_name: 'Utilisateur démo',
    }),
  },
};
