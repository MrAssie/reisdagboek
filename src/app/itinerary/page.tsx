"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ActivityCard from "@/components/ActivityCard";
import Link from "next/link";

interface Activity {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  startTime: string | null;
  endTime: string | null;
  category: string;
  cost: number;
  currency: string;
  order: number;
}

interface Day {
  id: string;
  date: string;
  title: string;
  notes: string | null;
  activities: Activity[];
}

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: Day[];
}

export default function ItineraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-travel-primary border-t-transparent" />
        </div>
      }
    >
      <ItineraryContent />
    </Suspense>
  );
}

function ItineraryContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDay, setShowAddDay] = useState(false);
  const [newDay, setNewDay] = useState({ date: "", title: "", notes: "" });
  const [showAddActivity, setShowAddActivity] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    category: "sightseeing",
    cost: 0,
  });

  const fetchTrip = useCallback(async () => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/trips/${tripId}`);
      if (res.ok) {
        const data = await res.json();
        setTrip(data);
      }
    } catch {
      console.error("Failed to fetch trip");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  async function addDay(e: React.FormEvent) {
    e.preventDefault();
    if (!tripId) return;
    try {
      const res = await fetch(`/api/trips/${tripId}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDay),
      });
      if (res.ok) {
        setShowAddDay(false);
        setNewDay({ date: "", title: "", notes: "" });
        fetchTrip();
      }
    } catch {
      console.error("Failed to add day");
    }
  }

  async function addActivity(e: React.FormEvent, dayId: string) {
    e.preventDefault();
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newActivity, dayId }),
      });
      if (res.ok) {
        setShowAddActivity(null);
        setNewActivity({
          name: "",
          description: "",
          location: "",
          startTime: "",
          endTime: "",
          category: "sightseeing",
          cost: 0,
        });
        fetchTrip();
      }
    } catch {
      console.error("Failed to add activity");
    }
  }

  async function deleteActivity(id: string) {
    try {
      const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
      if (res.ok) fetchTrip();
    } catch {
      console.error("Failed to delete activity");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-travel-primary border-t-transparent" />
      </div>
    );
  }

  if (!tripId) {
    return (
      <div className="p-8 text-center">
        <p className="text-4xl mb-4">📅</p>
        <p className="text-travel-gray">
          Selecteer een reis vanuit de{" "}
          <Link href="/" className="text-travel-primary hover:underline">
            homepage
          </Link>{" "}
          om je itinerary te bekijken.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-travel-dark">
            {trip?.name ?? "Itinerary"}
          </h1>
          {trip && (
            <p className="text-travel-gray mt-1">
              {new Date(trip.startDate).toLocaleDateString("nl-NL")} —{" "}
              {new Date(trip.endDate).toLocaleDateString("nl-NL")}
            </p>
          )}
        </div>
        <button onClick={() => setShowAddDay(true)} className="btn-primary">
          + Dag Toevoegen
        </button>
      </div>

      {/* Days */}
      {trip?.days
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((day, index) => (
          <div key={day.id} className="card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-travel-primary text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{day.title}</h2>
                  <p className="text-sm text-travel-gray">
                    {new Date(day.date).toLocaleDateString("nl-NL", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddActivity(day.id)}
                className="text-sm text-travel-primary hover:text-travel-primary-dark font-medium"
              >
                + Activiteit
              </button>
            </div>

            {day.notes && (
              <p className="text-sm text-travel-gray bg-gray-50 rounded-lg p-3">
                {day.notes}
              </p>
            )}

            <div className="space-y-3">
              {day.activities
                .sort((a, b) => a.order - b.order)
                .map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onDelete={() => deleteActivity(activity.id)}
                  />
                ))}
            </div>

            {/* Add Activity Form */}
            {showAddActivity === day.id && (
              <form onSubmit={(e) => addActivity(e, day.id)} className="border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Activiteit naam"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Locatie"
                    value={newActivity.location}
                    onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                  />
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Beschrijving"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                />
                <div className="grid grid-cols-4 gap-3">
                  <input
                    type="time"
                    className="input-field"
                    value={newActivity.startTime}
                    onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
                  />
                  <input
                    type="time"
                    className="input-field"
                    value={newActivity.endTime}
                    onChange={(e) => setNewActivity({ ...newActivity, endTime: e.target.value })}
                  />
                  <select
                    className="input-field"
                    value={newActivity.category}
                    onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                  >
                    <option value="sightseeing">Bezienswaardigheden</option>
                    <option value="food">Eten & Drinken</option>
                    <option value="transport">Transport</option>
                    <option value="shopping">Winkelen</option>
                    <option value="accommodation">Overnachting</option>
                    <option value="culture">Cultuur</option>
                    <option value="nature">Natuur</option>
                  </select>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Kosten"
                    value={newActivity.cost || ""}
                    onChange={(e) => setNewActivity({ ...newActivity, cost: Number(e.target.value) })}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm">
                    Toevoegen
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddActivity(null)}
                    className="btn-secondary text-sm"
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}

      {trip?.days.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-travel-gray">
            Nog geen dagen gepland. Voeg je eerste dag toe!
          </p>
        </div>
      )}

      {/* Add Day Modal */}
      {showAddDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Dag Toevoegen</h2>
            <form onSubmit={addDay} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-travel-gray">Datum</label>
                <input
                  type="date"
                  className="input-field mt-1"
                  value={newDay.date}
                  onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-travel-gray">Titel</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  placeholder="Bijv. Stadsverkenning"
                  value={newDay.title}
                  onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-travel-gray">Notities</label>
                <textarea
                  className="input-field mt-1"
                  placeholder="Optionele notities voor deze dag"
                  value={newDay.notes}
                  onChange={(e) => setNewDay({ ...newDay, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Toevoegen
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDay(false)}
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
