function parseLocalDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = String(dateString).split('-').map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

export function costToNumber(value) {
  if (!value) return 0;

  const text = String(value).toLowerCase();

  if (
    text.includes('selon') ||
    text.includes('variable') ||
    text.includes('gratuit selon') ||
    text.includes('à vérifier')
  ) {
    return 0;
  }

  const numbers = String(value)
    .match(/\d+/g)
    ?.map(Number)
    .filter((n) => !Number.isNaN(n));

  if (!numbers || numbers.length === 0) return 0;

  if (numbers.length >= 2) {
    return Math.round((numbers[0] + numbers[1]) / 2);
  }

  return numbers[0];
}

export function normalizeBudgetKey(budget = '') {
  const value = String(budget)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  if (value.includes('eco')) return 'economique';
  if (value.includes('confort')) return 'confort';
  if (value.includes('luxe')) return 'luxe';
  return 'modere';
}

export function calculateNights(trip = {}) {
  const start = parseLocalDate(trip.start_date);
  const end = parseLocalDate(trip.end_date);

  if (start && end) {
    const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    if (diff > 0) return diff;
  }

  return Math.max(0, (trip.itinerary?.length || 1) - 1);
}

export function getHotelEstimatePerNight(trip = {}) {
  const budgetKey = normalizeBudgetKey(trip.budget);
  const travelers = Number(trip.travelers || 1);
  const rooms = Math.max(1, Math.ceil(travelers / 2));

  const pricePerRoom = {
    economique: 65,
    modere: 120,
    confort: 180,
    luxe: 350,
  }[budgetKey];

  return {
    rooms,
    pricePerRoom,
    totalPerNight: rooms * pricePerRoom,
  };
}

export function calculateVisibleActivitiesBudgetPerPerson(day = {}) {
  return (day.activities || []).reduce((sum, activity) => {
    return sum + costToNumber(activity.estimated_cost);
  }, 0);
}

export function dayHasHotelNight(index, trip = {}) {
  const nights = calculateNights(trip);
  return index < nights;
}

export function calculateDayBudget(day = {}, index = 0, trip = {}) {
  const travelers = Number(trip.travelers || 1);
  const activityPerPerson = calculateVisibleActivitiesBudgetPerPerson(day);
  const activitiesTotal = activityPerPerson * travelers;

  const hotel = getHotelEstimatePerNight(trip);
  const hotelTotal = dayHasHotelNight(index, trip) ? hotel.totalPerNight : 0;

  return {
    activityPerPerson,
    activitiesTotal,
    hotelTotal,
    total: activitiesTotal + hotelTotal,
    hasHotelNight: hotelTotal > 0,
  };
}

export function calculateTripBudget(trip = {}) {
  const itinerary = trip.itinerary || [];
  const travelers = Number(trip.travelers || 1);

  const days = itinerary.map((day, index) =>
    calculateDayBudget(day, index, trip)
  );

  const activitiesTotal = days.reduce((sum, day) => sum + day.activitiesTotal, 0);
  const hotelTotal = days.reduce((sum, day) => sum + day.hotelTotal, 0);
  const total = activitiesTotal + hotelTotal;
  const nights = calculateNights(trip);
  const hotel = getHotelEstimatePerNight(trip);

  return {
    total,
    perPerson: travelers > 0 ? Math.round(total / travelers) : total,
    activitiesTotal,
    hotelTotal,
    nights,
    travelers,
    hotel,
    days,
  };
}

export function estimateDayBudget(day = {}, index = 0, trip = {}) {
  const budget = calculateDayBudget(day, index, trip);
  return budget.total > 0 ? budget.total : null;
}

export function formatTripBudgetLabel(trip = {}) {
  const budget = calculateTripBudget(trip);

  if (budget.total > 0) {
    return `${budget.total}€ estimés`;
  }

  if (trip.estimated_total_cost) {
    return trip.estimated_total_cost;
  }

  if (trip.budget) {
    return trip.budget;
  }

  return 'Budget à préciser';
}
