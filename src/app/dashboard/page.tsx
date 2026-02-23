"use client";

import { useEffect, useState } from "react";
import BudgetBar from "@/components/BudgetBar";
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

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  categories: { category: string; amount: number }[];
}

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [budget, setBudget] = useState<BudgetSummary>({
    totalBudget: 0,
    totalSpent: 0,
    categories: [],
  });
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
    fetchBudget();
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

  async function fetchBudget() {
    try {
      const res = await fetch("/api/budget");
      if (res.ok) {
        const data = await res.json();
        setBudget(data);
      }
    } catch {
      console.error("Failed to fetch budget");
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
          <h1 className="text-3xl font-bold text-travel-dark">Dashboard</h1>
          <p className="text-travel-gray mt-1">
            Overzicht van al je reizen en budget
          </p>
        </div>
        <button onClick={() => setShowNewTrip(true)} className="btn-primary">
          + Nieuwe Reis
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-travel-gray">Reizen</p>
          <p className="text-2xl font-bold text-travel-dark">{trips.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-travel-gray">Budget</p>
          <p className="text-2xl font-bold text-travel-dark">
            {budget.totalBudget.toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-travel-gray">Uitgegeven</p>
          <p className="text-2xl font-bold text-travel-primary">
            {budget.totalSpent.toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-travel-gray">Resterend</p>
          <p className="text-2xl font-bold text-green-600">
            {(budget.totalBudget - budget.totalSpent).toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}
          </p>
        </div>
      </div>

      {/* Budget Bar */}
      {budget.totalBudget > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Budget Overzicht</h2>
          <BudgetBar spent={budget.totalSpent} total={budget.totalBudget} />
          {budget.categories.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {budget.categories.map((cat) => (
                <div key={cat.category} className="text-sm">
                  <span className="text-travel-gray capitalize">{cat.category}</span>
                  <p className="font-medium">
                    {cat.amount.toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trips */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Je Reizen</h2>
        {trips.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-4">✈️</p>
            <p className="text-travel-gray">
              Nog geen reizen gepland. Maak je eerste reis aan!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.map((trip) => (
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
        )}
      </div>

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
