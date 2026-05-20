import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Loader2,
  Compass,
  AlertTriangle,
  Search,
  X,
  ArrowDownWideNarrow,
  SlidersHorizontal,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import TripCard from '@/components/trip/TripCard';
import { motion } from 'framer-motion';

function normalizeText(value = '') {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function normalizeBudget(value = '') {
  const budget = normalizeText(value);

  if (budget.includes('eco')) return 'economique';
  if (budget.includes('modere')) return 'modere';
  if (budget.includes('confort')) return 'confort';
  if (budget.includes('luxe')) return 'luxe';

  return budget;
}

function calculateDuration(trip) {
  if (trip.itinerary?.length) return trip.itinerary.length;

  if (!trip.start_date || !trip.end_date) return null;

  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return diff > 0 ? diff : null;
}

function matchesDurationFilter(trip, durationFilter) {
  if (durationFilter === 'all') return true;

  const duration = calculateDuration(trip);

  if (!duration) return false;

  if (durationFilter === 'short') return duration >= 1 && duration <= 3;
  if (durationFilter === 'medium') return duration >= 4 && duration <= 7;
  if (durationFilter === 'long') return duration >= 8;

  return true;
}

export default function MyTrips() {
  const queryClient = useQueryClient();

  const [destinationFilter, setDestinationFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date', 50),
    initialData: [],
  });

  const refreshTrips = async () => {
    await queryClient.invalidateQueries({ queryKey: ['trips'] });
  };

  const openTrip = (trip) => {
    if (!trip?.id) {
      alert("Ce voyage n'a pas d'identifiant. Il faut recréer un nouveau voyage.");
      return;
    }

    window.location.href = `/trip/${trip.id}`;
  };

  const deleteTrip = async (trip) => {
    if (!trip?.id) return;

    const confirmed = window.confirm(
      `Supprimer définitivement le voyage "${trip.title || trip.destination}" ?`
    );

    if (!confirmed) return;

    await base44.entities.Trip.delete(trip.id);
    await refreshTrips();
  };

  const duplicateTrip = async (trip) => {
    if (!trip) return;

    const { id, created_date, updated_date, ...tripWithoutSystemFields } = trip;

    const duplicatedTrip = {
      ...tripWithoutSystemFields,
      title: `${trip.title || trip.destination || 'Voyage'} — copie`,
      duplicated_from: trip.id || null,
      applied_adjustments: Array.isArray(trip.applied_adjustments)
        ? [...trip.applied_adjustments]
        : [],
    };

    await base44.entities.Trip.create(duplicatedTrip);
    await refreshTrips();
  };

  const renameTrip = async (trip) => {
    if (!trip?.id) return;

    const currentName = trip.title || trip.destination || '';
    const newName = window.prompt('Nouveau nom du voyage :', currentName);

    if (!newName) return;

    const cleanedName = newName.trim();

    if (!cleanedName || cleanedName === currentName) return;

    await base44.entities.Trip.update(trip.id, {
      title: cleanedName,
      updated_date: new Date().toISOString(),
    });

    await refreshTrips();
  };

  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => {
      const dateA = new Date(a.created_date || 0);
      const dateB = new Date(b.created_date || 0);
      return dateB - dateA;
    });
  }, [trips]);

  const filteredTrips = useMemo(() => {
    const search = destinationFilter.trim().toLowerCase();

    return sortedTrips.filter((trip) => {
      const destination = trip.destination?.toLowerCase() || '';
      const title = trip.title?.toLowerCase() || '';
      const cities = (trip.itinerary || [])
        .map((day) => day.city)
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !search ||
        destination.includes(search) ||
        title.includes(search) ||
        cities.includes(search);

      const matchesBudget =
        budgetFilter === 'all' || normalizeBudget(trip.budget) === budgetFilter;

      const matchesDuration = matchesDurationFilter(trip, durationFilter);

      return matchesSearch && matchesBudget && matchesDuration;
    });
  }, [sortedTrips, destinationFilter, budgetFilter, durationFilter]);

  const hasTrips = trips.length > 0;

  const hasActiveFilter =
    destinationFilter.trim().length > 0 ||
    budgetFilter !== 'all' ||
    durationFilter !== 'all';

  const resetFilters = () => {
    setDestinationFilter('');
    setBudgetFilter('all');
    setDurationFilter('all');
  };
  const resetDemo = async () => {
    const confirmed = window.confirm(
      'Supprimer tous les voyages de test ? Cette action est définitive.'
    );
  
    if (!confirmed) return;
  
    await base44.entities.Trip.clearAll();
    resetFilters();
    await refreshTrips();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mes voyages</h1>
          <p className="text-muted-foreground mt-1">
            {trips.length > 0
              ? `${trips.length} voyage${trips.length > 1 ? 's' : ''} généré${
                  trips.length > 1 ? 's' : ''
                }`
              : ''}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
  {trips.length > 0 && (
    <Button
      type="button"
      variant="outline"
      onClick={resetDemo}
      className="gap-2 text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="w-4 h-4" />
      Réinitialiser la démo
    </Button>
  )}

  <Link to="/">
    <Button className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto">
      <Plus className="w-4 h-4" />
      Nouveau voyage
    </Button>
  </Link>
</div>
      </div>

      {hasTrips && (
        <div className="mb-6 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  type="text"
                  value={destinationFilter}
                  onChange={(event) => setDestinationFilter(event.target.value)}
                  placeholder="Rechercher par destination, ville ou nom..."
                  className="w-full h-11 rounded-xl border border-border/60 bg-secondary/40 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                />

                {destinationFilter.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDestinationFilter('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Effacer la recherche"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2">
                  <ArrowDownWideNarrow className="w-3.5 h-3.5" />
                  Plus récents d’abord
                </span>

                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-2">
                  {filteredTrips.length} résultat{filteredTrips.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Budget
                </label>

                <select
                  value={budgetFilter}
                  onChange={(event) => setBudgetFilter(event.target.value)}
                  className="w-full h-10 rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                >
                  <option value="all">Tous les budgets</option>
                  <option value="economique">Économique</option>
                  <option value="modere">Modéré</option>
                  <option value="confort">Confort</option>
                  <option value="luxe">Luxe</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Durée
                </label>

                <select
                  value={durationFilter}
                  onChange={(event) => setDurationFilter(event.target.value)}
                  className="w-full h-10 rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                >
                  <option value="all">Toutes les durées</option>
                  <option value="short">1 à 3 jours</option>
                  <option value="medium">4 à 7 jours</option>
                  <option value="long">8 jours et plus</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  disabled={!hasActiveFilter}
                  className="w-full sm:w-auto h-10 gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : trips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto text-center py-16 sm:py-24"
        >
          <div className="relative mx-auto mb-6 w-24 h-24">
            <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/15 to-accent/15 border border-border/60 flex items-center justify-center shadow-sm">
              <Compass className="w-11 h-11 text-primary" />
            </div>
          </div>

          <p className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-semibold mb-4">
            Prêt à créer ton premier itinéraire
          </p>

          <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
            Aucun voyage pour le moment
          </h3>

          <p className="text-muted-foreground leading-relaxed mb-7 max-w-md mx-auto">
            Crée ton premier itinéraire en quelques secondes.
          </p>

          <Link to="/">
            <Button className="gap-2 h-12 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Créer mon premier voyage
            </Button>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 text-left">
            {[
              {
                title: 'Paris 3 jours',
                text: 'City trip simple pour tester rapidement.',
              },
              {
                title: 'Danemark 8 jours',
                text: 'Voyage multi-villes avec carte et étapes.',
              },
              {
                title: 'Italie économique',
                text: 'Bon test pour les contraintes et le budget.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
              >
                <p className="font-semibold text-sm mb-1">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      ) : filteredTrips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 rounded-3xl border border-border/60 bg-card"
        >
          <p className="text-3xl mb-3">🔎</p>
          <h3 className="font-heading text-xl font-bold mb-2">
            Aucun voyage trouvé
          </h3>
          <p className="text-muted-foreground mb-5">
            Essaie avec une autre recherche ou ajuste les filtres.
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Réinitialiser les filtres
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredTrips.map((trip, index) => {
            if (!trip?.id) {
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
                >
                  <div className="flex items-center gap-2 font-medium mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Voyage sans ID
                  </div>
                  <p>
                    Ce voyage ne peut pas être ouvert. Il faut le supprimer ou recréer un
                    nouveau voyage.
                  </p>
                </div>
              );
            }

            return (
              <TripCard
                key={trip.id}
                trip={trip}
                index={index}
                onOpen={() => openTrip(trip)}
                onDelete={() => deleteTrip(trip)}
                onDuplicate={() => duplicateTrip(trip)}
                onRename={() => renameTrip(trip)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}