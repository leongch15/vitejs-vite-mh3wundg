import { STORAGE_KEYS } from '@/config/appConfig';
import { validateAndRepairTrip } from '@/services/tripValidator.local';

const STORAGE_KEY = STORAGE_KEYS.TRIPS;

const getStoredTrips = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveTrips = (trips) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
};

const createId = () => {
  return `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const createTrip = async (tripData) => {
  const trips = getStoredTrips();
  const now = new Date().toISOString();

  const newTrip = validateAndRepairTrip({
    ...tripData,
    id: createId(),
    created_date: now,
    updated_date: now,
  });

  saveTrips([newTrip, ...trips]);

  return newTrip;
};

export const listTrips = async (sort = '-created_date', limit = 50) => {
  const trips = getStoredTrips();

  const sortedTrips = [...trips].sort((a, b) => {
    if (sort === 'created_date') {
      return new Date(a.created_date || 0) - new Date(b.created_date || 0);
    }

    if (sort === '-updated_date') {
      return new Date(b.updated_date || 0) - new Date(a.updated_date || 0);
    }

    if (sort === 'updated_date') {
      return new Date(a.updated_date || 0) - new Date(b.updated_date || 0);
    }

    return new Date(b.created_date || 0) - new Date(a.created_date || 0);
  });

  if (!limit) return sortedTrips;

  return sortedTrips.slice(0, limit);
};

export const getTrip = async (id) => {
  const trips = getStoredTrips();
  const trip = trips.find((item) => item.id === id);

  if (!trip) {
    throw new Error('Voyage introuvable');
  }

  return trip;
};

export const updateTrip = async (id, updates) => {
  const trips = getStoredTrips();

  let updatedTrip = null;

  const updatedTrips = trips.map((trip) => {
    if (trip.id !== id) return trip;

    updatedTrip = validateAndRepairTrip({
      ...trip,
      ...updates,
      updated_date: new Date().toISOString(),
    });

    return updatedTrip;
  });

  saveTrips(updatedTrips);

  if (!updatedTrip) {
    throw new Error('Voyage introuvable');
  }

  return updatedTrip;
};

export const deleteTrip = async (id) => {
  const trips = getStoredTrips();
  saveTrips(trips.filter((trip) => trip.id !== id));
  return true;
};

export const clearTrips = async () => {
  saveTrips([]);
  return true;
};

// Exports temporaires utiles si besoin pendant la migration.
export const __localTripStorage = {
  getStoredTrips,
  saveTrips,
};
