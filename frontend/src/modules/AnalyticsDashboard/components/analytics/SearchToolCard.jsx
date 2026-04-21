import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const colorVariants = {
  primary: {
    bg: "bg-primary/15",
    cardBg: "bg-primary/10",
    icon: "text-primary",
    border: "border-primary/30",
    button: "bg-primary hover:bg-primary/90",
  },
  success: {
    bg: "bg-success/15",
    cardBg: "bg-success/10",
    icon: "text-success",
    border: "border-success/30",
    button: "bg-success hover:bg-success/90",
  },
  warning: {
    bg: "bg-warning/15",
    cardBg: "bg-warning/10",
    icon: "text-warning",
    border: "border-warning/30",
    button: "bg-warning hover:bg-warning/90",
  },
  info: {
    bg: "bg-info/15",
    cardBg: "bg-info/10",
    icon: "text-info",
    border: "border-info/30",
    button: "bg-info hover:bg-info/90",
  },
  secondary: {
    bg: "bg-secondary/15",
    cardBg: "bg-secondary/10",
    icon: "text-secondary",
    border: "border-secondary/30",
    button: "bg-secondary hover:bg-secondary/90",
  },
};

const SearchToolCard = ({ name, icon: Icon, searches, percentage, color = "primary" }) => {
  const colors = colorVariants[color] || colorVariants.primary;
  
  return (
    <Card className={`p-5 ${colors.cardBg} border-2 ${colors.border} shadow-card hover:shadow-elevated transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-12 w-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
        <span className="font-semibold text-foreground text-lg">{name}</span>
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-foreground">{searches}</p>
        <div className="flex items-center justify-between">
          <p className={`text-sm ${colors.icon} font-medium`}>{percentage} of total</p>
          <Button size="sm" className={`${colors.button} text-white`}>
            Search
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SearchToolCard;
