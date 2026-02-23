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

const categoryConfig: Record<string, { icon: string; color: string }> = {
  sightseeing: { icon: "🏛️", color: "bg-cyan-50 text-cyan-700" },
  food: { icon: "🍽️", color: "bg-orange-50 text-orange-700" },
  transport: { icon: "🚌", color: "bg-blue-50 text-blue-700" },
  shopping: { icon: "🛍️", color: "bg-pink-50 text-pink-700" },
  accommodation: { icon: "🏨", color: "bg-purple-50 text-purple-700" },
  culture: { icon: "🎭", color: "bg-indigo-50 text-indigo-700" },
  nature: { icon: "🌿", color: "bg-green-50 text-green-700" },
};

interface ActivityCardProps {
  activity: Activity;
  onDelete?: () => void;
}

export default function ActivityCard({ activity, onDelete }: ActivityCardProps) {
  const config = categoryConfig[activity.category] || categoryConfig.sightseeing;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${config.color}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-travel-dark text-sm">
              {activity.name}
            </h4>
            {activity.description && (
              <p className="text-xs text-travel-gray mt-0.5">
                {activity.description}
              </p>
            )}
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm"
              title="Verwijderen"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-travel-gray">
          {activity.startTime && (
            <span>
              🕐 {activity.startTime}
              {activity.endTime && ` — ${activity.endTime}`}
            </span>
          )}
          {activity.location && <span>📍 {activity.location}</span>}
          {activity.cost > 0 && (
            <span className="font-medium text-travel-primary">
              {activity.cost.toLocaleString("nl-NL", { style: "currency", currency: activity.currency || "EUR" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
