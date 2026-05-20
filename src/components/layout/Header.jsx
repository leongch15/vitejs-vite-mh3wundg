import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Plus, Map, Compass } from "lucide-react";

function CapiLogo() {
  return (
    <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0">
      <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-md" />

      <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-border/60 flex items-center justify-center shadow-sm">
        <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
      </div>
    </div>
  );
}

export default function Header() {
  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    } px-3 py-2 sm:px-4`;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-3 min-w-0 group"
          aria-label="Retour à l'accueil Capi"
        >
          <CapiLogo />

          <div className="leading-tight min-w-0">
          <p className="font-heading font-bold text-2xl sm:text-3xl tracking-tight group-hover:text-primary transition-colors truncate">
            Capi
          </p>
        </div>
        </Link>

        <nav
          className="flex items-center gap-2 shrink-0"
          aria-label="Navigation principale"
        >
          <NavLink to="/" className={navLinkClass}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Créer un voyage</span>
            <span className="sm:hidden">Créer</span>
          </NavLink>

          <NavLink to="/trips" className={navLinkClass}>
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Mes voyages</span>
            <span className="sm:hidden">Voyages</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}