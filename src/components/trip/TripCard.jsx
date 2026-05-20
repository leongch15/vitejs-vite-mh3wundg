import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  ArrowRight,
  MapPin,
  Route,
  Wallet,
  SlidersHorizontal,
  Database,
  Trash2,
  Copy,
  Pencil,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { getDestinationImage } from '@/lib/destinationImages';
import { formatTripBudgetLabel } from '@/services/tripBudget.local';

const SHOW_DEMO_BADGE = true;

function formatDate(date) {
  if (!date) return '';
  try {
    return format(new Date(date), 'd MMM', { locale: fr });
  } catch {
    return '';
  }
}

function calculateDuration(startDate, endDate, itinerary) {
  if (itinerary?.length) return itinerary.length;

  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return diff > 0 ? diff : null;
}

function getMainRoute(trip) {
  const cities = (trip.itinerary || [])
    .map((day) => day.city)
    .filter(Boolean);

  if (cities.length === 0) {
    return trip.destination || 'Parcours à préciser';
  }

  const uniqueCities = [];

  cities.forEach((city) => {
    if (uniqueCities[uniqueCities.length - 1] !== city) {
      uniqueCities.push(city);
    }
  });

  if (uniqueCities.length === 1) {
    return uniqueCities[0];
  }

  if (uniqueCities.length <= 3) {
    return uniqueCities.join(' → ');
  }

  return `${uniqueCities[0]} → ${uniqueCities[1]} → ${uniqueCities[2]}…`;
}

function getBudgetLabel(trip) {
  return formatTripBudgetLabel(trip);
}

function getBudgetDisplayName(budget = '') {
  const value = budget.toLowerCase();

  if (value.includes('economique') || value.includes('économique')) return 'Économique';
  if (value.includes('modere') || value.includes('modéré')) return 'Modéré';
  if (value.includes('confort')) return 'Confort';
  if (value.includes('luxe')) return 'Luxe';

  return budget;
}

function ActionButton({ icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.();
      }}
      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
        danger
          ? 'border-destructive/20 text-destructive hover:bg-destructive/10'
          : 'border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
      }`}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function TripCard({
  trip,
  index,
  onOpen,
  onDelete,
  onDuplicate,
  onRename,
}) {
  const duration = calculateDuration(trip.start_date, trip.end_date, trip.itinerary);
  const route = getMainRoute(trip);
  const adjustmentsCount = trip.applied_adjustments?.length || 0;
  const budgetName = getBudgetDisplayName(trip.budget);
  const displayTitle = trip.title || trip.destination || 'Voyage sans destination';

  const handleOpen = () => {
    onOpen?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <Card
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter') handleOpen();
        }}
        className="group overflow-hidden border-border/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-card"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={getDestinationImage(trip.destination)}
            alt={trip.destination}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            {SHOW_DEMO_BADGE && (
              <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 text-[11px] gap-1">
                <Database className="w-3 h-3" />
                Démo locale
              </Badge>
            )}

            {budgetName && (
              <Badge className="bg-accent/95 text-accent-foreground border-0 text-[11px]">
                {budgetName}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-heading text-2xl font-bold text-white leading-tight line-clamp-2">
              {displayTitle}
            </h3>

            <div className="flex items-center gap-1.5 text-white/85 text-xs mt-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{route}</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Dates
              </div>
              <p className="text-sm font-semibold">
                {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
              </p>
            </div>

            <div className="rounded-xl bg-secondary/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Route className="w-3.5 h-3.5" />
                Durée
              </div>
              <p className="text-sm font-semibold">
                {duration ? `${duration} jour${duration > 1 ? 's' : ''}` : 'À préciser'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/60 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Wallet className="w-3.5 h-3.5" />
                Budget
              </div>
              <p className="text-sm font-semibold truncate">
                {getBudgetLabel(trip)}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Ajustements
              </div>
              <p className="text-sm font-semibold">
                {adjustmentsCount > 0
                  ? `${adjustmentsCount} appliqué${adjustmentsCount > 1 ? 's' : ''}`
                  : 'Aucun'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60">
              <ActionButton
                label="Dupliquer"
                icon={<Copy className="w-3.5 h-3.5" />}
                onClick={onDuplicate}
              />

              <ActionButton
                label="Renommer"
                icon={<Pencil className="w-3.5 h-3.5" />}
                onClick={onRename}
              />

              <ActionButton
                label="Supprimer"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={onDelete}
                danger
              />
            </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground truncate pr-3">
              {trip.itinerary?.[0]?.title || 'Itinéraire prêt à suivre'}
            </p>

            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}