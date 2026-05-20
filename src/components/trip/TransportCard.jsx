import React from 'react';
import { ArrowRight, Plane, Car, Train, Bus, Ship, Clock, DollarSign } from 'lucide-react';

const TRANSPORT_ICONS = {
  avion: { icon: Plane, color: 'text-blue-500', bg: 'bg-blue-50' },
  vol: { icon: Plane, color: 'text-blue-500', bg: 'bg-blue-50' },
  train: { icon: Train, color: 'text-green-600', bg: 'bg-green-50' },
  voiture: { icon: Car, color: 'text-orange-500', bg: 'bg-orange-50' },
  location: { icon: Car, color: 'text-orange-500', bg: 'bg-orange-50' },
  bus: { icon: Bus, color: 'text-purple-500', bg: 'bg-purple-50' },
  ferry: { icon: Ship, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  bateau: { icon: Ship, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  default: { icon: ArrowRight, color: 'text-muted-foreground', bg: 'bg-muted' },
};

function getTransportStyle(mode) {
  const key = mode?.toLowerCase();
  for (const [k, v] of Object.entries(TRANSPORT_ICONS)) {
    if (key?.includes(k)) return v;
  }
  return TRANSPORT_ICONS.default;
}

export default function TransportCard({ transport, fromCity }) {
  if (!transport || !transport.options?.length) return null;

  return (
    <div className="my-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
          <ArrowRight className="w-3 h-3" />
          {fromCity} → {transport.destination_city}
        </div>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="rounded-xl border border-border/60 overflow-hidden bg-card">
        <div className="px-4 py-2.5 bg-muted/40 border-b border-border/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Options de transport
          </p>
        </div>
        <div className="divide-y divide-border/40">
          {transport.options.map((opt, i) => {
            const { icon: Icon, color, bg } = getTransportStyle(opt.mode);
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">{opt.mode}</p>
                  {opt.description && (
                    <p className="text-xs text-muted-foreground truncate">{opt.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  {opt.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {opt.duration}
                    </span>
                  )}
                  {opt.estimated_cost && (
                    <span className="font-semibold text-accent">{opt.estimated_cost}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}