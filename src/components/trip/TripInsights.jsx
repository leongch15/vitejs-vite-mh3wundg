import React from 'react';
import {
  Sparkles,
  Heart,
  Footprints,
  Ban,
  SlidersHorizontal,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

const STYLE_LABELS = {
  detente: 'Détente',
  essentiels: 'Incontournables',
  immersion_totale: 'Immersion totale',
  insolite: 'Insolite',
  aventure: 'Aventure & nature',
  gastronomique: 'Gastronomique',
};

const WALKING_LABELS = {
  faible: 'Peu de marche',
  moyen: 'Marche modérée',
  eleve: 'Beaucoup de marche',
  élevé: 'Beaucoup de marche',
};

const ORGANIZATION_LABELS = {
  idees: 'Grandes idées',
  planning: 'Planning prêt à suivre',
  complet: 'Organisation complète',
};

const INTEREST_LABELS = {
  culture: 'Culture',
  gastronomie: 'Gastronomie',
  nature: 'Nature',
  plage: 'Plage',
  aventure: 'Aventure',
  shopping: 'Shopping',
  histoire: 'Histoire',
  vie_nocturne: 'Vie nocturne',
  bien_etre: 'Bien-être',
  photographie: 'Photo',
  famille: 'Famille',
  romantique: 'Romantique',
};

function normalize(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function formatValue(value, dictionary = {}) {
  if (!value) return null;

  const cleaned = String(value).trim();
  if (!cleaned) return null;

  const normalized = normalize(cleaned);

  return (
    dictionary[cleaned] ||
    dictionary[cleaned.toLowerCase()] ||
    dictionary[normalized] ||
    cleaned
  );
}

function formatInterests(interests = []) {
  if (!Array.isArray(interests) || interests.length === 0) return null;

  const labels = interests
    .map((interest) => INTEREST_LABELS[interest] || INTEREST_LABELS[normalize(interest)] || interest)
    .filter(Boolean);

  if (labels.length === 0) return null;

  return labels.join(', ');
}

function cleanOptionalText(value) {
  if (!value) return null;

  const cleaned = String(value).trim();
  if (!cleaned) return null;

  const normalized = normalize(cleaned);

  if (normalized === 'aucun') return null;
  if (normalized === 'non precisee') return null;
  if (normalized === 'non precise') return null;
  if (normalized === 'undefined') return null;
  if (normalized === 'null') return null;

  return cleaned;
}

function formatPartsAsLines(parts = []) {
  if (!parts.length) return null;

  return parts.map((part, index) => (
    <React.Fragment key={part}>
      {part}
      {index < parts.length - 1 && <br />}
    </React.Fragment>
  ));
}

function InsightItem({ icon, label, value, wide = false }) {
  if (!value) return null;

  return (
    <div
      className={`rounded-xl border border-border/60 bg-card p-3 shadow-sm ${
        wide ? 'col-span-2 sm:col-span-1' : ''
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5">
            {label}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TripInsights({ trip }) {
  if (!trip) return null;

  const style = formatValue(trip.travel_style, STYLE_LABELS);
  const interests = formatInterests(trip.interests);
  const walking = formatValue(trip.walking_level, WALKING_LABELS);
  const organization = formatValue(trip.organization_level, ORGANIZATION_LABELS);

  const avoidItems = cleanOptionalText(trip.avoid_items);

  const arrivalCity = cleanOptionalText(trip.arrival_city);
  const returnCity = cleanOptionalText(trip.return_city);
  const arrivalTime = cleanOptionalText(trip.arrival_time);
  const departureTime = cleanOptionalText(trip.departure_time);

  const routeParts = [];
  if (arrivalCity) routeParts.push(`Arrivée : ${arrivalCity}`);
  if (returnCity) routeParts.push(`Retour : ${returnCity}`);

  const timeParts = [];
  if (arrivalTime) timeParts.push(`Arrivée : ${arrivalTime}`);
  if (departureTime) timeParts.push(`Départ : ${departureTime}`);

  const routeInfo = formatPartsAsLines(routeParts);
  const timeInfo = formatPartsAsLines(timeParts);

  const hasAnyInsight = [
    style,
    interests,
    walking,
    organization,
    avoidItems,
    routeInfo,
    timeInfo,
  ].some(Boolean);

  if (!hasAnyInsight) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>

        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold">
            Adapté pour vous
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Capi a pris en compte vos critères.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <InsightItem
          icon={<Sparkles className="w-4 h-4" />}
          label="Style"
          value={style}
        />

        <InsightItem
          icon={<Footprints className="w-4 h-4" />}
          label="Marche"
          value={walking}
        />

        <InsightItem
          icon={<Heart className="w-4 h-4" />}
          label="Intérêts"
          value={interests}
          wide
        />

        <InsightItem
          icon={<SlidersHorizontal className="w-4 h-4" />}
          label="Organisation"
          value={organization}
        />

        <InsightItem
          icon={<Clock className="w-4 h-4" />}
          label="Horaires"
          value={timeInfo}
        />

        <InsightItem
          icon={<MapPin className="w-4 h-4" />}
          label="Villes"
          value={routeInfo}
          wide
        />

        <InsightItem
          icon={<Ban className="w-4 h-4" />}
          label="À éviter"
          value={avoidItems}
          wide
        />
      </div>
    </motion.section>
  );
}