"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Trip {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  totalBudget: number;
  _count?: { days: number; budgetItems: number };
}

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    totalBudget: 0,
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch {
      console.error("Failed to fetch trips");
    } finally {
      setLoading(false);
    }
  }

  async function createTrip(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrip),
      });
      if (res.ok) {
        setShowNewTrip(false);
        setNewTrip({ name: "", description: "", startDate: "", endDate: "", totalBudget: 0 });
        fetchTrips();
      }
    } catch {
      console.error("Failed to create trip");
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const now = new Date();
  const upcomingTrips = trips.filter((t) => new Date(t.endDate) >= now);
  const pastTrips = trips.filter((t) => new Date(t.endDate) < now);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-travel-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-travel-dark">Mijn Reizen</h1>
          <p className="text-travel-gray mt-1">
            Overzicht van al je reizen — verleden en toekomst
          </p>
        </div>
        <button onClick={() => setShowNewTrip(true)} className="btn-primary">
          + Nieuwe Reis Toevoegen
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-travel-gray">Totaal reizen</p>
          <p className="text-2xl font-bold text-travel-dark">{trips.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-travel-gray">Aankomende</p>
          <p className="text-2xl font-bold text-travel-primary">{upcomingTrips.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-travel-gray">Afgerond</p>
          <p className="text-2xl font-bold text-green-600">{pastTrips.length}</p>
        </div>
      </div>

      {/* Upcoming Trips */}
      {upcomingTrips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-travel-dark">Aankomende Reizen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingTrips.map((trip) => (
              <Link
                key={trip.id}
                href={`/itinerary?tripId=${trip.id}`}
                className="card hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-travel-primary transition-colors">
                      {trip.name}
                    </h3>
                    {trip.description && (
                      <p className="text-sm text-travel-gray mt-1">
                        {trip.description}
                      </p>
                    )}
                    <p className="text-sm text-travel-gray mt-2">
                      {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                    </p>
                  </div>
                  {trip.totalBudget > 0 && (
                    <span className="badge-primary">
                      {trip.totalBudget.toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Past Trips */}
      {pastTrips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-travel-dark">Eerdere Reizen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastTrips.map((trip) => (
              <Link
                key={trip.id}
                href={`/itinerary?tripId=${trip.id}`}
                className="card hover:shadow-md transition-shadow cursor-pointer group opacity-75 hover:opacity-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-travel-primary transition-colors">
                      {trip.name}
                    </h3>
                    {trip.description && (
                      <p className="text-sm text-travel-gray mt-1">
                        {trip.description}
                      </p>
                    )}
                    <p className="text-sm text-travel-gray mt-2">
                      {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                    </p>
                  </div>
                  {trip.totalBudget > 0 && (
                    <span className="badge-gray">
                      {trip.totalBudget.toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {trips.length === 0 && (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">✈️</p>
          <h3 className="text-xl font-semibold text-travel-dark mb-2">
            Nog geen reizen
          </h3>
          <p className="text-travel-gray mb-6">
            Begin met het plannen van je eerste reis!
          </p>
          <button onClick={() => setShowNewTrip(true)} className="btn-primary">
            + Nieuwe Reis Toevoegen
          </button>
        </div>
      )}

      {/* New Trip Modal */}
      {showNewTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Nieuwe Reis</h2>
            <form onSubmit={createTrip} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-travel-gray">Naam</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  placeholder="Bijv. Roadtrip Italië"
                  value={newTrip.name}
                  onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-travel-gray">Beschrijving</label>
                <textarea
                  className="input-field mt-1"
                  placeholder="Korte beschrijving van je reis"
                  value={newTrip.description}
                  onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-travel-gray">Start</label>
                  <input
                    type="date"
                    className="input-field mt-1"
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-travel-gray">Einde</label>
                  <input
                    type="date"
                    className="input-field mt-1"
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-travel-gray">Budget</label>
                <input
                  type="number"
                  className="input-field mt-1"
                  placeholder="2500"
                  value={newTrip.totalBudget || ""}
                  onChange={(e) => setNewTrip({ ...newTrip, totalBudget: Number(e.target.value) })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Aanmaken
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTrip(false)}
                  className="btn-secondary flex-1"
                >
                  Annuleren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
