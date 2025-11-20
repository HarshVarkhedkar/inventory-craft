import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  gradient?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, gradient = "primary" }: StatCardProps) => {
  const gradientClasses = {
    primary: "from-primary to-primary/70",
    secondary: "from-secondary to-secondary/70",
    success: "from-success to-success/70",
    warning: "from-warning to-warning/70",
    accent: "from-accent to-accent/70",
  };

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 animate-scale-in">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <h3 className="text-3xl font-bold mt-2 text-foreground">{value}</h3>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
              gradientClasses[gradient as keyof typeof gradientClasses]
            } flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <span className={trend.positive ? "text-success" : "text-destructive"}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-muted/20 to-transparent rounded-tl-full" />
    </Card>
  );
};

export default StatCard;
