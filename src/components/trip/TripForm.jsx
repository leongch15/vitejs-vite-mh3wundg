import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Loader2,
  AlertCircle,
  Footprints,
  Clock,
  Ban,
  SlidersHorizontal,
} from 'lucide-react';
import InterestTag from './InterestTag';
import TravelStylePicker from './TravelStylePicker';

const INTERESTS = [
  { id: 'culture', label: 'Culture', icon: '🏛️' },
  { id: 'gastronomie', label: 'Gastronomie', icon: '🍽️' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'plage', label: 'Plage', icon: '🏖️' },
  { id: 'aventure', label: 'Aventure', icon: '🧗' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'histoire', label: 'Histoire', icon: '📜' },
  { id: 'vie_nocturne', label: 'Vie nocturne', icon: '🌙' },
  { id: 'bien_etre', label: 'Bien-être', icon: '🧘' },
  { id: 'photographie', label: 'Photo', icon: '📸' },
  { id: 'famille', label: 'Famille', icon: '👨‍👩‍👧‍👦' },
  { id: 'romantique', label: 'Romantique', icon: '💕' },
];

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTodayDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return formatDateForInput(today);
}

function parseInputDate(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split('-').map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function addDaysToDate(dateString, daysToAdd = 1) {
  const date = parseInputDate(dateString);

  if (!date) return '';

  date.setDate(date.getDate() + daysToAdd);

  return formatDateForInput(date);
}

function isBefore(dateA, dateB) {
  const a = parseInputDate(dateA);
  const b = parseInputDate(dateB);

  if (!a || !b) return false;

  return a < b;
}

function isSameOrBefore(dateA, dateB) {
  const a = parseInputDate(dateA);
  const b = parseInputDate(dateB);

  if (!a || !b) return false;

  return a <= b;
}

function calculateTripDays(startDate, endDate) {
  const start = parseInputDate(startDate);
  const end = parseInputDate(endDate);

  if (!start || !end) return null;

  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));

  if (diff < 1) return null;

  return diff + 1;
}

export default function TripForm({ onGenerate, isGenerating }) {
  const [form, setForm] = useState({
    destination: '',
    start_date: '',
    end_date: '',
    budget: 'modere',
    travelers: 2,
    interests: [],
    travel_style: 'essentiels',

    // Options avancées
    organization_level: 'planning',
    walking_level: 'moyen',
    arrival_city: '',
    return_city: '',
    arrival_time: '',
    departure_time: '',
    avoid_items: '',
  });

  const [dateError, setDateError] = useState('');

  const todayDate = useMemo(() => getTodayDate(), []);

  const tripDays = useMemo(() => {
    return calculateTripDays(form.start_date, form.end_date);
  }, [form.start_date, form.end_date]);

  const minReturnDate = form.start_date
    ? addDaysToDate(form.start_date, 1)
    : addDaysToDate(todayDate, 1);

  const toggleInterest = (id) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((interestId) => interestId !== id)
        : [...prev.interests, id],
    }));
  };

  const handleStartDateChange = (newStartDate) => {
    setDateError('');

    let safeStartDate = newStartDate;

    if (isBefore(newStartDate, todayDate)) {
      safeStartDate = todayDate;
      setDateError('La date de départ ne peut pas être dans le passé.');
    }

    setForm((prev) => {
      const nextReturnDate =
        !prev.end_date || isSameOrBefore(prev.end_date, safeStartDate)
          ? addDaysToDate(safeStartDate, 1)
          : prev.end_date;

      return {
        ...prev,
        start_date: safeStartDate,
        end_date: nextReturnDate,
      };
    });
  };

  const handleEndDateChange = (newEndDate) => {
    if (!form.start_date) {
      setDateError('Choisissez d’abord une date de départ.');
      return;
    }

    if (isSameOrBefore(newEndDate, form.start_date)) {
      setDateError('La date de retour doit être après la date de départ.');

      setForm((prev) => ({
        ...prev,
        end_date: addDaysToDate(prev.start_date, 1),
      }));

      return;
    }

    setDateError('');

    setForm((prev) => ({
      ...prev,
      end_date: newEndDate,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.destination.trim()) {
      return;
    }

    if (!form.start_date || !form.end_date) {
      setDateError('Choisissez une date de départ et une date de retour.');
      return;
    }

    if (isBefore(form.start_date, todayDate)) {
      setDateError('La date de départ ne peut pas être dans le passé.');
      return;
    }

    if (isSameOrBefore(form.end_date, form.start_date)) {
      setDateError('La date de retour doit être après la date de départ.');
      return;
    }

    setDateError('');

    onGenerate({
      ...form,
      destination: form.destination.trim(),
      travelers: Number(form.travelers || 1),
      arrival_city: form.arrival_city.trim(),
      return_city: form.return_city.trim(),
      avoid_items: form.avoid_items.trim(),
    });
  };

  const isSubmitDisabled =
    isGenerating ||
    !form.destination.trim() ||
    !form.start_date ||
    !form.end_date ||
    !!dateError;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-8">
      {/* Destination */}
      <div className="space-y-2">
        <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent" />
          Destination
        </Label>

        <Input
          placeholder="Paris, Danemark, Italie..."
          value={form.destination}
          onChange={(event) =>
            setForm({ ...form, destination: event.target.value })
          }
          className="h-11 sm:h-12 bg-secondary/50 border-border/60 font-body text-sm sm:text-base px-3 min-w-0"
          required
        />

        <p className="text-xs text-muted-foreground">
          Entrez une ville pour un city-trip ou un pays pour un itinéraire multi-étapes.
        </p>
      </div>

      {/* Dates */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              Départ
            </Label>

            <Input
              type="date"
              min={todayDate}
              value={form.start_date}
              onChange={(event) => handleStartDateChange(event.target.value)}
              className="h-11 sm:h-12 bg-secondary/50 border-border/60 font-body text-sm px-3 min-w-0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              Retour
            </Label>

            <Input
              type="date"
              min={minReturnDate}
              value={form.end_date}
              onChange={(event) => handleEndDateChange(event.target.value)}
              className="h-11 sm:h-12 bg-secondary/50 border-border/60 font-body text-sm px-3 min-w-0"
              required
            />
          </div>
        </div>

        {tripDays && (
          <p className="text-xs text-muted-foreground">
            Durée estimée :{' '}
            <span className="font-medium text-foreground">
              {tripDays} jours
            </span>
          </p>
        )}

        {dateError && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {dateError}
          </div>
        )}
      </div>

      {/* Budget & Travelers */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4 text-accent" />
            Budget
          </Label>

          <Select
            value={form.budget}
            onValueChange={(value) => setForm({ ...form, budget: value })}
          >
            <SelectTrigger className="h-11 sm:h-12 bg-secondary/50 border-border/60 font-body text-sm">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="economique">💰 Économique</SelectItem>
              <SelectItem value="modere">💰💰 Modéré</SelectItem>
              <SelectItem value="confort">💰💰💰 Confort</SelectItem>
              <SelectItem value="luxe">💰💰💰💰 Luxe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            Voyageurs
          </Label>

          <Input
            type="number"
            min={1}
            max={20}
            value={form.travelers}
            onChange={(event) =>
              setForm({
                ...form,
                travelers: parseInt(event.target.value, 10) || 1,
              })
            }
            className="h-11 sm:h-12 bg-secondary/50 border-border/60 font-body text-sm px-3 min-w-0"
          />
        </div>
      </div>

      {/* Travel Style */}
      <div className="space-y-3">
        <Label className="text-xs sm:text-sm font-medium">
          Style de voyage
        </Label>

        <TravelStylePicker
          value={form.travel_style}
          onChange={(value) => setForm({ ...form, travel_style: value })}
        />
      </div>

      {/* Interests */}
      <div className="space-y-3">
        <Label className="text-xs sm:text-sm font-medium">
          Centres d’intérêt
        </Label>

        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
          {INTERESTS.map((interest) => (
            <InterestTag
              key={interest.id}
              label={interest.label}
              icon={interest.icon}
              selected={form.interests.includes(interest.id)}
              onClick={() => toggleInterest(interest.id)}
            />
          ))}
        </div>
      </div>

      {/* Advanced options */}
      <details className="group rounded-2xl border border-border/60 bg-secondary/20 p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            <span className="font-medium text-sm">Options avancées</span>
          </div>

          <span className="text-xs text-muted-foreground group-open:hidden">
            Affiner le voyage
          </span>
          <span className="text-xs text-muted-foreground hidden group-open:inline">
            Masquer
          </span>
        </summary>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Niveau d’organisation souhaité
            </Label>

            <Select
              value={form.organization_level}
              onValueChange={(value) =>
                setForm({ ...form, organization_level: value })
              }
            >
              <SelectTrigger className="h-11 sm:h-12 bg-background border-border/60 font-body text-sm">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="idees">Juste les grandes idées</SelectItem>
                <SelectItem value="planning">
                  Un planning prêt à suivre
                </SelectItem>
                <SelectItem value="complet">
                  Tout organiser à ma place
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <Footprints className="w-4 h-4 text-accent" />
              Marche acceptée par jour
            </Label>

            <Select
              value={form.walking_level}
              onValueChange={(value) =>
                setForm({ ...form, walking_level: value })
              }
            >
              <SelectTrigger className="h-11 sm:h-12 bg-background border-border/60 font-body text-sm">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="faible">Peu — moins de 5 km</SelectItem>
                <SelectItem value="moyen">Moyen — 5 à 10 km</SelectItem>
                <SelectItem value="eleve">Beaucoup — 10 km et plus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                Ville d’arrivée
              </Label>

              <Input
                placeholder="Ex : Copenhague"
                value={form.arrival_city}
                onChange={(event) =>
                  setForm({ ...form, arrival_city: event.target.value })
                }
                className="h-11 sm:h-12 bg-background border-border/60 font-body text-sm px-3 min-w-0"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                Ville de retour
              </Label>

              <Input
                placeholder="Ex : Copenhague"
                value={form.return_city}
                onChange={(event) =>
                  setForm({ ...form, return_city: event.target.value })
                }
                className="h-11 sm:h-12 bg-background border-border/60 font-body text-sm px-3 min-w-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                Heure d’arrivée
              </Label>

              <Input
                type="time"
                value={form.arrival_time}
                onChange={(event) =>
                  setForm({ ...form, arrival_time: event.target.value })
                }
                className="h-11 sm:h-12 bg-background border-border/60 font-body text-sm px-3 min-w-0"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                Heure de départ
              </Label>

              <Input
                type="time"
                value={form.departure_time}
                onChange={(event) =>
                  setForm({ ...form, departure_time: event.target.value })
                }
                className="h-11 sm:h-12 bg-background border-border/60 font-body text-sm px-3 min-w-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <Ban className="w-4 h-4 text-accent" />
              À éviter pendant le voyage
            </Label>

            <textarea
              placeholder="Ex : restaurants chers, musées, longues marches, voiture..."
              value={form.avoid_items}
              onChange={(event) =>
                setForm({ ...form, avoid_items: event.target.value })
              }
              className="min-h-24 w-full rounded-xl border border-border/60 bg-background px-3 py-3 text-sm font-body outline-none focus:ring-2 focus:ring-primary/30"
            />

            <p className="text-xs text-muted-foreground">
              Capi utilisera ces contraintes pour éviter les propositions incohérentes.
            </p>
          </div>
        </div>
      </details>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitDisabled}
        className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold font-body bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Capi prépare votre voyage...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Créer mon voyage
          </>
        )}
      </Button>
    </form>
  );
}