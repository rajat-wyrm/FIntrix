import { Card } from "../../components/ui/card";

const colorVariants = {
  primary: {
    bg: "bg-primary/15",
    cardBg: "bg-primary/10",
    icon: "text-primary",
    border: "border-primary/30",
  },
  success: {
    bg: "bg-success/15",
    cardBg: "bg-success/10",
    icon: "text-success",
    border: "border-success/30",
  },
  warning: {
    bg: "bg-warning/15",
    cardBg: "bg-warning/10",
    icon: "text-warning",
    border: "border-warning/30",
  },
  info: {
    bg: "bg-info/15",
    cardBg: "bg-info/10",
    icon: "text-info",
    border: "border-info/30",
  },
  secondary: {
    bg: "bg-secondary/15",
    cardBg: "bg-secondary/10",
    icon: "text-secondary",
    border: "border-secondary/30",
  },
};

const AnalyticsCard = ({ title, value, trend, icon: Icon, color = "primary" }) => {
  const colors = colorVariants[color] || colorVariants.primary;
  
  return (
    <Card className={`p-6 ${colors.cardBg} border-2 ${colors.border} shadow-card hover:shadow-elevated transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-black font-medium">{title}</p>
          <p className="text-3xl font-bold text-black mt-1">{value}</p>
          {trend && (
            <p className={`text-sm ${colors.icon} mt-2 font-medium`}>{trend}</p>
          )}
        </div>
        {Icon && (
          <div className={`h-14 w-14 ${colors.bg} rounded-2xl flex items-center justify-center`}>
            <Icon className={`h-7 w-7 ${colors.icon}`} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default AnalyticsCard;