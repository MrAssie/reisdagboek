# Budget, Activity Editing & Itinerary Map — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add budget item management (edit/delete), activity edit dialog, and an integrated route map to the itinerary page — replacing the standalone /map and /places pages.

**Architecture:** Extend existing API routes for budget CRUD, add a Dialog-based edit flow for activities reusing the existing PUT endpoint, and embed the MapView component in a split-layout itinerary page with polyline route rendering.

**Tech Stack:** Next.js 16, Prisma, shadcn/ui (Dialog, Input, Select, etc.), Google Maps JS API (polyline), @hello-pangea/dnd

---

### Task 1: Budget API — PUT and DELETE endpoints

**Files:**
- Create: `src/app/api/budget/[id]/route.ts`

**Step 1: Create the budget item PUT/DELETE route**

Create `src/app/api/budget/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const item = await prisma.budgetItem.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        amount: body.amount,
        currency: body.currency,
        paid: body.paid,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Failed to update budget item:", error);
    return NextResponse.json({ error: "Failed to update budget item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.budgetItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete budget item:", error);
    return NextResponse.json({ error: "Failed to delete budget item" }, { status: 500 });
  }
}
```

**Step 2: Verify the dev server starts without errors**

Run: `npm run dev` and check no compilation errors.

**Step 3: Commit**

```bash
git add src/app/api/budget/[id]/route.ts
git commit -m "feat: add PUT/DELETE API routes for budget items"
```

---

### Task 2: Budget UI in itinerary page

**Files:**
- Modify: `src/app/itinerary/page.tsx`

This task adds a collapsible budget section at the top of the itinerary page with:
- BudgetBar showing total spent vs budget
- Edit button to change totalBudget via the existing `PUT /api/trips/[id]` endpoint
- List of budget items with inline paid-checkbox, edit & delete
- Add budget item form
- Uses the new `PUT /DELETE /api/budget/[id]` from Task 1

**Step 1: Add budget state, types, and fetch logic**

In `src/app/itinerary/page.tsx`, add to the imports:

```typescript
import BudgetBar from "@/components/BudgetBar";
import { ChevronDown, ChevronUp, Pencil, Trash2, Check, Wallet } from "lucide-react";
```

Add interface after existing interfaces:

```typescript
interface BudgetItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  paid: boolean;
}
```

Add state inside `ItineraryContent`:

```typescript
const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
const [budgetExpanded, setBudgetExpanded] = useState(false);
const [showEditBudget, setShowEditBudget] = useState(false);
const [editBudgetTotal, setEditBudgetTotal] = useState(0);
const [showAddBudgetItem, setShowAddBudgetItem] = useState(false);
const [newBudgetItem, setNewBudgetItem] = useState({ name: "", category: "transport", amount: 0 });
const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);
```

Add fetch function:

```typescript
const fetchBudget = useCallback(async () => {
  if (!tripId) return;
  try {
    const res = await fetch(`/api/budget?tripId=${tripId}`);
    if (res.ok) {
      const data = await res.json();
      setBudgetItems(data.items);
    }
  } catch {
    console.error("Failed to fetch budget");
  }
}, [tripId]);
```

Call it in the existing useEffect alongside fetchTrip:

```typescript
useEffect(() => {
  fetchTrip();
  fetchBudget();
}, [fetchTrip, fetchBudget]);
```

**Step 2: Add budget CRUD handler functions**

```typescript
async function updateTotalBudget(e: React.FormEvent) {
  e.preventDefault();
  if (!tripId) return;
  try {
    const res = await fetch(`/api/trips/${tripId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalBudget: editBudgetTotal }),
    });
    if (res.ok) {
      setShowEditBudget(false);
      fetchTrip();
    }
  } catch {
    console.error("Failed to update budget");
  }
}

async function addBudgetItem(e: React.FormEvent) {
  e.preventDefault();
  if (!tripId) return;
  try {
    const res = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newBudgetItem, tripId, paid: false }),
    });
    if (res.ok) {
      setShowAddBudgetItem(false);
      setNewBudgetItem({ name: "", category: "transport", amount: 0 });
      fetchBudget();
    }
  } catch {
    console.error("Failed to add budget item");
  }
}

async function updateBudgetItem(e: React.FormEvent) {
  e.preventDefault();
  if (!editingBudgetItem) return;
  try {
    const res = await fetch(`/api/budget/${editingBudgetItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingBudgetItem),
    });
    if (res.ok) {
      setEditingBudgetItem(null);
      fetchBudget();
    }
  } catch {
    console.error("Failed to update budget item");
  }
}

async function deleteBudgetItem(id: string) {
  try {
    const res = await fetch(`/api/budget/${id}`, { method: "DELETE" });
    if (res.ok) fetchBudget();
  } catch {
    console.error("Failed to delete budget item");
  }
}

async function toggleBudgetItemPaid(item: BudgetItem) {
  try {
    const res = await fetch(`/api/budget/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, paid: !item.paid }),
    });
    if (res.ok) fetchBudget();
  } catch {
    console.error("Failed to toggle paid status");
  }
}
```

**Step 3: Add budget section JSX**

Insert between the header div and the `<DragDropContext>` in the return JSX:

```tsx
{/* Budget Section */}
{trip && (
  <Card className="max-w-4xl">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setBudgetExpanded(!budgetExpanded)}
          className="flex items-center gap-2 text-left"
        >
          <Wallet className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Budget</h2>
          {budgetExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditBudgetTotal(trip.totalBudget);
            setShowEditBudget(true);
          }}
        >
          <Pencil className="w-3.5 h-3.5 mr-1" />
          Budget
        </Button>
      </div>

      <div className="mt-3">
        <BudgetBar
          spent={budgetItems.filter(i => i.paid).reduce((s, i) => s + i.amount, 0)}
          total={trip.totalBudget}
        />
      </div>

      {budgetExpanded && (
        <div className="mt-4 space-y-2">
          {budgetItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 group"
            >
              <button
                onClick={() => toggleBudgetItemPaid(item)}
                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                  item.paid
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-input"
                }`}
              >
                {item.paid && <Check className="w-3 h-3" />}
              </button>
              <span className={`flex-1 text-sm ${item.paid ? "line-through text-muted-foreground" : ""}`}>
                {item.name}
              </span>
              <Badge variant="secondary" className="text-xs">
                {item.category}
              </Badge>
              <span className="text-sm font-medium w-20 text-right">
                {item.amount.toLocaleString("nl-NL", { style: "currency", currency: item.currency || "EUR" })}
              </span>
              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                <button
                  onClick={() => setEditingBudgetItem({ ...item })}
                  className="p-1 rounded hover:bg-accent"
                >
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
                <button
                  onClick={() => deleteBudgetItem(item.id)}
                  className="p-1 rounded hover:bg-accent"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => setShowAddBudgetItem(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Item Toevoegen
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
)}
```

**Step 4: Add budget dialogs**

Add these dialogs before the closing `</div>` of the component (alongside existing dialogs):

Edit total budget dialog:
```tsx
<Dialog open={showEditBudget} onOpenChange={setShowEditBudget}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Budget Aanpassen</DialogTitle>
    </DialogHeader>
    <form onSubmit={updateTotalBudget} className="space-y-4">
      <div className="space-y-2">
        <Label>Totaal Budget</Label>
        <Input
          type="number"
          value={editBudgetTotal || ""}
          onChange={(e) => setEditBudgetTotal(Number(e.target.value))}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">Opslaan</Button>
        <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditBudget(false)}>
          Annuleren
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
```

Add budget item dialog:
```tsx
<Dialog open={showAddBudgetItem} onOpenChange={setShowAddBudgetItem}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Budget Item Toevoegen</DialogTitle>
    </DialogHeader>
    <form onSubmit={addBudgetItem} className="space-y-4">
      <div className="space-y-2">
        <Label>Naam</Label>
        <Input
          placeholder="Bijv. Vliegtickets"
          value={newBudgetItem.name}
          onChange={(e) => setNewBudgetItem({ ...newBudgetItem, name: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Categorie</Label>
          <Select
            value={newBudgetItem.category}
            onValueChange={(v) => setNewBudgetItem({ ...newBudgetItem, category: v })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="accommodation">Overnachting</SelectItem>
              <SelectItem value="food">Eten & Drinken</SelectItem>
              <SelectItem value="activities">Activiteiten</SelectItem>
              <SelectItem value="shopping">Winkelen</SelectItem>
              <SelectItem value="other">Overig</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Bedrag</Label>
          <Input
            type="number"
            placeholder="0"
            value={newBudgetItem.amount || ""}
            onChange={(e) => setNewBudgetItem({ ...newBudgetItem, amount: Number(e.target.value) })}
            required
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">Toevoegen</Button>
        <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddBudgetItem(false)}>
          Annuleren
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
```

Edit budget item dialog:
```tsx
<Dialog open={!!editingBudgetItem} onOpenChange={() => setEditingBudgetItem(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Budget Item Bewerken</DialogTitle>
    </DialogHeader>
    {editingBudgetItem && (
      <form onSubmit={updateBudgetItem} className="space-y-4">
        <div className="space-y-2">
          <Label>Naam</Label>
          <Input
            value={editingBudgetItem.name}
            onChange={(e) => setEditingBudgetItem({ ...editingBudgetItem, name: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Categorie</Label>
            <Select
              value={editingBudgetItem.category}
              onValueChange={(v) => setEditingBudgetItem({ ...editingBudgetItem, category: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="accommodation">Overnachting</SelectItem>
                <SelectItem value="food">Eten & Drinken</SelectItem>
                <SelectItem value="activities">Activiteiten</SelectItem>
                <SelectItem value="shopping">Winkelen</SelectItem>
                <SelectItem value="other">Overig</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bedrag</Label>
            <Input
              type="number"
              value={editingBudgetItem.amount || ""}
              onChange={(e) => setEditingBudgetItem({ ...editingBudgetItem, amount: Number(e.target.value) })}
              required
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">Opslaan</Button>
          <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingBudgetItem(null)}>
            Annuleren
          </Button>
        </div>
      </form>
    )}
  </DialogContent>
</Dialog>
```

**Step 5: Add Trip interface totalBudget field**

Update the Trip interface in `src/app/itinerary/page.tsx` to include `totalBudget`:

```typescript
interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  days: Day[];
}
```

**Step 6: Verify budget section renders and functions correctly**

Run: `npm run dev`, navigate to itinerary page with a trip, verify budget section shows.

**Step 7: Commit**

```bash
git add src/app/itinerary/page.tsx
git commit -m "feat: add budget management section to itinerary page"
```

---

### Task 3: Activity edit dialog

**Files:**
- Modify: `src/app/itinerary/page.tsx`
- Modify: `src/components/ActivityCard.tsx`

**Step 1: Add `onEdit` prop to ActivityCard**

In `src/components/ActivityCard.tsx`, update the interface and component:

```typescript
interface ActivityCardProps {
  activity: Activity;
  onDelete?: () => void;
  onEdit?: () => void;
}
```

Update the component signature:
```typescript
export default function ActivityCard({ activity, onDelete, onEdit }: ActivityCardProps)
```

Add `Pencil` to lucide-react imports. Add an edit button next to the delete button (inside the `justify-between` div):

```tsx
<div className="flex gap-0.5 shrink-0">
  {onEdit && (
    <button
      onClick={onEdit}
      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all p-0.5 rounded"
      title="Bewerken"
    >
      <Pencil className="w-3.5 h-3.5" />
    </button>
  )}
  {onDelete && (
    <button
      onClick={onDelete}
      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-0.5 rounded"
      title="Verwijderen"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  )}
</div>
```

**Step 2: Add edit activity state and handlers in itinerary page**

In `src/app/itinerary/page.tsx`, add state:

```typescript
const [editingActivity, setEditingActivity] = useState<(Activity & { dayId: string }) | null>(null);
```

Update the Activity interface to include all editable fields needed for the form:

```typescript
interface Activity {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  placeId: string | null;
  startTime: string | null;
  endTime: string | null;
  category: string;
  cost: number;
  currency: string;
  order: number;
}
```

Add handler:

```typescript
async function updateActivity(e: React.FormEvent) {
  e.preventDefault();
  if (!editingActivity) return;
  try {
    const res = await fetch(`/api/activities/${editingActivity.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingActivity),
    });
    if (res.ok) {
      setEditingActivity(null);
      fetchTrip();
    }
  } catch {
    console.error("Failed to update activity");
  }
}
```

**Step 3: Pass onEdit to ActivityCard**

In both list view and kanban view, update the ActivityCard usage to include `onEdit`:

```tsx
<ActivityCard
  activity={activity}
  onDelete={() => deleteActivity(activity.id)}
  onEdit={() => setEditingActivity({ ...activity, dayId: day.id })}
/>
```

Note: The `activity` object from the trip fetch may not include `address`, `latitude`, `longitude`, `placeId`. Update the trip GET API to include those fields, or update the Trip fetch includes. Check `src/app/api/trips/[id]/route.ts` — it uses `include: { activities: { orderBy: { order: "asc" } } }` which includes all fields by default in Prisma. So the data is there, we just need to update the TypeScript interface.

**Step 4: Add edit activity dialog**

Add this Dialog alongside the other dialogs:

```tsx
<Dialog open={!!editingActivity} onOpenChange={() => setEditingActivity(null)}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Activiteit Bewerken</DialogTitle>
    </DialogHeader>
    {editingActivity && (
      <form onSubmit={updateActivity} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Naam</Label>
            <Input
              value={editingActivity.name}
              onChange={(e) => setEditingActivity({ ...editingActivity, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Locatie</Label>
            <PlacesAutocomplete
              value={editingActivity.location || ""}
              onChange={(value) => setEditingActivity({ ...editingActivity, location: value })}
              onPlaceSelect={(place) => setEditingActivity({
                ...editingActivity,
                location: place.name,
                address: place.address,
                latitude: place.latitude,
                longitude: place.longitude,
                placeId: place.placeId,
              })}
              placeholder="Zoek locatie..."
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Beschrijving</Label>
          <Input
            value={editingActivity.description || ""}
            onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Starttijd</Label>
            <Input
              type="time"
              value={editingActivity.startTime || ""}
              onChange={(e) => setEditingActivity({ ...editingActivity, startTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Eindtijd</Label>
            <Input
              type="time"
              value={editingActivity.endTime || ""}
              onChange={(e) => setEditingActivity({ ...editingActivity, endTime: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Categorie</Label>
            <Select
              value={editingActivity.category}
              onValueChange={(value) => setEditingActivity({ ...editingActivity, category: value })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
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
          </div>
          <div className="space-y-2">
            <Label>Kosten</Label>
            <Input
              type="number"
              value={editingActivity.cost || ""}
              onChange={(e) => setEditingActivity({ ...editingActivity, cost: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1">Opslaan</Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1"
            onClick={() => {
              deleteActivity(editingActivity.id);
              setEditingActivity(null);
            }}
          >
            Verwijderen
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingActivity(null)}>
            Annuleren
          </Button>
        </div>
      </form>
    )}
  </DialogContent>
</Dialog>
```

**Step 5: Verify edit dialog opens and saves**

Run: `npm run dev`, open itinerary, hover over an activity, click edit icon, change a field, save.

**Step 6: Commit**

```bash
git add src/components/ActivityCard.tsx src/app/itinerary/page.tsx
git commit -m "feat: add activity edit dialog with location picker"
```

---

### Task 4: Integrated route map in itinerary

**Files:**
- Modify: `src/app/itinerary/page.tsx`
- Modify: `src/components/MapView.tsx` (add polyline support)

**Step 1: Add polyline support to MapView**

In `src/components/MapView.tsx`, add a `showRoute` prop:

```typescript
interface MapViewProps {
  markers?: Marker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (marker: Marker) => void;
  showRoute?: boolean;
}
```

Update the component signature to include `showRoute = false`.

Add a polylineRef:
```typescript
const polylineRef = useRef<google.maps.Polyline | null>(null);
```

In the markers useEffect (the second one), after the markers forEach loop and before the fitBounds logic, add:

```typescript
// Draw route polyline
if (polylineRef.current) {
  polylineRef.current.setMap(null);
  polylineRef.current = null;
}

if (showRoute && markers.length > 1) {
  const path = markers.map((m) => ({ lat: m.lat, lng: m.lng }));
  polylineRef.current = new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: "#18181b",
    strokeOpacity: 0.6,
    strokeWeight: 2,
    map,
  });
}
```

Add `showRoute` to the useEffect dependency array.

**Step 2: Change itinerary layout to split-view**

In `src/app/itinerary/page.tsx`, wrap the existing content in a split layout.

The main content area (after the header, starting from budget section through DragDropContext) gets wrapped in a flex container:

```tsx
<div className="flex gap-6 flex-1 min-h-0">
  {/* Left side: existing budget + day list/kanban */}
  <div className="flex-1 overflow-y-auto space-y-6">
    {/* Budget section (from Task 2) */}
    {/* DragDropContext section */}
    {/* Empty state */}
  </div>

  {/* Right side: Map */}
  {trip && (
    <div className="w-[400px] shrink-0 sticky top-0">
      <div className="h-[calc(100vh-12rem)] rounded-xl overflow-hidden border">
        <MapView
          markers={mapMarkers}
          showRoute={true}
          zoom={6}
        />
      </div>
    </div>
  )}
</div>
```

Compute `mapMarkers` from all activities across all days:

```typescript
const mapMarkers = sortedDays.flatMap((day) =>
  day.activities
    .slice()
    .sort((a, b) => a.order - b.order)
    .filter((a) => a.latitude && a.longitude)
    .map((a) => ({
      id: a.id,
      lat: a.latitude!,
      lng: a.longitude!,
      title: a.name,
      category: a.category,
    }))
);
```

Add MapView import:
```typescript
import MapView from "@/components/MapView";
```

**Step 3: Update the outer layout**

Change the outer wrapper from:
```tsx
<div className="p-8 mx-auto space-y-6 max-w-[1400px]">
```
to:
```tsx
<div className="p-8 mx-auto space-y-6 max-w-[1600px] flex flex-col h-full">
```

This ensures the split layout can use available height.

**Step 4: Verify map shows with route polyline**

Run: `npm run dev`, open itinerary with activities that have locations. Verify map shows markers and route line.

**Step 5: Commit**

```bash
git add src/components/MapView.tsx src/app/itinerary/page.tsx
git commit -m "feat: add integrated route map to itinerary split-view"
```

---

### Task 5: Remove /map and /places pages, update sidebar

**Files:**
- Delete: `src/app/map/page.tsx`
- Delete: `src/app/places/page.tsx`
- Delete: `src/components/PlacesSearch.tsx`
- Modify: `src/components/Sidebar.tsx`

**Step 1: Update sidebar navigation**

In `src/components/Sidebar.tsx`, remove the map and places nav items:

```typescript
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/itinerary", label: "Itinerary", icon: CalendarDays },
];
```

Remove unused imports `Map` and `MapPin` from lucide-react.

**Step 2: Delete map and places pages**

```bash
rm src/app/map/page.tsx
rm src/app/places/page.tsx
rm src/components/PlacesSearch.tsx
```

Keep `src/app/api/places/search/route.ts` — it may be useful later.

**Step 3: Verify no broken links or imports**

Run: `npm run dev` and check for compilation errors. Navigate through the app.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove standalone map/places pages, simplify sidebar"
```

---

### Task 6: Final verification and cleanup

**Step 1: Full smoke test**

1. Go to dashboard, create a trip if none exists
2. Go to itinerary — verify budget section shows with BudgetBar
3. Add a budget item, verify it appears in the list
4. Edit a budget item, verify changes persist
5. Toggle paid status, verify bar updates
6. Delete a budget item
7. Edit total budget
8. Add an activity with a Google Maps location
9. Click edit on an activity, change the name, save
10. Verify map shows markers and route polyline on the right
11. Verify sidebar only shows Dashboard and Itinerary

**Step 2: Commit any final fixes**

```bash
git add -A
git commit -m "chore: final cleanup after budget, edit & map features"
```
