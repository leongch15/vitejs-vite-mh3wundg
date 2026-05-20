import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, Coffee, Sun, Sunset } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const STYLE_LABELS = {
  detente: { label: 'Détente', icon: '🧘' },
  essentiels: { label: 'Incontournables', icon: '⭐' },
  immersion_totale: { label: 'Immersion totale', icon: '🔥' },
  insolite: { label: 'Insolite', icon: '🔮' },
  aventure: { label: 'Aventure', icon: '🏔️' },
  gastronomique: { label: 'Gastronomique', icon: '🍽️' },
};

const DAY_COLORS = [
  'from-blue-500 to-blue-600',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-green-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-teal-600',
  'from-red-500 to-rose-500',
];

function estimateDayCost(day) {
  if (!day.activities) return null;
  const total = day.activities.reduce((sum, a) => {
    const match = a.estimated_cost?.match(/[\d,. ]+/);
    if (match) return sum + parseFloat(match[0].replace(',', '.').replace(' ', '')) || 0;
    return sum;
  }, 0);
  return total > 0 ? Math.round(total) : null;
}

export default function TripRoadmap({ trip, onDayClick }) {
  const startDate = trip.start_date ? parseISO(trip.start_date) : null;
  const symbol = trip.currency_symbol || '€';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">🗺️</span>
        <h2 className="font-heading text-2xl font-bold">Vue d'ensemble du séjour</h2>
      </div>

      {/* Horizontal scrollable roadmap */}
      <div className="overflow-x-auto pb-3 -mx-1 px-1">
        <div className="flex gap-3 min-w-max sm:min-w-0 sm:flex-wrap">
          {trip.itinerary?.map((day, index) => {
            const date = startDate ? addDays(startDate, day.day - 1) : null;
            const cost = estimateDayCost(day);
            const colorClass = DAY_COLORS[index % DAY_COLORS.length];
            const actCount = day.activities?.length || 0;

            return (
              <motion.button
                key={day.day}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => onDayClick(index)}
                className="group relative flex flex-col text-left rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-44 sm:w-40 flex-shrink-0 sm:flex-shrink border border-border/40"
              >
                {/* Color header */}
                <div className={`bg-gradient-to-br ${colorClass} px-4 pt-4 pb-3 text-white`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Jour {day.day}</span>
                    {date && (
                      <span className="text-xs opacity-75">
                        {format(date, 'd MMM', { locale: fr })}
                      </span>
                    )}
                  </div>
                  {day.city && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 opacity-80 shrink-0" />
                      <span className="text-sm font-semibold truncate">{day.city}</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="bg-card px-4 py-3 flex-1 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">
                    {day.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                    {day.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">
                      {actCount} activité{actCount > 1 ? 's' : ''}
                    </span>
                    {cost ? (
                      <span className="text-xs font-semibold text-accent">~{cost}{symbol}</span>
                    ) : null}
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground text-xs">
                  ↓ voir
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center sm:text-left">
        Cliquez sur un jour pour accéder directement à son détail
      </p>
    </motion.div>
  );
}