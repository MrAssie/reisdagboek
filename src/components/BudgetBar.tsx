interface BudgetBarProps {
  spent: number;
  total: number;
}

export default function BudgetBar({ spent, total }: BudgetBarProps) {
  const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
  const isOverBudget = spent > total;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-travel-gray">
          {spent.toLocaleString("nl-NL", { style: "currency", currency: "EUR" })} /{" "}
          {total.toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}
        </span>
        <span
          className={`font-medium ${
            isOverBudget ? "text-red-600" : percentage > 80 ? "text-amber-500" : "text-green-600"
          }`}
        >
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverBudget
              ? "bg-red-500"
              : percentage > 80
                ? "bg-amber-400"
                : "bg-travel-primary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isOverBudget && (
        <p className="text-xs text-red-500 font-medium">
          {(spent - total).toLocaleString("nl-NL", { style: "currency", currency: "EUR" })} over budget!
        </p>
      )}
    </div>
  );
}
