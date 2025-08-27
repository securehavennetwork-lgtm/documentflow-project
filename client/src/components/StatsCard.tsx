import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  valueColor?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor, 
  valueColor = "text-gray-900" 
}: StatsCardProps) {
  return (
    <Card data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${valueColor}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-sm mt-1 text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 ${iconColor} rounded-xl flex items-center justify-center`}>
            <Icon className="text-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
