# Japan Reis Tracker ⛩️

Plan en volg je perfecte reis naar Japan. Beheer je itinerary, budget en ontdek geweldige plekken.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma + PostgreSQL
- **Maps**: Google Maps JS API + Places API

## Installatie

### Vereisten

- Node.js 18+
- PostgreSQL database
- Google Maps API key (met Maps JS API & Places API ingeschakeld)

### Stappen

1. **Clone en installeer dependencies**

```bash
cd japan-reis-tracker
npm install
```

2. **Configureer environment variabelen**

```bash
cp .env.example .env
```

Vul je `.env` bestand in:

```
DATABASE_URL="postgresql://user:password@localhost:5432/japan_reis_tracker?schema=public"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="jouw-google-maps-api-key"
```

3. **Database setup**

```bash
npx prisma generate
npx prisma db push
```

4. **Start de development server**

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in je browser.

## Pagina's

| Route | Beschrijving |
|---|---|
| `/` | Landing page |
| `/dashboard` | Overzicht van reizen en budget |
| `/itinerary` | Dag-voor-dag itinerary planner |
| `/map` | Kaartweergave van alle activiteiten |
| `/places` | Zoek en ontdek plekken in Japan |

## API Routes

| Route | Methodes | Beschrijving |
|---|---|---|
| `/api/trips` | GET, POST | Reizen beheren |
| `/api/trips/[id]` | GET, PUT, DELETE | Enkele reis |
| `/api/trips/[id]/days` | POST | Dagen toevoegen |
| `/api/activities` | GET, POST | Activiteiten beheren |
| `/api/activities/[id]` | PUT, DELETE | Enkele activiteit |
| `/api/budget` | GET, POST | Budget items |
| `/api/places/search` | GET | Google Places zoeken |

## Database

Prisma modellen:

- **Trip** — Een reis met start/einddatum en budget
- **Day** — Een dag binnen een reis
- **Activity** — Een activiteit op een dag (met locatie, kosten, categorie)
- **BudgetItem** — Een budget post gekoppeld aan een reis

## Google Maps Setup

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project of selecteer een bestaand project
3. Schakel de volgende API's in:
   - Maps JavaScript API
   - Places API
4. Maak een API key aan en voeg die toe aan je `.env`

## Scripts

```bash
npm run dev          # Development server
npm run build        # Productie build
npm run start        # Productie server
npm run db:generate  # Prisma client genereren
npm run db:push      # Database schema pushen
npm run db:migrate   # Database migratie
npm run db:studio    # Prisma Studio openen
```
