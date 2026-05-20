import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Trash2,
  Loader2,
  BookmarkCheck,
  CloudRain,
  Wallet,
  RefreshCw,
  ChevronDown,
  MapPin,
  CalendarDays,
  Bed,
  Utensils,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import TripSummaryHeader from '@/components/trip/TripSummaryHeader';
import TipsList from '@/components/trip/TipsList';
import ItineraryMap from '@/components/trip/ItineraryMap';
import TripRoadmap from '@/components/trip/TripRoadmap';
import TripInsights from '@/components/trip/TripInsights';
import { motion, AnimatePresence } from 'framer-motion';
import {
  calculateDayBudget,
  calculateTripBudget,
  estimateDayBudget,
} from '@/services/tripBudget.local';

const ADJUST_ACTIONS = [
  { id: 'cheaper', label: '💸 Moins cher' },
  { id: 'relaxed', label: '😌 Plus relax' },
  { id: 'mustSee', label: '⭐ Incontournables' },
  { id: 'food', label: '🍷 Plus food' },
  { id: 'rainy', label: '☂️ Adapter à la pluie' },
  { id: 'premium', label: '✨ Plus premium' },
  { id: 'instagram', label: '📸 Plus instagrammable' },
  { id: 'nature', label: '🌿 Plus nature' },
  { id: 'lessTransport', label: '🚶 Moins de trajets' },
];

const ACTIVITY_ICONS = {
  visite: '🏛️',
  repas: '🍽️',
  activite: '✨',
  transport: '🚆',
  detente: '☕',
  shopping: '🛍️',
  nature: '🌿',
  photo: '📸',
};

function formatDate(dateString) {
  if (!dateString) return null;

  try {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(dateString));
  } catch {
    return null;
  }
}

function addDays(dateString, index) {
  if (!dateString) return null;

  const date = new Date(dateString);
  date.setDate(date.getDate() + index);
  return date.toISOString();
}

function getActivityIcon(type) {
  return ACTIVITY_ICONS[type] || '📍';
}

function getTransportEmoji(mode = '') {
  const lower = mode.toLowerCase();

  if (lower.includes('train')) return '🚆';
  if (lower.includes('voiture') || lower.includes('car')) return '🚗';
  if (lower.includes('bus')) return '🚌';
  if (lower.includes('ferry') || lower.includes('bateau')) return '⛴️';
  if (lower.includes('avion')) return '✈️';
  if (lower.includes('marche') || lower.includes('pied')) return '🚶';
  if (lower.includes('métro') || lower.includes('tram')) return '🚇';

  return '➡️';
}

function uniqueList(list = []) {
  return [...new Set((list || []).filter(Boolean))];
}

function ensureDayHasActivities(day, index, trip) {
  if (Array.isArray(day.activities) && day.activities.length > 0) {
    return day;
  }

  const city = day.city || trip.destination || 'la destination';
  const lat = day.lat || 48.8566;
  const lng = day.lng || 2.3522;

  return {
    ...day,
    day: day.day || index + 1,
    city,
    lat,
    lng,
    title: day.title || `Découverte de ${city}`,
    description:
      day.description ||
      `Journée équilibrée pour découvrir ${city} avec un rythme réaliste.`,
    hotel: day.hotel || `Hébergement recommandé à ${city}`,
    restaurant: day.restaurant || `Dîner local à ${city}`,
    activities: [
      {
        time: '09:30',
        name: `Découverte du centre de ${city}`,
        description: 'Balade dans une zone centrale pour découvrir les incontournables.',
        type: 'visite',
        estimated_cost: '0€ - 15€',
        lat: lat + 0.01,
        lng: lng + 0.01,
      },
      {
        time: '12:30',
        name: 'Déjeuner local accessible',
        description: 'Pause repas adaptée au budget choisi.',
        type: 'repas',
        estimated_cost: '15€ - 30€',
        lat: lat + 0.012,
        lng: lng + 0.012,
      },
      {
        time: '15:00',
        name: `Quartier emblématique de ${city}`,
        description: 'Visite d’un quartier intéressant avec une logique de trajet simple.',
        type: 'visite',
        estimated_cost: '0€ - 20€',
        lat: lat + 0.018,
        lng: lng + 0.018,
      },
      {
        time: '20:00',
        name: 'Dîner recommandé',
        description: 'Dîner simple et cohérent avec le budget.',
        type: 'repas',
        estimated_cost: '20€ - 35€',
        lat: lat + 0.014,
        lng: lng + 0.014,
      },
    ],
  };
}

function makeCheaperActivity(activity) {
  if (activity.type === 'repas') {
    return {
      ...activity,
      name:
        activity.name?.replace(/étoilé|gastronomique|premium|haut de gamme/gi, 'local') ||
        'Repas local accessible',
      description: 'Alternative locale et abordable, adaptée à un budget économique ou modéré.',
      estimated_cost: '10€ - 22€',
    };
  }

  if (activity.type === 'transport') {
    return {
      ...activity,
      description: 'Option optimisée pour limiter les coûts, en privilégiant les transports publics.',
      estimated_cost: '2€ - 15€',
    };
  }

  if (activity.type === 'visite' || activity.type === 'activite') {
    return {
      ...activity,
      description: `${activity.description || ''} Option privilégiant les lieux gratuits ou peu coûteux.`,
      estimated_cost: '0€ - 12€',
    };
  }

  return {
    ...activity,
    estimated_cost: activity.estimated_cost || '0€ - 10€',
  };
}

function isDinnerActivity(activity) {
  const text = `${activity.time || ''} ${activity.name || ''} ${activity.description || ''}`.toLowerCase();
  const hour = Number(String(activity.time || '').slice(0, 2));

  return (
    text.includes('dîner') ||
    text.includes('soir') ||
    (!Number.isNaN(hour) && hour >= 18)
  );
}

function ensureMeal(day) {
  if (shouldHideDinner(day)) {
    return {
      ...day,
      restaurant: '',
      activities: (day.activities || [])
        .filter((activity) => !isDinnerActivity(activity))
        .sort((a, b) => String(a.time || '').localeCompare(String(b.time || ''))),
    };
  }

  const activities = [...(day.activities || [])];
  const hasDinner = activities.some(isDinnerActivity);

  if (!hasDinner && day.restaurant) {
    activities.push({
      time: '20:00',
      name: day.restaurant,
      description: 'Dîner cohérent avec le quartier de la journée et le budget choisi.',
      type: 'repas',
      estimated_cost: '20€ - 35€',
      lat: (day.lat || 48.8566) + 0.014,
      lng: (day.lng || 2.3522) + 0.014,
    });
  }

  return {
    ...day,
    activities: activities.sort((a, b) =>
      String(a.time || '').localeCompare(String(b.time || ''))
    ),
  };
}

function adjustDay(day, actionId, index) {
  let updated = {
    ...day,
    activities: [...(day.activities || [])],
  };

  switch (actionId) {
    case 'cheaper':
      updated = {
        ...updated,
        description: `${updated.description || ''} Version optimisée pour réduire les coûts.`,
        activities: updated.activities.map(makeCheaperActivity),
        restaurant: 'Adresse locale accessible, adaptée au budget',
      };
      break;

    case 'relaxed': {
      const meals = updated.activities.filter((a) => a.type === 'repas');
      const nonMeals = updated.activities.filter((a) => a.type !== 'repas').slice(0, 2);

      updated = {
        ...updated,
        title: `${updated.title || `Jour ${index + 1}`} — rythme plus doux`,
        description: 'Journée allégée avec moins d’activités, plus de pauses et moins de pression.',
        activities: [...nonMeals, ...meals.slice(0, 2)].sort((a, b) =>
          String(a.time || '').localeCompare(String(b.time || ''))
        ),
      };
      break;
    }

    case 'mustSee':
      updated = {
        ...updated,
        description: 'Journée recentrée sur les incontournables et les lieux emblématiques.',
        activities: updated.activities.map((activity, activityIndex) =>
          activityIndex === 0
            ? {
                ...activity,
                name: activity.name?.includes('Incontournable')
                  ? activity.name
                  : `Incontournable — ${activity.name}`,
                description: 'Lieu majeur à privilégier pour une première découverte de la destination.',
              }
            : activity
        ),
      };
      break;

    case 'food':
      updated = {
        ...updated,
        description: 'Journée enrichie avec plus d’adresses locales, marchés et spécialités.',
        activities: [
          ...updated.activities,
          {
            time: '16:30',
            name: 'Pause gourmande locale',
            description: 'Découverte d’une spécialité locale, d’un marché ou d’un café typique.',
            type: 'repas',
            estimated_cost: '8€ - 18€',
            lat: (updated.lat || 48.8566) + 0.02,
            lng: (updated.lng || 2.3522) + 0.02,
          },
        ],
      };
      break;

    case 'rainy':
      updated = {
        ...updated,
        description: 'Journée adaptée avec davantage d’activités couvertes en cas de pluie.',
        activities: updated.activities.map((activity) => {
          const outdoorText = `${activity.name || ''} ${activity.description || ''}`.toLowerCase();
          const isOutdoor =
            outdoorText.includes('balade') ||
            outdoorText.includes('parc') ||
            outdoorText.includes('plage') ||
            outdoorText.includes('point de vue') ||
            outdoorText.includes('extérieur');

          if (!isOutdoor) return activity;

          return {
            ...activity,
            name: `Alternative couverte — ${activity.name}`,
            description: 'Remplacé par une option intérieure : musée, café, marché couvert ou visite abritée.',
            type: 'visite',
          };
        }),
      };
      break;

    case 'premium':
      updated = {
        ...updated,
        description: 'Version plus confortable, avec quelques expériences plus qualitatives.',
        activities: updated.activities.map((activity, activityIndex) =>
          activityIndex === 1 || activityIndex === 3
            ? {
                ...activity,
                description: `${activity.description || ''} Option améliorée, plus confortable mais toujours cohérente avec le budget.`,
                estimated_cost: activity.type === 'repas' ? '35€ - 60€' : '20€ - 45€',
              }
            : activity
        ),
      };
      break;

    case 'instagram':
      updated = {
        ...updated,
        description: 'Journée enrichie avec un spot photogénique et une ambiance plus visuelle.',
        activities: [
          ...updated.activities,
          {
            time: '18:30',
            name: 'Spot photo au meilleur moment de lumière',
            description: 'Point de vue, rue emblématique ou lieu parfait pour les photos de fin de journée.',
            type: 'photo',
            estimated_cost: '0€',
            lat: (updated.lat || 48.8566) + 0.024,
            lng: (updated.lng || 2.3522) + 0.024,
          },
        ],
      };
      break;

    case 'nature':
      updated = {
        ...updated,
        description: 'Journée avec davantage de respiration, de parcs, de vues ou de balades.',
        activities: [
          ...updated.activities,
          {
            time: '17:00',
            name: 'Pause nature ou point de vue',
            description: 'Moment plus calme dans un parc, un jardin, un belvédère ou une zone agréable.',
            type: 'nature',
            estimated_cost: '0€',
            lat: (updated.lat || 48.8566) + 0.028,
            lng: (updated.lng || 2.3522) + 0.028,
          },
        ],
      };
      break;

    case 'lessTransport':
      updated = {
        ...updated,
        description: 'Journée réorganisée pour limiter les déplacements et regrouper les activités par zone.',
        transport_to_next: updated.transport_to_next
          ? {
              ...updated.transport_to_next,
              options: (updated.transport_to_next.options || []).map((option) => ({
                ...option,
                description: `${option.description || ''} Option choisie pour limiter les détours inutiles.`,
              })),
            }
          : undefined,
      };
      break;

    default:
      break;
  }

  return ensureMeal(updated);
}

function BudgetCard({ trip }) {
  const budget = calculateTripBudget(trip);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/60 rounded-2xl p-5 mb-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-accent" />
        </div>

        <div>
          <p className="text-xs text-muted-foreground font-medium">
            Budget recalculé
          </p>
          <p className="font-heading font-bold text-xl text-accent">
            {budget.total}€ estimés
            {trip.currency && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({trip.currency})
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Environ {budget.perPerson}€ / personne
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="rounded-xl bg-secondary/50 p-4">
          <p className="font-semibold mb-2 text-foreground">
            Inclus dans l’estimation
          </p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Activités visibles : {budget.activitiesTotal}€</li>
            <li>
              • Hôtels estimés : {budget.hotelTotal}€
              {budget.nights > 0 && (
                <span>
                  {' '}
                  ({budget.nights} nuit{budget.nights > 1 ? 's' : ''})
                </span>
              )}
            </li>
            <li>• Repas chiffrés dans l’itinéraire</li>
          </ul>
        </div>

        <div className="rounded-xl bg-secondary/50 p-4">
          <p className="font-semibold mb-2 text-foreground">
            Non inclus
          </p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Vols internationaux</li>
            <li>• Dépenses personnelles</li>
            <li>• Activités indiquées “selon tarif”</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Estimation calculée pour {budget.travelers} voyageur
        {budget.travelers > 1 ? 's' : ''}. Les hôtels sont estimés selon le
        niveau de budget, le nombre de nuits et environ {budget.hotel.rooms} chambre
        {budget.hotel.rooms > 1 ? 's' : ''}. Les prix réels restent à vérifier avant réservation.
      </p>
    </motion.div>
  );
}

function getActivityHour(activity) {
  const match = String(activity?.time || '').match(/(\d{1,2})/);
  if (!match) return null;

  const hour = Number(match[1]);
  return Number.isNaN(hour) ? null : hour;
}

function getActivityPeriod(activity) {
  const hour = getActivityHour(activity);
  const text = `${activity?.time || ''} ${activity?.name || ''} ${activity?.type || ''}`.toLowerCase();

  if (text.includes('dîner') || text.includes('soir')) return 'soir';
  if (text.includes('déjeuner') || text.includes('midi')) return 'midi';

  if (hour === null) return 'apresMidi';
  if (hour < 12) return 'matin';
  if (hour < 14) return 'midi';
  if (hour < 18) return 'apresMidi';
  return 'soir';
}

const PERIODS = [
  { id: 'matin', label: 'Matin', emoji: '🌅' },
  { id: 'midi', label: 'Midi', emoji: '🍽️' },
  { id: 'apresMidi', label: 'Après-midi', emoji: '☀️' },
  { id: 'soir', label: 'Soir', emoji: '🌙' },
];

function groupActivitiesByPeriod(activities = []) {
  return PERIODS.map((period) => ({
    ...period,
    activities: activities.filter((activity) => getActivityPeriod(activity) === period.id),
  })).filter((period) => period.activities.length > 0);
}

function getMainActivity(day) {
  const activities = shouldHideDinner(day)
    ? (day.activities || []).filter((activity) => !isDinnerActivity(activity))
    : day.activities || [];
  return (
    activities.find((activity) => activity.type !== 'repas' && activity.type !== 'transport') ||
    activities[0] ||
    null
  );
}

function shouldHideDinner(day) {
  return Boolean(day?.hide_dinner || day?.is_departure_day);
}

function getDinnerActivity(day) {
  if (shouldHideDinner(day)) return null;
  return (day.activities || []).find(isDinnerActivity) || null;
}

function getTransportSummary(day) {
  const transport = day.transport_to_next;
  const option = transport?.options?.[0];

  if (!transport?.destination_city && !option) return null;

  return {
    destination: transport.destination_city,
    mode: option?.mode || 'Transport recommandé',
    duration: option?.duration,
    cost: option?.estimated_cost,
    description: option?.description,
  };
}

function getDepartureActivity(day) {
  if (!day?.is_departure_day) return null;

  return (day.activities || []).find((activity) => {
    const name = String(activity?.name || '').toLowerCase();
    return name.includes('départ') || name.includes('depart');
  }) || null;
}

function getDepartureSummary(day, trip) {
  if (!day?.is_departure_day) return null;

  const departureActivity = getDepartureActivity(day);
  const time = departureActivity?.time || trip?.departure_time || trip?.departureTime || '';

  return {
    time,
    label: time ? `Départ à ${time}` : 'Départ',
  };
}

function DayAccordion({ day, index, isOpen, onToggle, startDate, trip }) {
  const activities = day.activities || [];
  const visibleActivities = shouldHideDinner(day)
    ? activities.filter((activity) => !isDinnerActivity(activity))
    : activities;
  const activityCount = visibleActivities.length;
  const dayBudget = estimateDayBudget(day, index, trip);
  const dayBudgetDetails = calculateDayBudget(day, index, trip);
  const date = formatDate(addDays(startDate, index));
  const groupedActivities = groupActivitiesByPeriod(visibleActivities);
  const mainActivity = getMainActivity({ ...day, activities: visibleActivities });
  const dinnerActivity = getDinnerActivity({ ...day, activities: visibleActivities });
  const transportSummary = getTransportSummary(day);
  const departureSummary = getDepartureSummary(day, trip);
  const departureActivity = getDepartureActivity(day);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3.5 sm:p-5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                Jour {day.day || index + 1}
              </span>

              {date && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CalendarDays className="w-3 h-3" />
                  {date}
                </span>
              )}

              {dayBudget && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                  💰 ~{dayBudget}€
                </span>
              )}
            </div>

            <h3 className="font-heading font-bold text-base sm:text-lg leading-snug line-clamp-1">
              {day.title || `Découverte de ${day.city || 'la destination'}`}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5">
                <MapPin className="w-3 h-3" />
                {day.city || 'Ville'}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5">
                <Sparkles className="w-3 h-3" />
                {activityCount} activité{activityCount > 1 ? 's' : ''}
              </span>

              {dayBudgetDetails.hasHotelNight ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5">
                  <Bed className="w-3 h-3" />
                  Nuit
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5">
                  <Bed className="w-3 h-3" />
                  Dernier jour
                </span>
              )}
            </div>

            {(mainActivity || dinnerActivity || transportSummary) && (
              <div className="mt-2 space-y-1 text-xs text-foreground">
                {mainActivity && (
                  <p className="line-clamp-1">
                    {getActivityIcon(mainActivity.type)} {mainActivity.name}
                  </p>
                )}

                {departureSummary && (
                  <p className="line-clamp-1 text-muted-foreground">
                    🚆 {departureSummary.label}
                  </p>
                )}

                {!shouldHideDinner(day) && (dinnerActivity || day.restaurant) && (
                  <p className="line-clamp-1 text-muted-foreground">
                    🍽️ {dinnerActivity?.name || day.restaurant}
                  </p>
                )}

                {transportSummary && (
                  <p className="line-clamp-1 text-muted-foreground">
                    {getTransportEmoji(transportSummary.mode)} Vers {transportSummary.destination || 'la prochaine étape'}
                    {transportSummary.duration ? ` • ${transportSummary.duration}` : ''}
                  </p>
                )}
              </div>
            )}
          </div>

          <ChevronDown
            className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform mt-1 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-border/60"
          >
            <div className="p-3.5 sm:p-5 space-y-4">
              <div className="space-y-3">
                {groupedActivities.map((period) => (
                  <div key={period.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{period.emoji}</span>
                      <p className="font-heading font-bold text-sm">
                        {period.label}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      {period.activities.map((activity, activityIndex) => (
                        <div
                          key={`${period.id}-${activity.time}-${activity.name}-${activityIndex}`}
                          className={`flex gap-2.5 rounded-xl p-2.5 sm:p-3 border ${
                            isDinnerActivity(activity)
                              ? 'bg-accent/10 border-accent/20'
                              : 'bg-secondary/40 border-transparent'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-background border border-border/60 flex items-center justify-center text-sm shrink-0">
                            {getActivityIcon(activity.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              {activity.time && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                                  <Clock className="w-3 h-3" />
                                  {activity.time}
                                </span>
                              )}

                              {activity.estimated_cost && (
                                <span className="text-[11px] text-muted-foreground">
                                  {activity.estimated_cost}
                                </span>
                              )}
                            </div>

                            <p className="font-semibold text-sm leading-snug line-clamp-2">
                              {activity.name}
                            </p>

                            {activity.description && (
                              <p className="hidden sm:block text-sm text-muted-foreground mt-1 line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {departureSummary && !departureActivity && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <p className="font-semibold text-sm">{departureSummary.label}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Dernier jour : aucun dîner n’est ajouté après le départ.
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-2.5">
                {dayBudgetDetails.hasHotelNight ? (
                  <div className="rounded-xl border border-border/60 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Bed className="w-4 h-4 text-primary" />
                      <p className="font-semibold text-sm">Nuitée</p>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {day.hotel || `Nuit à ${day.city || 'proximité de la zone du jour'}`}
                    </p>

                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      ~{dayBudgetDetails.hotelTotal}€ estimés
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border/60 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Bed className="w-4 h-4 text-primary" />
                      <p className="font-semibold text-sm">Dernier jour</p>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Aucune nuit d’hôtel ajoutée.
                    </p>
                  </div>
                )}

                {transportSummary && (
                  <div className="rounded-xl border border-border/60 p-3">
                    <p className="font-semibold text-sm mb-1.5">
                      Transport suivant
                    </p>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {getTransportEmoji(transportSummary.mode)} Vers {transportSummary.destination || 'la ville suivante'}
                      {transportSummary.duration ? ` • ${transportSummary.duration}` : ''}
                      {transportSummary.cost ? ` • ${transportSummary.cost}` : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TripDetail() {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dayRefs = useRef([]);
  const [adjusting, setAdjusting] = useState(null);
  const [adjustMessage, setAdjustMessage] = useState('');
  const [openDays, setOpenDays] = useState({});

  const scrollToDay = (index) => {
    dayRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpenDays({ [index]: true });
  };

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.list();
      return trips.find((t) => t.id === tripId);
    },
    enabled: !!tripId,
  });

  const safeTrip = useMemo(() => {
    if (!trip) return null;

    const itinerary = (trip.itinerary || []).map((day, index) =>
      ensureMeal(ensureDayHasActivities(day, index, trip))
    );

    const normalizedTrip = {
      ...trip,
      itinerary,
      tips: uniqueList(trip.tips),
      must_book: uniqueList(trip.must_book),
      weather_alternative: uniqueList(trip.weather_alternative),
      applied_adjustments: Array.isArray(trip.applied_adjustments)
        ? trip.applied_adjustments
        : [],
    };

    const calculatedBudget = calculateTripBudget(normalizedTrip);

    return {
      ...normalizedTrip,
      estimated_total_cost: `${calculatedBudget.total}€ estimés`,
    };
  }, [trip]);

  const handleDelete = async () => {
    if (!confirm('Supprimer ce voyage définitivement ?')) return;
    await base44.entities.Trip.delete(tripId);
    navigate('/trips');
  };

  const handleAdjust = async (action) => {
    if (!safeTrip) return;

    try {
      setAdjusting(action.id);
      setAdjustMessage('');

      const updatedItinerary = safeTrip.itinerary.map((day, index) =>
        adjustDay(day, action.id, index)
      );

      const updatedTripForBudget = {
        ...safeTrip,
        itinerary: updatedItinerary,
      };

      const calculatedBudget = calculateTripBudget(updatedTripForBudget);

      const nextAppliedAdjustments = uniqueList([
        ...(safeTrip.applied_adjustments || []),
        action.id,
      ]);

      const updatedTrip = {
        itinerary: updatedItinerary,
        estimated_total_cost: `${calculatedBudget.total}€ estimés`,
        applied_adjustments: nextAppliedAdjustments,
        summary:
          action.id === 'cheaper'
            ? `${safeTrip.summary || ''} Version optimisée pour mieux maîtriser le budget.`
            : safeTrip.summary,
      };

      await base44.entities.Trip.update(tripId, updatedTrip);
      await queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      await queryClient.invalidateQueries({ queryKey: ['trips'] });

      setAdjustMessage('Votre voyage a été ajusté.');
      setTimeout(() => setAdjustMessage(''), 2500);
    } catch (error) {
      console.error(error);
      setAdjustMessage('Impossible d’ajuster ce voyage pour le moment.');
    } finally {
      setAdjusting(null);
    }
  };

  const hasMapData = safeTrip?.itinerary?.some(
    (d) => (d.lat && d.lng) || d.activities?.some((a) => a.lat && a.lng)
  );

  const visibleAdjustActions = ADJUST_ACTIONS.filter(
    (action) => !(safeTrip?.applied_adjustments || []).includes(action.id)
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement de votre voyage…</p>
      </div>
    );
  }

  if (!safeTrip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🗺️</p>
        <p className="text-muted-foreground font-medium">Voyage non trouvé.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/trips')}>
          Retour à mes voyages
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/trips')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </Button>
      </div>

      <TripSummaryHeader trip={safeTrip} />

      <TripInsights trip={safeTrip} />

      <BudgetCard trip={safeTrip} />

      {safeTrip.must_book?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookmarkCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-heading font-bold text-amber-900 dark:text-amber-200">
              À réserver en priorité
            </h3>
          </div>

          <ul className="space-y-1.5">
            {safeTrip.must_book.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-800 dark:text-amber-300">
                <span className="shrink-0 font-bold">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🗺️</span>
          <h2 className="font-heading text-2xl font-bold">Parcours du voyage</h2>
        </div>

        {hasMapData ? (
          <ItineraryMap
            itinerary={safeTrip.itinerary}
            filterDayIndex={null}
            height="380px"
            showDayFilter={true}
          />
        ) : (
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-center">
            <p className="text-2xl mb-2">📍</p>
            <p className="text-sm text-muted-foreground">
              Les coordonnées GPS ne sont pas disponibles pour ce voyage.
            </p>
          </div>
        )}
      </div>

      {safeTrip.itinerary?.length > 0 && (
        <TripRoadmap trip={safeTrip} onDayClick={scrollToDay} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Ajuster ce voyage en 1 clic
        </p>

        {visibleAdjustActions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {visibleAdjustActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAdjust(action)}
                disabled={!!adjusting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adjusting === action.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    En cours…
                  </>
                ) : (
                  action.label
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground rounded-xl border border-border/60 bg-secondary/30 px-4 py-3">
            Tous les ajustements disponibles ont déjà été appliqués à ce voyage.
          </p>
        )}

        {adjustMessage && (
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-full px-3 py-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {adjustMessage}
          </div>
        )}
      </motion.div>

      <div className="space-y-4 mb-8">
        <h2 className="font-heading text-2xl font-bold">Itinéraire jour par jour</h2>

        {safeTrip.itinerary?.map((day, index) => (
          <div key={`${day.day}-${index}`} ref={(el) => (dayRefs.current[index] = el)}>
            <DayAccordion
              day={day}
              index={index}
              trip={safeTrip}
              startDate={safeTrip.start_date}
              isOpen={!!openDays[index]}
              onToggle={() =>
                setOpenDays((prev) => (prev[index] ? {} : { [index]: true }))
              }
            />
          </div>
        ))}
      </div>

      {safeTrip.weather_alternative?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <CloudRain className="w-5 h-5 text-blue-600" />
            <h3 className="font-heading font-bold text-blue-900 dark:text-blue-200">
              Si la météo est mauvaise
            </h3>
          </div>

          <ul className="space-y-1.5">
            {safeTrip.weather_alternative.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-blue-800 dark:text-blue-300">
                <span>☁️</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <TipsList tips={safeTrip.tips} />
    </div>
  );
}