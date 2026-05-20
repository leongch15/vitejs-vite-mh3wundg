import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { message: "Analyse de votre destination…", icon: "🌍", progress: 10 },
  { message: "Sélection des meilleurs quartiers…", icon: "🗺️", progress: 25 },
  { message: "Création de votre itinéraire jour par jour…", icon: "📅", progress: 45 },
  { message: "Optimisation selon votre budget…", icon: "💰", progress: 60 },
  { message: "Ajout des bonnes adresses…", icon: "📍", progress: 78 },
  { message: "Votre voyage est presque prêt…", icon: "✈️", progress: 92 },
];

export default function GeneratingScreen({ destination }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const step = STEPS[stepIndex];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Plane animation */}
        <div className="relative h-24 mb-8 flex items-center justify-center">
          <motion.div
            animate={{ x: [-20, 20, -20], y: [-5, 5, -5], rotate: [0, 3, 0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="text-6xl"
          >
            ✈️
          </motion.div>
          {/* Trail dots */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-accent/40"
              style={{ left: `${25 + i * 15}%`, top: '50%' }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.4, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Title */}
        <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
          Capi prépare votre voyage
        </h2>
        {destination && (
          <p className="text-primary font-semibold text-lg mb-8">✈️ {destination}</p>
        )}

        {/* Step message */}
        <div className="h-12 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 text-muted-foreground"
            >
              <span className="text-2xl">{step.icon}</span>
              <span className="text-base font-medium">{step.message}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            animate={{ width: `${step.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${i <= stepIndex ? 'bg-primary' : 'bg-muted'}`}
              animate={i === stepIndex ? { scale: [1, 1.4, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          ))}
        </div>

        {/* Time elapsed */}
        <p className="text-xs text-muted-foreground">
          {elapsed < 10
            ? "Préparation en cours…"
            : elapsed < 25
            ? "Cela prend un peu de temps, mais ça vaut le coup !"
            : "Dernière ligne droite, votre voyage arrive…"}
        </p>
      </div>
    </div>
  );
}