import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Hotel, UtensilsCrossed, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import TransportCard from './TransportCard';
import ItineraryMap from './ItineraryMap';

const activityTypeIcons = {
  visite: '🏛️',
  repas: '🍽️',
  activite: '🎯',
  transport: '🚗',
  detente: '🧘',
  shopping: '🛍️',
  default: '📍',
};

const PERIOD_ORDER = ['matin', 'midi', 'après-midi', 'apres-midi', 'soir', 'nuit'];

function getPeriod(time) {
  if (!time) return null;
  const t = time.toLowerCase();
  if (t.includes('matin') || t.match(/^0[6-9]:|^1[01]:/)) return 'matin';
  if (t.includes('midi') || t.match(/^1[23]:/)) return 'midi';
  if (t.includes('après') || t.includes('apres') || t.match(/^1[4-7]:/)) return 'après-midi';
  if (t.includes('soir') || t.match(/^1[89]:/) || t.match(/^2[0-3]:/)) return 'soir';
  return null;
}

const PERIOD_LABELS = {
  matin: { label: 'Matin', icon: '🌅' },
  midi: { label: 'Midi', icon: '☀️' },
  'après-midi': { label: 'Après-midi', icon: '🌤️' },
  soir: { label: 'Soir', icon: '🌙' },
};

function groupActivitiesByPeriod(activities) {
  const groups = {};
  const ungrouped = [];
  (activities || []).forEach(a => {
    const period = getPeriod(a.time);
    if (period) {
      if (!groups[period]) groups[period] = [];
      groups[period].push(a);
    } else {
      ungrouped.push(a);
    }
  });
  return { groups, ungrouped };
}

function ActivityItem({ activity }) {
  const icon = activityTypeIcons[activity.type?.toLowerCase()] || activityTypeIcons.default;
  const mapsUrl = activity.lat && activity.lng
    ? `https://www.google.com/maps?q=${activity.lat},${activity.lng}`
    : activity.name
    ? `https://www.google.com/maps/search/${encodeURIComponent(activity.name)}`
    : null;

  return (
    <div className="flex gap-3 group py-2">
      <span className="text-xl shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm leading-snug">{activity.name}</p>
            {activity.description && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{activity.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {activity.time && (
              <Badge variant="outline" className="text-xs font-normal gap-1 whitespace-nowrap">
                <Clock className="w-3 h-3" />
                {activity.time}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {activity.estimated_cost && (
            <span className="text-xs text-accent font-semibold">💰 {activity.estimated_cost}</span>
          )}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Google Maps
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DayCard({ day, index, itinerary }) {
  const [showMap, setShowMap] = useState(false);
  const { groups, ungrouped } = groupActivitiesByPeriod(day.activities);
  const hasPeriodGroups = Object.keys(groups).length > 0;
  const hasDayMap = day.lat && day.lng || day.activities?.some(a => a.lat && a.lng);

  // Build a single-day itinerary slice for the map
  const singleDayItinerary = [day];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.07, 0.5), duration: 0.4 }}
    >
      <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-lg shrink-0">
              {day.day}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                Jour {day.day}
                {day.city && (
                  <span className="flex items-center gap-1 text-accent">
                    <MapPin className="w-3 h-3" />
                    {day.city}
                  </span>
                )}
              </p>
              <h3 className="font-heading text-lg font-semibold leading-tight mt-0.5">{day.title}</h3>
              {day.description && (
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{day.description}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-5">
          {/* Activities — grouped by period if possible */}
          {hasPeriodGroups ? (
            <div className="space-y-4">
              {PERIOD_ORDER.filter(p => groups[p]?.length).map(period => (
                <div key={period}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{PERIOD_LABELS[period]?.icon || '🕐'}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {PERIOD_LABELS[period]?.label || period}
                    </span>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>
                  <div className="space-y-1 pl-1">
                    {groups[period].map((activity, i) => (
                      <ActivityItem key={i} activity={activity} />
                    ))}
                  </div>
                </div>
              ))}
              {ungrouped.length > 0 && (
                <div className="space-y-1">
                  {ungrouped.map((activity, i) => <ActivityItem key={i} activity={activity} />)}
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {day.activities?.map((activity, i) => (
                <ActivityItem key={i} activity={activity} />
              ))}
            </div>
          )}

          {/* Map toggle */}
          {hasDayMap && (
            <div>
              <button
                onClick={() => setShowMap(v => !v)}
                className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showMap ? 'Masquer la carte du jour' : 'Voir la carte du jour'}
              </button>
              {showMap && (
                <div className="mt-3">
                  <ItineraryMap itinerary={singleDayItinerary} filterDayIndex={0} height="220px" />
                </div>
              )}
            </div>
          )}

          {/* Transport */}
          <TransportCard transport={day.transport_to_next} fromCity={day.city} />

          {/* Hotel & Restaurant */}
          {(day.hotel || day.restaurant) && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
              {day.hotel && (
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 font-normal text-xs">
                  <Hotel className="w-3.5 h-3.5" />
                  {day.hotel}
                </Badge>
              )}
              {day.restaurant && (
                <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 font-normal text-xs">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  {day.restaurant}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}