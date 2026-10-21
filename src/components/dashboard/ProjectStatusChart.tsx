"use client";

import { Cell, Label, Pie, PieChart } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

// Fixed order so a status keeps its colour whatever else is present.
const config = {
  active:    { label: "Active",    color: "var(--chart-1)" },
  planning:  { label: "Planning",  color: "var(--chart-2)" },
  on_hold:   { label: "On hold",   color: "var(--chart-4)" },
  completed: { label: "Completed", color: "var(--chart-3)" },
  cancelled: { label: "Cancelled", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

type StatusKey = keyof typeof config;
const ORDER = Object.keys(config) as StatusKey[];

interface Props {
  data: Array<{ name: string; value: number }>;
}

export default function ProjectStatusChart({ data }: Props) {
  const rows = ORDER
    .map((key) => ({ key, value: data.find((d) => d.name === key)?.value ?? 0 }))
    .filter((r) => r.value > 0);
  const total = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Project status</CardTitle>
        <CardDescription>All projects you can access</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {total === 0 ? (
          <Empty className="flex-1 border-0 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon"><PieIcon /></EmptyMedia>
              <EmptyTitle>No projects yet</EmptyTitle>
              <EmptyDescription>Create a project to see its status here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <ChartContainer config={config} className="mx-auto aspect-square h-[170px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="key" hideLabel />} />
                <Pie
                  data={rows}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={rows.length > 1 ? 2 : 0}
                  cornerRadius={4}
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {rows.map((r) => <Cell key={r.key} fill={`var(--color-${r.key})`} />)}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox)) return null;
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-semibold">
                            {total}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">
                            {total === 1 ? "project" : "projects"}
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul className="grid gap-2 text-sm">
              {rows.map((r) => (
                <li key={r.key} className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: `var(--color-${r.key})` }} aria-hidden />
                  <span className="text-muted-foreground">{config[r.key].label}</span>
                  <span className="ml-auto font-medium tabular-nums">{r.value}</span>
                  <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                    {Math.round((r.value / total) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
