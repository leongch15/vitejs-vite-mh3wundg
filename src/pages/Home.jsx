import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import TripForm from '@/components/trip/TripForm';
import GeneratingScreen from '@/components/trip/GeneratingScreen';
import {
  Sparkles,
  Shield,
  Zap,
  Brain,
  MapPinned,
  Route,
  Clock3,
  CheckCircle2,
  SlidersHorizontal,
  HeartHandshake,
} from 'lucide-react';
import { motion } from 'framer-motion';

const STYLE_PROMPT = {
  detente:
    'STYLE DÉTENTE TOTALE : rythme très lent, maximum 2-3 activités par jour légères, beaucoup de temps libre, plages, cafés, balades sans pression. Jamais de journées chargées.',
  essentiels:
    'STYLE INCONTOURNABLES : 3-4 activités bien choisies, uniquement les grands classiques incontournables de la destination, sans surcharger.',
  immersion_totale:
    'STYLE IMMERSION TOTALE : planning très dense, 5-6 activités par jour, visites complètes, optimisées par quartier pour minimiser les trajets.',
  insolite:
    'STYLE INSOLITE : éviter absolument les attractions touristiques classiques. Privilégier lieux cachés, quartiers locaux, expériences authentiques hors des sentiers battus, artisans, bars de quartier.',
  aventure:
    'STYLE AVENTURE & NATURE : randonnées, sports outdoor, points de vue panoramiques, parcs naturels, activités physiques et sensations fortes.',
  gastronomique:
    'STYLE GASTRONOMIQUE : marchés locaux, restaurants locaux réputés, spécialités régionales, cours de cuisine, bars à vins, dégustations, street food.',
};

const INTEREST_PROMPT = {
  culture: 'musées importants, monuments historiques, quartiers culturels',
  gastronomie: 'restaurants réputés, marchés alimentaires, spécialités locales',
  nature: 'parcs naturels, jardins, points de vue, balades en plein air',
  plage: 'plages, bord de mer, activités nautiques, détente soleil',
  aventure: 'activités sportives, expériences originales, sensations fortes',
  shopping: 'quartiers commerçants, marchés, concept stores, boutiques locales',
  histoire: "sites historiques, patrimoine, visites guidées, musées d'histoire",
  vie_nocturne: 'bars tendance, rooftops, quartiers animés le soir',
  bien_etre: 'spas, hammams, bains thermaux, lieux calmes et ressourçants',
  photographie: 'spots photogéniques, points de vue, couchers de soleil, architecture',
  famille: 'activités accessibles aux enfants, rythme doux, pauses fréquentes',
  romantique:
    'restaurants intimistes, couchers de soleil, promenades romantiques, ambiance douce',
};

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingDestination, setGeneratingDestination] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async (formData) => {
    try {
      setIsGenerating(true);
      setGeneratingDestination(formData.destination);
      setError(null);

      const daysCount = Math.max(
        1,
        Math.floor(
          (new Date(formData.end_date) - new Date(formData.start_date)) /
            (1000 * 60 * 60 * 24)
        ) + 1
      );

      const styleInstruction = STYLE_PROMPT[formData.travel_style] || '';
      const interestsList = (formData.interests || [])
        .map((id) => INTEREST_PROMPT[id])
        .filter(Boolean)
        .join('; ');

      const prompt = `Tu es Capi, un planificateur de voyage expert. Génère un itinéraire complet, détaillé, réaliste et VRAIMENT PRÊT À SUIVRE pour ${formData.destination}.

PARAMÈTRES DU VOYAGE :
- Destination : ${formData.destination}
- Durée exacte : ${daysCount} jours (du ${formData.start_date} au ${formData.end_date})
- Budget : ${formData.budget}
- Voyageurs : ${formData.travelers} personne(s)
- Style de voyage : ${formData.travel_style}
- Centres d'intérêt : ${interestsList || 'général'}
- Niveau d’organisation souhaité : ${formData.organization_level || 'planning prêt à suivre'}
- Niveau de marche accepté : ${formData.walking_level || 'moyen'}
- Ville d’arrivée : ${formData.arrival_city || 'non précisée'}
- Ville de retour : ${formData.return_city || 'non précisée'}
- Heure d’arrivée : ${formData.arrival_time || 'non précisée'}
- Heure de départ : ${formData.departure_time || 'non précisée'}
- Éléments à éviter : ${formData.avoid_items || 'aucun'}

RÈGLE ABSOLUE DE PERSONNALISATION :
${styleInstruction}

CENTRES D'INTÉRÊT À INTÉGRER CONCRÈTEMENT :
${interestsList ? `Intègre impérativement ces éléments dans les activités : ${interestsList}` : 'Proposer un équilibre général.'}

MISSION PRINCIPALE :
Ne génère pas une simple liste d’activités. Construis une vraie stratégie de voyage :
- où dormir chaque nuit ;
- quand rester plusieurs nuits dans une ville ;
- quand changer de ville ;
- pourquoi changer ou ne pas changer ;
- comment éviter de refaire la valise trop souvent ;
- quel transport utiliser entre les villes ;
- quel transport utiliser dans les grandes journées ;
- comment respecter la ville d’arrivée, la ville de retour et les horaires.

RÈGLES PRIORITAIRES :
- itinerary doit contenir exactement ${daysCount} jours.
- Le dernier jour ne doit jamais être vide.
- Si l’heure de départ est inconnue ou tardive, propose une demi-journée légère.
- Si la ville de retour est renseignée, la dernière nuit doit être compatible avec cette ville.
- Si le départ est le matin, il faut dormir la veille dans la ville de retour.
- Ne répète pas plusieurs fois le même musée, food hall, restaurant, marché ou quartier.
- Pour un long voyage, ne remplis pas tous les jours restants dans la ville de retour : répartis les nuits entre plusieurs bases cohérentes.
- Si la voiture est à éviter, utilise train, bus, métro, ferry, tram, vaporetto ou taxi.
- Si le style est insolite, au moins 40 % des activités doivent être locales, cachées, alternatives ou moins évidentes.
- Si le style est incontournables, couvre les lieux majeurs évidents de la destination.
- Chaque intérêt sélectionné doit apparaître dans au moins une vraie activité.
- Le budget doit être clair, prudent, et éviter les devises mélangées. Privilégie EUR comme devise principale d’affichage.
- Les hôtels précis doivent être présentés avec prudence : prix à vérifier.

STRUCTURE PAR JOUR :
- city : ville principale du jour et ville de nuitée si ce n’est pas le dernier jour
- lat/lng : coordonnées GPS de la ville
- title : titre accrocheur de la journée
- description : explique la logique de la journée, le rythme, les transports importants ou la raison de dormir ici
- activities : liste chronologique avec time, name, description courte mais utile, type, estimated_cost, duration, tags, lat, lng
- hotel : ville où dormir + type d’hébergement adapté au budget
- restaurant : dîner recommandé ou null le dernier jour
- transport_to_next : uniquement si la ville change le lendemain, avec destination_city, mode, description, duration, estimated_cost

RÈGLES GÉOGRAPHIQUES :
- Regroupe les activités par quartier.
- Évite les zigzags.
- Indique dans les descriptions quand un métro, train, vaporetto, bus ou taxi est préférable.
- Les grands musées doivent avoir assez de temps de visite.
- Ne place pas une grosse visite trop près de la fermeture.

SECTIONS SUPPLÉMENTAIRES :
- summary : résumé du voyage en expliquant la stratégie de route et de nuitées
- estimated_total_cost : estimation prudente pour ${formData.travelers} personne(s), en EUR de préférence
- currency : EUR sauf nécessité claire
- currency_symbol : €
- tips : 5 conseils pratiques personnalisés
- must_book : 3 réservations prioritaires concrètes
- weather_alternative : alternatives météo pertinentes pour les différentes villes du voyage, pas seulement la première ville

Réponds uniquement en JSON strict, en français, sans markdown, sans texte autour.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        form: formData,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            estimated_total_cost: { type: 'string' },
            currency: { type: 'string' },
            currency_symbol: { type: 'string' },
            tips: { type: 'array', items: { type: 'string' } },
            must_book: { type: 'array', items: { type: 'string' } },
            weather_alternative: { type: 'array', items: { type: 'string' } },
            itinerary: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  city: { type: 'string' },
                  lat: { type: 'number' },
                  lng: { type: 'number' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  hotel: { type: 'string' },
                  restaurant: { type: 'string' },
                  transport_to_next: {
                    type: 'object',
                    properties: {
                      destination_city: { type: 'string' },
                      options: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            mode: { type: 'string' },
                            description: { type: 'string' },
                            duration: { type: 'string' },
                            estimated_cost: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                  activities: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        time: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        type: { type: 'string' },
                        estimated_cost: { type: 'string' },
                        lat: { type: 'number' },
                        lng: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const cleanedItinerary = (result.itinerary || []).map((day) => ({
        ...day,
        transport_to_next: day.transport_to_next
          ? {
              ...day.transport_to_next,
              options: (day.transport_to_next.options || []).filter(
                (option) => option && typeof option === 'object'
              ),
            }
          : undefined,
      }));

      const tripData = {
        ...result,

        // Champs issus du formulaire : ils restent prioritaires pour l'affichage,
        // les filtres, la recherche et les futures corrections.
        destination: formData.destination,
        start_date: formData.start_date,
        end_date: formData.end_date,
        budget: formData.budget,
        travelers: formData.travelers,
        interests: formData.interests,
        travel_style: formData.travel_style,
        organization_level: formData.organization_level,
        walking_level: formData.walking_level,
        arrival_city: formData.arrival_city,
        return_city: formData.return_city,
        arrival_time: formData.arrival_time,
        departure_time: formData.departure_time,
        avoid_items: formData.avoid_items,

        // Champs générés : on garde tout ce que renvoie l'IA ou le fallback local.
        itinerary: cleanedItinerary,
        tips: result.tips || [],
        estimated_total_cost: result.estimated_total_cost,
        summary: result.summary,
        currency: result.currency,
        currency_symbol: result.currency_symbol,
        must_book: result.must_book || [],
        weather_alternative: result.weather_alternative || [],

        // Champs techniques utiles pour vérifier et auditer chaque génération.
        generation_source: result.generation_source,
        ai_provider: result.ai_provider,
        ai_error: result.ai_error,
        fallback_used: result.fallback_used || false,
        prompt_version: result.prompt_version,
        duration_ms: result.duration_ms,
        estimated_cost_usd: result.estimated_cost_usd,
        quality_score: result.quality_score,
        quality: result.quality,
        quality_status: result.quality_status,
        quality_summary: result.quality_summary,
        quality_blockers: result.quality_blockers || [],
        quality_warnings: result.quality_warnings || [],
        quality_repairs: result.quality_repairs || [],
        generation_model: result.generation_model,
        generation_usage: result.generation_usage,
        generation_trace: result.generation_trace,
        fallback_at: result.fallback_at,
        generated_at: result.generated_at,
        post_ai_validation: result.post_ai_validation,
      };

      const created = await base44.entities.Trip.create(tripData);

      setIsGenerating(false);
      navigate(`/trip/${created.id}`);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setError("Impossible de générer le voyage pour le moment. Réessayez dans quelques instants.");
    }
  };

  if (isGenerating) {
    return <GeneratingScreen destination={generatingDestination} />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-32 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-start">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="pt-4 lg:pt-10"
            >
              <div className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/60 shadow-sm text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>L’assistant voyage pour ceux qui détestent organiser</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4">
                  Ton voyage prêt,
                  <br className="sm:hidden" />{' '}
                  <span className="text-primary">
                    sans l’organiser toi-même
                  </span>
                </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-7">
                Indique où tu pars, tes dates et ton rythme. 
                Capi crée un itinéraire clair avec étapes, carte, budget et ajustements.
              </p>

              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3 mb-8">
                {[
                  { icon: <Clock3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, label: 'Rapide' },
                  { icon: <MapPinned className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, label: 'Carte incluse' },
                  { icon: <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, label: 'Ajustable' },
                ].map(({ icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-card border border-border/60 px-2 py-2 sm:px-4 text-[11px] sm:text-sm text-muted-foreground shadow-sm whitespace-nowrap"
                  >
                    {icon}
                    {label}
                  </span>
                ))}
              </div>

              <div className="hidden sm:grid sm:grid-cols-3 gap-3 max-w-2xl">
                {[
                  {
                    icon: <Brain className="w-5 h-5" />,
                    title: 'Personnalisé',
                    text: 'Budget, rythme, intérêts et contraintes sont pris en compte.',
                  },
                  {
                    icon: <Shield className="w-5 h-5" />,
                    title: 'Lisible',
                    text: 'Chaque journée est structurée, repliable et facile à suivre.',
                  },
                  {
                    icon: <Zap className="w-5 h-5" />,
                    title: 'Flexible',
                    text: 'Rends le voyage moins cher, plus relax ou plus food en un clic.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl bg-card/80 backdrop-blur border border-border/60 p-4 shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      {item.icon}
                    </div>
                    <p className="font-semibold mb-1">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Form card */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="lg:sticky lg:top-24"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-70" />

                <div className="relative bg-card rounded-3xl border border-border/60 shadow-2xl shadow-black/10 p-6 sm:p-8">
                  <div className="mb-6">
                    <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      Questionnaire rapide
                    </p>
                    <h2 className="font-heading text-2xl font-bold">
                      Où veux-tu partir ?
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Capi s’occupe du plan, des étapes, du rythme et du budget.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                      <p className="font-medium">Oups, une erreur est survenue !</p>
                      <p className="mt-1 text-destructive/80">{error}</p>
                      <button
                        type="button"
                        onClick={() => setError(null)}
                        className="mt-2 underline text-xs"
                      >
                        Réessayer
                      </button>
                    </div>
                  )}

                  <TripForm onGenerate={handleGenerate} isGenerating={isGenerating} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold text-primary mb-2">
            Comment ça marche ?
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
            Capi prépare le plan, tu gardes le contrôle
          </h2>
          <p className="text-muted-foreground">
            Capi transforme quelques choix simples en itinéraire structuré, lisible et
            personnalisable.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              step: '01',
              title: 'Tu donnes tes critères',
              text: 'Destination, dates, budget, rythme et envies.',
            },
            {
              step: '02',
              title: 'Capi construit l’itinéraire',
              text: 'Jours structurés, étapes logiques, carte et budget.',
            },
            {
              step: '03',
              title: 'Tu ajustes facilement',
              text: 'Moins cher, plus relax, plus food ou adapté à la pluie.',
            },
          ].map((item) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm"
            >
              <div className="flex items-start gap-4 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                {item.step}
              </div>

              <div>
                <h3 className="font-heading text-lg sm:text-xl font-bold">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {item.text}
                </p>
              </div>
            </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Capi */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card to-secondary/30 p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center">
            <div>
              <p className="text-sm font-semibold text-primary mb-2">
                Pourquoi Capi ?
              </p>
              <h2 className="font-heading text-3xl font-bold mb-3">
                Moins de tableaux, moins d’onglets, plus de voyage.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Capi est pensé pour les voyageurs qui veulent profiter, pas comparer 50
                blogs, jongler entre Google Maps, les notes, les restaurants et les
                transports.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Jours repliables',
                'Budget lisible',
                'Carte interactive',
                'Historique de voyages',
                'Ajustements rapides',
                'Conseils pratiques',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-background/70 border border-border/60 p-4"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final reassurance */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl bg-primary text-primary-foreground p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold">
                Capi est ton copilote de voyage.
              </h2>
              <p className="text-primary-foreground/80 mt-1">
                Tu gardes le contrôle, Capi s’occupe de rendre le voyage plus simple.
              </p>
            </div>
          </div>

          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-white text-primary px-5 py-3 text-sm font-semibold shadow-sm hover:bg-white/90 transition"
          >
            Créer mon voyage
          </a>
        </div>
      </section>
    </div>
  );
}