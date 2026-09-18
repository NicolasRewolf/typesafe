# Typeface

Deux outils dans la même app.

## Titres du sitemap

La page d’accueil prépare les titres des pages du futur sitemap Rewolf.

Pour chaque page : plusieurs idées, une note, le titre retenu.

1. Copier `.env.example` vers `.env.local` et y coller la clé TypeSafe.
2. `npm install` puis `npm run dev`.
3. Ouvrir [http://localhost:3000](http://localhost:3000), cliquer sur **Noter les titres**.

## Tampon Bordeaux

Les offres d’emploi de Bordeaux, chaque fiche tamponnée **oui**, **non**, ou **à voir**.

Ouvre [http://localhost:3000/scan](http://localhost:3000/scan). À gauche, le profil. En haut, « Je cherche ». **Scanner Bordeaux** ramène les offres et les tamponne.

Le premier scan peut prendre une minute ou deux.

Clés, toujours sur la machine, jamais dans le dépôt :

- `TYPESAFE_API_KEY` — pour noter les titres et tamponner
- `FT_CLIENT_ID` et `FT_CLIENT_SECRET` — France Travail, si tu les as
- `APIFY_TOKEN` — Indeed, sinon

France Travail passe en premier. Indeed complète.
