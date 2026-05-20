
# Notes projet — Capi

## Version stable sauvegardée

Date de sauvegarde : 06/05/2026

Lien StackBlitz de la version stable :
https://stackblitz.com/edit/vitejs-vite-hr24zouo?file=README.md

## État fonctionnel actuel

Cette version correspond à une V1 locale stable de Capi.

Fonctionnalités validées :

- Page d’accueil fonctionnelle
- Formulaire complet avec options avancées
- Dates passées bloquées
- Date retour automatiquement après la date départ
- Durée du voyage affichée
- Génération locale fonctionnelle
- Sauvegarde des voyages dans le localStorage
- Page “Mes voyages” fonctionnelle
- Ouverture d’un voyage existant fonctionnelle
- Page détail voyage fonctionnelle
- Accordéons jour par jour fonctionnels
- Budget recalculé depuis les activités
- Boutons d’ajustement fonctionnels
- Boutons d’ajustement qui disparaissent après clic
- Modifications sauvegardées après ajustement
- Carte géographique réelle avec MapLibre + OpenFreeMap
- Filtres de carte par jour fonctionnels
- Popups des marqueurs fonctionnelles
- Header avec logo Capi provisoire
- Homepage V2 améliorée

## Points encore à améliorer

- Page “Mes voyages” à rendre plus premium
- Cartes de voyages à améliorer
- Génération locale à enrichir
- Plus de destinations à ajouter
- Préparation future à une vraie IA
- Comptes utilisateurs plus tard
- Export PDF plus tard
- Premium / monétisation plus tard

## Règle importante

Ne pas modifier la copie de sauvegarde.

Toutes les nouvelles modifications doivent être faites uniquement sur le projet principal.

## Nettoyage fichiers

- public/icons.svg supprimé : fichier non utilisé, contenant uniquement des icônes sociales héritées.
- Aucun impact détecté après suppression.
- src/assets/capi-logo.webp conservé.
- public/favicon.svg conservé pour éviter de casser une éventuelle référence dans index.html.

## Nettoyage dépendances

- react-leaflet supprimé car la carte utilise maintenant MapLibre.
- maplibre-gl conservé pour la carte géographique gratuite.
- Test après suppression : homepage OK, Mes voyages OK, détail voyage OK, carte OK.