import React from 'react';
import { cn } from '@/lib/utils';

export default function InterestTag({ label, icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200",
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
          : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-secondary"
      )}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}