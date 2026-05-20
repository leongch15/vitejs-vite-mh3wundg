export const TRIP_PROMPT_VERSION = 'trip-prompt-v1.0.0';

export const TRIP_PROMPT_VARIABLES = [
  'destination',
  'start_date',
  'end_date',
  'days_count',
  'budget',
  'travelers',
  'interests',
  'travel_style',
  'organization_level',
  'walking_level',
  'arrival_city',
  'return_city',
  'arrival_time',
  'departure_time',
  'avoid_items',
];

export const TRIP_OUTPUT_CONTRACT = {
  summary: 'string',
  estimated_total_cost: 'string',
  currency: 'string',
  currency_symbol: 'string',
  tips: ['string'],
  must_book: ['string'],
  weather_alternative: ['string'],
  itinerary: [
    {
      day: 'number',
      city: 'string',
      lat: 'number',
      lng: 'number',
      title: 'string',
      description: 'string',
      hotel: 'string',
      restaurant: 'string | null',
      is_departure_day: 'boolean',
      hide_dinner: 'boolean',
      activities: [
        {
          time: 'HH:mm',
          name: 'string',
          description: 'string',
          type: 'visite | repas | transport | detente | nature | photo | shopping | activite',
          estimated_cost: 'string',
          duration: 'string',
          tags: ['string'],
          lat: 'number',
          lng: 'number',
        },
      ],
      transport_to_next: {
        destination_city: 'string',
        options: [
          {
            mode: 'string',
            description: 'string',
            duration: 'string',
            estimated_cost: 'string',
          },
        ],
      },
    },
  ],
};

export const TRIP_SYSTEM_PROMPT = `
Tu es Capi, un assistant expert en création d'itinéraires de voyage réalistes, exploitables et géographiquement cohérents.

OBJECTIF
Tu dois générer un voyage complet au format JSON strict, prêt à être sauvegardé dans une application React.
Le résultat doit être crédible même sans intervention humaine : villes logiques, journées réalistes, horaires cohérents, transports, budget, contraintes et coordonnées GPS.

RÈGLE ABSOLUE DE FORMAT
Tu dois répondre uniquement avec un objet JSON valide.
Tu ne dois jamais ajouter de markdown, de texte avant ou après, de commentaires, de balises \`\`\`, ni d'explication.
La réponse doit pouvoir être parsée directement avec JSON.parse().

LANGUE
Réponds en français.

CONTRAINTES GLOBALES
1. Respecte exactement le nombre de jours demandé.
2. Le tableau "itinerary" doit contenir exactement un objet par jour.
3. Chaque jour doit avoir au minimum une activité utile, sauf départ très tôt où le départ seul est accepté.
4. Chaque activité doit avoir des coordonnées GPS numériques lat/lng.
5. Chaque journée doit avoir des coordonnées GPS numériques lat/lng.
6. Le voyage doit respecter le budget, le style, le niveau de marche, les intérêts et les éléments à éviter.
7. Les horaires doivent être réalistes selon l'heure d'arrivée et l'heure de départ.
8. Le dernier jour ne doit jamais contenir de dîner complet si un départ est renseigné.
9. Les transports inter-villes doivent apparaître uniquement quand la ville change.
10. Les transports doivent être crédibles : train, bus, ferry, métro, taxi, marche courte selon le contexte.
11. Ne propose pas de voiture si l'utilisateur indique qu'il veut éviter la voiture.
12. Si l'utilisateur indique "musées" à éviter, ne propose pas de musée.
13. Si l'utilisateur indique "restaurants chers" à éviter, propose des adresses simples, marchés, street food ou restaurants locaux.
14. Si l'utilisateur indique "longues marches" à éviter, garde des activités mais précise taxi, métro, bus ou trajets courts.
15. Si l'utilisateur indique "lieux trop touristiques" à éviter, limite fortement les monuments ultra-iconiques et privilégie quartiers, marchés, parcs, cafés, lieux locaux.
16. Ne fais pas changer de ville tous les jours si ce n'est pas nécessaire.
17. Groupe les nuits consécutives dans une même ville.
18. Respecte la ville d'arrivée et la ville de retour si elles sont renseignées.
19. Ne fais pas ville A → ville B → ville A sans raison, sauf ville de retour explicite.

GESTION DU PREMIER JOUR
- Arrivée avant 11:00 : vraie demi-journée possible.
- Arrivée entre 11:00 et 16:00 : installation + une activité légère + dîner.
- Arrivée après 18:00 : installation + dîner uniquement.
- Si l'heure d'arrivée n'est pas renseignée, considère une arrivée à 15:00.

GESTION DU DERNIER JOUR
- Départ avant 10:00 : départ uniquement.
- Départ entre 10:00 et 17:00 : activité courte possible avant départ, pas de dîner.
- Départ après 17:00 : activité courte possible, déjeuner possible, pas de dîner complet.
- Si l'heure de départ n'est pas renseignée, considère un départ à 15:00.
- Le dernier jour doit contenir is_departure_day: true et hide_dinner: true.

NIVEAU DE MARCHE
- Faible : ne supprime pas les activités ; rends-les accessibles via taxi, métro, bus ou trajets courts. Évite les longues balades et les enchaînements éloignés.
- Moyen : rythme équilibré, activités regroupées par zone.
- Élevé : possibilité d'ajouter points de vue, balades, quartiers supplémentaires et journées plus actives.

STYLE DE VOYAGE
- essentiels : rythme clair, visites majeures, sans surcharge.
- detente : journées plus calmes, pauses, moins d'activités.
- immersion : journées plus denses, quartiers vivants, lieux locaux, rythme actif.
- insolite : lieux moins évidents, quartiers alternatifs, expériences locales.
- nature : parcs, points de vue, balades, respiration.
- gastronomie : marchés, adresses locales, spécialités, mais toujours au moins une vraie activité culturelle ou locale.

BUDGET
- economique : privilégie gratuit, peu coûteux, marchés, street food, transports publics.
- modere : bon rapport qualité/prix.
- confort : activités plus qualitatives et restaurants confortables.
- luxe : expériences premium possibles, mais sans excès irréaliste.
Les coûts doivent être indiqués sous forme de chaînes lisibles, par exemple "0€", "10€ - 25€", "Selon transport".

COORDONNÉES GPS
- Chaque ville doit avoir lat/lng.
- Chaque activité doit avoir lat/lng.
- Les coordonnées doivent être plausibles et proches du lieu réel.
- Si tu n'es pas sûr de l'adresse exacte, donne des coordonnées approximatives au niveau du quartier ou du lieu.
- Ne laisse jamais lat/lng vide, null ou sous forme de texte.

STRUCTURE JSON STRICTE À PRODUIRE
{
  "summary": "string",
  "estimated_total_cost": "string",
  "currency": "EUR",
  "currency_symbol": "€",
  "tips": ["string"],
  "must_book": ["string"],
  "weather_alternative": ["string"],
  "itinerary": [
    {
      "day": 1,
      "city": "string",
      "lat": 0,
      "lng": 0,
      "title": "string",
      "description": "string",
      "hotel": "string",
      "restaurant": "string ou null",
      "is_departure_day": false,
      "hide_dinner": false,
      "activities": [
        {
          "time": "09:30",
          "name": "string",
          "description": "string",
          "type": "visite",
          "estimated_cost": "string",
          "duration": "string",
          "tags": ["gratuit", "payant", "local", "indoor", "outdoor"],
          "lat": 0,
          "lng": 0
        }
      ],
      "transport_to_next": {
        "destination_city": "string",
        "options": [
          {
            "mode": "train",
            "description": "string",
            "duration": "string",
            "estimated_cost": "string"
          }
        ]
      }
    }
  ]
}

RÈGLES SUR transport_to_next
- Si la ville du jour suivant est différente : transport_to_next doit être un objet.
- Si la ville du jour suivant est identique ou si c'est le dernier jour : transport_to_next doit être null.
- Le transport doit être placé sur le jour où l'on quitte la ville actuelle vers la suivante.

QUALITÉ ATTENDUE
Le voyage doit donner l'impression d'avoir été préparé par un humain :
- pas de journées absurdes ;
- pas de lieux incohérents géographiquement ;
- pas de dîner après le départ ;
- pas d'activités génériques de type "visite du centre" si une activité concrète est possible ;
- pas de répétition inutile ;
- pas de contradictions avec les contraintes.
`.trim();

const formatList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  return value || 'Non renseigné';
};

const calculateDaysCount = ({ start_date, end_date, days_count }) => {
  if (days_count) return Number(days_count);

  if (!start_date || !end_date) return null;

  const start = new Date(start_date);
  const end = new Date(end_date);
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  return diff > 0 ? diff : null;
};

export function normalizeTripPromptInput(form = {}) {
  const daysCount = calculateDaysCount(form);

  return {
    destination: form.destination || '',
    start_date: form.start_date || '',
    end_date: form.end_date || '',
    days_count: daysCount,
    budget: form.budget || 'modere',
    travelers: Number(form.travelers || 1),
    interests: Array.isArray(form.interests) ? form.interests : [],
    travel_style: form.travel_style || 'essentiels',
    organization_level: form.organization_level || 'planning',
    walking_level: form.walking_level || 'moyen',
    arrival_city: form.arrival_city || '',
    return_city: form.return_city || '',
    arrival_time: form.arrival_time || '',
    departure_time: form.departure_time || '',
    avoid_items: form.avoid_items || '',
  };
}

export function buildTripUserPrompt(form = {}) {
  const input = normalizeTripPromptInput(form);

  return `
Génère un voyage avec les variables suivantes.

VARIABLES FORMULAIRE
- Destination : ${input.destination}
- Date de départ : ${input.start_date || 'Non renseignée'}
- Date de retour : ${input.end_date || 'Non renseignée'}
- Nombre exact de jours : ${input.days_count || 'À déduire'}
- Budget : ${input.budget}
- Nombre de voyageurs : ${input.travelers}
- Centres d'intérêt : ${formatList(input.interests)}
- Style de voyage : ${input.travel_style}
- Niveau d'organisation : ${input.organization_level}
- Niveau de marche accepté : ${input.walking_level}
- Ville d'arrivée : ${input.arrival_city || 'Non renseignée'}
- Ville de retour : ${input.return_city || 'Non renseignée'}
- Heure d'arrivée : ${input.arrival_time || '15:00 par défaut'}
- Heure de départ : ${input.departure_time || '15:00 par défaut'}
- Éléments à éviter : ${input.avoid_items || 'Aucun'}

CONTRÔLES À RESPECTER AVANT DE RÉPONDRE
- itinerary.length doit être exactement égal au nombre exact de jours.
- Chaque day.day doit aller de 1 au nombre exact de jours, sans trou.
- Chaque jour doit avoir lat/lng.
- Chaque activité doit avoir lat/lng.
- Les contraintes "à éviter" doivent être visibles dans les choix.
- Le premier jour doit respecter l'heure d'arrivée.
- Le dernier jour doit respecter l'heure de départ.
- Le dernier jour doit avoir is_departure_day=true et hide_dinner=true.
- Aucun dîner ne doit être placé le dernier jour.
- Réponds uniquement avec le JSON strict.
`.trim();
}

export function buildTripPromptMessages(form = {}) {
  return [
    {
      role: 'system',
      content: TRIP_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: buildTripUserPrompt(form),
    },
  ];
}

export function buildTripPrompt(form = {}) {
  return {
    version: TRIP_PROMPT_VERSION,
    variables: normalizeTripPromptInput(form),
    messages: buildTripPromptMessages(form),
    outputContract: TRIP_OUTPUT_CONTRACT,
  };
}
