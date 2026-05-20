import {
  APP_MODES,
  APP_MODE,
  DEMO_SETTINGS,
} from '@/config/appConfig';

import { generateTripWithAI } from '@/services/tripGenerator.ai';
import { generateLocalTripFromPrompt } from '@/services/tripGenerator.local';

import {
  createTrip,
  listTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  clearTrips,
} from '@/services/tripStorage.local';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateTrip = async ({ prompt }) => {
  if (APP_MODE === APP_MODES.AI) {
    return generateTripWithAI({
      prompt,
      fallbackToLocal: true,
    });
  }

  return generateLocalTripFromPrompt(prompt);
};

export const base44 = {
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt }) => {
        await sleep(DEMO_SETTINGS.simulatedGenerationDelayMs);
        return generateTrip({ prompt });
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
