"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        <div className="space-y-1 text-center">
          <h3 className="text-lg font-semibold">
            Loading...
          </h3>

          <p className="text-sm text-muted-foreground">
            Please wait while we load your data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}