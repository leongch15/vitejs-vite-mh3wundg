import React from 'react';

const STYLES = [
  {
    id: 'detente',
    emoji: '🌴',
    label: 'Détente totale',
    desc: 'Rythme lent, peu d\'activités, profiter pleinement',
  },
  {
    id: 'essentiels',
    emoji: '📍',
    label: 'Les incontournables',
    desc: 'Les grands classiques, sans se précipiter',
  },
  {
    id: 'immersion_totale',
    emoji: '🗺️',
    label: 'Voir absolument tout',
    desc: 'Planning chargé, maximiser chaque journée',
  },
  {
    id: 'insolite',
    emoji: '🔮',
    label: 'Endroits insolites',
    desc: 'Hors des sentiers battus, lieux secrets & cachés',
  },
  {
    id: 'aventure',
    emoji: '🧗',
    label: 'Aventure & nature',
    desc: 'Randonnées, sport, grand air et sensations fortes',
  },
  {
    id: 'gastronomique',
    emoji: '🍽️',
    label: 'Tour gastronomique',
    desc: 'Cuisine locale, marchés, restaurants étoilés',
  },
];

export default function TravelStylePicker({ value, onChange }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {STYLES.map((style) => {
          const selected = value === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className={`
                flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-200
                ${selected
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                  : 'border-border/60 bg-secondary/30 hover:bg-secondary/60 hover:border-border'
                }
              `}
            >
              <span className="text-xl">{style.emoji}</span>
              <span className={`text-xs font-semibold leading-tight ${selected ? 'text-primary' : 'text-foreground'}`}>
                {style.label}
              </span>
              <span className="text-xs text-muted-foreground leading-tight">{style.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}