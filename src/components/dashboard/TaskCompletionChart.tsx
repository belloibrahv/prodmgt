"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const config = {
  completed: { label: "Completed", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface Props {
  data: Array<{ date: string; completed: number }>;
}

export default function TaskCompletionChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.completed, 0);
  const last7 = data.slice(-7).reduce((sum, d) => sum + d.completed, 0);

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Tasks completed</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
        <CardAction className="text-right">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{total}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5" aria-hidden /> {last7} this week
          </p>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.22} />
                <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              tickFormatter={(v: string) => format(new Date(v), "MMM d")}
            />
            <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
            <ChartTooltip
              cursor
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(v) => format(new Date(String(v)), "EEE, MMM d")}
                />
              }
            />
            <Area
              dataKey="completed"
              type="monotone"
              stroke="var(--color-completed)"
              strokeWidth={2}
              fill="url(#fillCompleted)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
