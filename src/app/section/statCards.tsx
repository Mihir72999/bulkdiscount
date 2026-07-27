import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            {icon}
          </div>

          <h3 className="font-medium">{title}</h3>
        </div>

        <p className="text-4xl font-bold">{value}</p>

        <p className="mt-2 text-sm text-muted-foreground">
          {subtitle}
        </p>

        <div className="mt-6 h-1 rounded-full bg-violet-500" />
      </CardContent>
    </Card>
  );
}