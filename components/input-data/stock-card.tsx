"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { ReportFormValues } from "@/lib/validations/report";

export function StockCard() {
  const { register } = useFormContext<ReportFormValues>();

  return (
    <Card className="border-0 shadow-sm rounded-xl">
      <CardHeader className="">
        <CardTitle className="text-red-500 flex items-center gap-2 text-sm font-bold tracking-wide">
          <Package className="w-4 h-4" />
          STOCK LPG
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">LPG 3 Kg</Label>
          <Input 
            type="number" 
            placeholder="0" 
            {...register("stockLpg3kg")} 
            className="bg-background border-input" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">LPG 5.5 Kg</Label>
          <Input 
            type="number" 
            placeholder="0" 
            {...register("stockLpg5kg")} 
            className="bg-background border-input" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">LPG 12 Kg</Label>
          <Input 
            type="number" 
            placeholder="0" 
            {...register("stockLpg12kg")} 
            className="bg-background border-input" 
          />
        </div>
      </CardContent>
    </Card>
  );
}
