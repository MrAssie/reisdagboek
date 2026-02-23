import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

const categoryConfig: Record<string, { color: string; bgColor: string }> = {
  sightseeing: { color: "text-cyan-700", bgColor: "bg-cyan-50" },
  food: { color: "text-orange-700", bgColor: "bg-orange-50" },
  transport: { color: "text-blue-700", bgColor: "bg-blue-50" },
  shopping: { color: "text-pink-700", bgColor: "bg-pink-50" },
  accommodation: { color: "text-purple-700", bgColor: "bg-purple-50" },
  culture: { color: "text-indigo-700", bgColor: "bg-indigo-50" },
  nature: { color: "text-green-700", bgColor: "bg-green-50" },
};

const categoryLabels: Record<string, string> = {
  sightseeing: "Bezienswaardigheid",
  food: "Eten & Drinken",
  transport: "Transport",
  shopping: "Winkelen",
  accommodation: "Overnachting",
  culture: "Cultuur",
  nature: "Natuur",
};

interface ActivityCardProps {
  activity: Activity;
  onDelete?: () => void;
}

export default function ActivityCard({ activity, onDelete }: ActivityCardProps) {
  const config = categoryConfig[activity.category] || categoryConfig.sightseeing;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
      <div className={cn("w-9 h-9 rounded-md flex items-center justify-center text-sm font-medium shrink-0", config.bgColor, config.color)}>
        {categoryLabels[activity.category]?.[0] || "B"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-medium text-sm leading-tight truncate">
              {activity.name}
            </h4>
            {activity.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {activity.description}
              </p>
            )}
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-0.5 rounded shrink-0"
              title="Verwijderen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2.5 mt-1.5 text-xs text-muted-foreground flex-wrap">
          {activity.startTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activity.startTime}
              {activity.endTime && ` - ${activity.endTime}`}
            </span>
          )}
          {activity.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{activity.location}</span>
            </span>
          )}
          {activity.cost > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {activity.cost.toLocaleString("nl-NL", { style: "currency", currency: activity.currency || "EUR" })}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
