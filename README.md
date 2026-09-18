# Tampon Bordeaux

On pose les offres d’emploi de Bordeaux sur le bureau. Chaque fiche reçoit un tampon : **oui**, **non**, ou **à voir**.

## Lancer

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000). À gauche, le profil. En haut, « Je cherche ». Le bouton **Scanner Bordeaux** ramène les offres et les tamponne.

Le premier scan peut prendre une minute ou deux.

## Clés

Elles restent sur la machine, jamais dans le dépôt.

Copie `.env.example` vers `.env.local` :

- `TYPESAFE_API_KEY` — pour tamponner
- `FT_CLIENT_ID` et `FT_CLIENT_SECRET` — France Travail, si tu les as
- `APIFY_TOKEN` — Indeed, sinon

France Travail passe en premier. Indeed complète.
