"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckSquare } from "lucide-react";
import { ReportFormValues } from "@/lib/validations/report";
import { parseNumberInput } from "@/lib/format";

export function DistributionCard() {
  const { control } = useFormContext<ReportFormValues>();

  return (
    <Card className="border-0 shadow-sm rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-red-500 flex items-center gap-2 text-sm font-bold tracking-wide">
          <CheckSquare className="w-4 h-4" />
          SC & MD
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Fulfillment PB Terakhir (%)</Label>
          <Controller
            control={control}
            name="fulfillmentPb"
            render={({ field }) => (
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                className="bg-background border-input"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Avg Fulfillment DC (%)</Label>
          <Controller
            control={control}
            name="avgFulfillmentDc"
            render={({ field }) => (
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                className="bg-background border-input"
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
