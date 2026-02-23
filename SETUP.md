# ReisDagboek — App Idee

**Aangemaakt:** 2026-02-23
**Door:** Marten Assen

## Concept

Een persoonlijk Next.js webapplicatie om al je reizen te plannen en bij te houden. Combinatie van budgettracking, reisplanning en interactieve kaart — voor elke bestemming ter wereld.

---

## Functionaliteiten

### 1. Budgetbeheer
- Totaalbudget instellen per reis
- Kosten per categorie bijhouden: vluchten, accommodatie, activiteiten, eten, vervoer
- Realtime overzicht van resterende budget
- Kosten koppelen aan specifieke bestemmingen/activiteiten

### 2. Reisplanning
- Meerdere reizen aanmaken en beheren
- Bestemmingen en activiteiten toevoegen
- Reistijden/routes bijhouden
- Datumplanning (dag-per-dag itinerary)

### 3. Interactieve Kaart
- Google Maps integratie met markers voor alle geplande bestemmingen
- Visuele route op de kaart

### 4. Google Places API Integratie
- Zoeken naar accommodaties, attracties, restaurants
- Automatisch ophalen:
  - Google rating (sterren)
  - Kosten per nacht (bij hotels)
  - Entreekosten (bij attracties)
  - Openingstijden
  - Foto's
- Opgehaalde data automatisch koppelen aan budget

### 5. Notities & Foto's
- Per bestemming/activiteit notities kunnen toevoegen
- Foto's uploaden of koppelen
- Tags/labels voor categorisatie

---

## Tech Stack

| Component | Technologie |
|-----------|-------------|
| Frontend | Next.js 16 (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Maps | Google Maps JavaScript API |
| Places | Google Places API |
| Styling | Tailwind CSS |

---

## Database Schema (globaal)

```sql
-- Reis
Trip: id, name, destination, start_date, end_date, total_budget, currency

-- Dag/Segment
Day: id, trip_id, date, title, notes

-- Activiteit/Bestemming
Activity: id, day_id, name, type (accommodation|attraction|food|transport),
          place_id (Google), lat, lng, cost, currency, rating,
          notes, photos[], booked (bool), duration_minutes

-- Budget regel
BudgetItem: id, trip_id, category, description, amount, date, activity_id (optional)
```

---

## MVP scope

1. Meerdere reizen aanmaken met budget
2. Activiteiten toevoegen (handmatig + via Places search)
3. Kaartweergave met markers
4. Budget tracker (uitgegeven vs. beschikbaar)
5. Notities per activiteit

**Nice-to-have v2:**
- Foto uploads
- Route optimalisatie
- Export naar PDF / reisschema
- Mobiel responsief (PWA)
