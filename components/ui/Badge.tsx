const SPORT_COLORS: Record<string, string> = {
  Run: "#16a34a",
  Ride: "#f97316",
  Swim: "#0ea5e9",
  WeightTraining: "#8b5cf6",
  NordicSki: "#06b6d4",
  Rowing: "#ec4899",
  Walk: "#84cc16",
};

const SPORT_LABELS: Record<string, string> = {
  Run: "Løp",
  Ride: "Sykkel",
  Swim: "Svøm",
  WeightTraining: "Styrke",
  NordicSki: "Ski",
  Rowing: "Roing",
  Walk: "Gå",
};

interface BadgeProps {
  sport: string;
  className?: string;
}

export function Badge({ sport, className = "" }: BadgeProps) {
  const color = SPORT_COLORS[sport] ?? "#78716c";
  const label = SPORT_LABELS[sport] ?? sport;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
