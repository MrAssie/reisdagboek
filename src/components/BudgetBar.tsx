import { Progress } from "@/components/ui/progress";

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
        <span className="text-muted-foreground">
          {spent.toLocaleString("nl-NL", { style: "currency", currency: "EUR" })} /{" "}
          {total.toLocaleString("nl-NL", { style: "currency", currency: "EUR" })}
        </span>
        <span
          className={`font-medium ${
            isOverBudget ? "text-destructive" : percentage > 80 ? "text-amber-500" : "text-emerald-600"
          }`}
        >
          {percentage.toFixed(0)}%
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : percentage > 80 ? "[&>div]:bg-amber-400" : ""}`}
      />
      {isOverBudget && (
        <p className="text-xs text-destructive font-medium">
          {(spent - total).toLocaleString("nl-NL", { style: "currency", currency: "EUR" })} over budget!
        </p>
      )}
    </div>
  );
}
