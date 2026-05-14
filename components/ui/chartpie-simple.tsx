"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  groceries: {
    label: "Groceries",
    color: "var(--chart-1)",
  },
  lpg: {
    label: "LPG",
    color: "var(--chart-2)",
  },
  pelumas: {
    label: "Pelumas",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

type CategoryData = {
  name: string
  value: number
  fill: string
}

export function ChartPieSimple({ data, className }: { data: CategoryData[]; className?: string }) {
  return (
    <Card className={`flex flex-col ${className ?? ""}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Penghasilan per Kategori</CardTitle>
        <CardDescription>7 hari terakhir</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Pie data={data} dataKey="value" nameKey="name" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
