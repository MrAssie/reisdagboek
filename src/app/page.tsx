"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Plane, Loader2 } from "lucide-react";

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
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mijn Reizen</h1>
          <p className="text-muted-foreground mt-1">
            Overzicht van al je reizen — verleden en toekomst
          </p>
        </div>
        <Button onClick={() => setShowNewTrip(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe Reis
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Totaal reizen</p>
            <p className="text-2xl font-bold">{trips.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Aankomende</p>
            <p className="text-2xl font-bold text-primary">{upcomingTrips.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Afgerond</p>
            <p className="text-2xl font-bold text-emerald-600">{pastTrips.length}</p>
          </CardContent>
        </Card>
      </div>

      {upcomingTrips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Aankomende Reizen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingTrips.map((trip) => (
              <Link key={trip.id} href={`/itinerary?tripId=${trip.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {trip.name}
                        </h3>
                        {trip.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {trip.description}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                        </p>
                      </div>
                      {trip.totalBudget > 0 && (
                        <Badge variant="secondary">
                          {trip.totalBudget.toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pastTrips.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h2 className="text-xl font-semibold">Eerdere Reizen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastTrips.map((trip) => (
              <Link key={trip.id} href={`/itinerary?tripId=${trip.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group opacity-75 hover:opacity-100 h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {trip.name}
                        </h3>
                        {trip.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {trip.description}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                        </p>
                      </div>
                      {trip.totalBudget > 0 && (
                        <Badge variant="outline">
                          {trip.totalBudget.toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {trips.length === 0 && (
        <Card className="text-center py-16">
          <CardContent>
            <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nog geen reizen</h3>
            <p className="text-muted-foreground mb-6">
              Begin met het plannen van je eerste reis!
            </p>
            <Button onClick={() => setShowNewTrip(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Reis
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showNewTrip} onOpenChange={setShowNewTrip}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe Reis</DialogTitle>
          </DialogHeader>
          <form onSubmit={createTrip} className="space-y-4">
            <div className="space-y-2">
              <Label>Naam</Label>
              <Input
                placeholder="Bijv. Roadtrip Italie"
                value={newTrip.name}
                onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Beschrijving</Label>
              <Textarea
                placeholder="Korte beschrijving van je reis"
                value={newTrip.description}
                onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start</Label>
                <Input
                  type="date"
                  value={newTrip.startDate}
                  onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Einde</Label>
                <Input
                  type="date"
                  value={newTrip.endDate}
                  onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <Input
                type="number"
                placeholder="2500"
                value={newTrip.totalBudget || ""}
                onChange={(e) => setNewTrip({ ...newTrip, totalBudget: Number(e.target.value) })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Aanmaken
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowNewTrip(false)}>
                Annuleren
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
