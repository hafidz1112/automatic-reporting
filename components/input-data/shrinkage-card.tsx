"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { ReportFormValues } from "@/lib/validations/report";
import { formatRupiahInput, parseNumberInput } from "@/lib/format";

export function ShrinkageCard() {
  const { control } = useFormContext<ReportFormValues>();

  return (
    <Card className="border-0 shadow-sm rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-red-500 flex items-center gap-2 text-sm font-bold tracking-wide">
          <AlertTriangle className="w-4 h-4" />
          SHRINKAGE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Waste (Rp)</Label>
          <Controller
            control={control}
            name="waste"
            render={({ field }) => (
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatRupiahInput(field.value)}
                onChange={(e) => field.onChange(parseNumberInput(e.target.value))}
                className="bg-background border-input"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">Losses (Rp)</Label>
          <Controller
            control={control}
            name="losses"
            render={({ field }) => (
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatRupiahInput(field.value)}
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
