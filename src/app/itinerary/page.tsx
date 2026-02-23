"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ActivityCard from "@/components/ActivityCard";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, CalendarDays, Loader2 } from "lucide-react";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";

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
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
    placeId: "",
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
          address: "",
          latitude: null,
          longitude: null,
          placeId: "",
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
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tripId) {
    return (
      <div className="p-8 text-center">
        <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Selecteer een reis vanuit de{" "}
          <Link href="/" className="text-primary hover:underline">
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
          <h1 className="text-3xl font-bold tracking-tight">
            {trip?.name ?? "Itinerary"}
          </h1>
          {trip && (
            <p className="text-muted-foreground mt-1">
              {new Date(trip.startDate).toLocaleDateString("nl-NL")} —{" "}
              {new Date(trip.endDate).toLocaleDateString("nl-NL")}
            </p>
          )}
        </div>
        <Button onClick={() => setShowAddDay(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Dag Toevoegen
        </Button>
      </div>

      {trip?.days
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((day, index) => (
          <Card key={day.id}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{day.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString("nl-NL", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAddActivity(day.id)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Activiteit
                </Button>
              </div>

              {day.notes && (
                <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                  {day.notes}
                </p>
              )}

              <div className="space-y-2">
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

              {showAddActivity === day.id && (
                <>
                  <Separator />
                  <form onSubmit={(e) => addActivity(e, day.id)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Activiteit naam"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                        required
                      />
                      <PlacesAutocomplete
                        value={newActivity.location}
                        onChange={(value) => setNewActivity({ ...newActivity, location: value })}
                        onPlaceSelect={(place) => setNewActivity({
                          ...newActivity,
                          location: place.name,
                          address: place.address,
                          latitude: place.latitude,
                          longitude: place.longitude,
                          placeId: place.placeId,
                        })}
                        placeholder="Zoek locatie..."
                      />
                    </div>
                    <Input
                      placeholder="Beschrijving"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    />
                    <div className="grid grid-cols-4 gap-3">
                      <Input
                        type="time"
                        value={newActivity.startTime}
                        onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
                      />
                      <Input
                        type="time"
                        value={newActivity.endTime}
                        onChange={(e) => setNewActivity({ ...newActivity, endTime: e.target.value })}
                      />
                      <Select
                        value={newActivity.category}
                        onValueChange={(value) => setNewActivity({ ...newActivity, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sightseeing">Bezienswaardigheden</SelectItem>
                          <SelectItem value="food">Eten & Drinken</SelectItem>
                          <SelectItem value="transport">Transport</SelectItem>
                          <SelectItem value="shopping">Winkelen</SelectItem>
                          <SelectItem value="accommodation">Overnachting</SelectItem>
                          <SelectItem value="culture">Cultuur</SelectItem>
                          <SelectItem value="nature">Natuur</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Kosten"
                        value={newActivity.cost || ""}
                        onChange={(e) => setNewActivity({ ...newActivity, cost: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Toevoegen</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowAddActivity(null)}>
                        Annuleren
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        ))}

      {trip?.days.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nog geen dagen gepland. Voeg je eerste dag toe!
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddDay} onOpenChange={setShowAddDay}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dag Toevoegen</DialogTitle>
          </DialogHeader>
          <form onSubmit={addDay} className="space-y-4">
            <div className="space-y-2">
              <Label>Datum</Label>
              <Input
                type="date"
                value={newDay.date}
                onChange={(e) => setNewDay({ ...newDay, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                placeholder="Bijv. Stadsverkenning"
                value={newDay.title}
                onChange={(e) => setNewDay({ ...newDay, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Notities</Label>
              <Textarea
                placeholder="Optionele notities voor deze dag"
                value={newDay.notes}
                onChange={(e) => setNewDay({ ...newDay, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">Toevoegen</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddDay(false)}>
                Annuleren
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
