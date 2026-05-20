import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="https://media.base44.com/images/public/69e5276c7af0081523b3b6e4/53ecb3288_ChatGPTImage21avr202611_46_21.png"
              alt="Capi logo"
              className="w-9 h-9 rounded-xl object-cover group-hover:scale-105 transition-transform"
            />
            <span className="font-heading text-xl font-semibold tracking-tight">Capi</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/mes-voyages">
              <Button
                variant={isActive('/mes-voyages') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2 font-body"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Mes voyages</span>
              </Button>
            </Link>
            <Link to="/">
              <Button size="sm" className="gap-2 font-body bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouveau</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}