"use client";

import {
  CartesianGrid, Cell, LabelList, ReferenceArea, ReferenceLine, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import type { Health } from "@prisma/client";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { HEALTH } from "@/lib/business";

export interface PacePoint {
  id: string;
  title: string;
  /** Percent of the period elapsed. */
  elapsed: number;
  /** Percent of the way to the key results' targets. */
  progress: number;
  health: Health;
}

const config = { progress: { label: "Progress" } } satisfies ChartConfig;

/**
 * Each objective plotted by how much of its period has gone (x) against how far
 * it has got (y). The diagonal is "on pace": above it is ahead, below is behind.
 */
export default function PaceChart({ points, onSelect }: { points: PacePoint[]; onSelect?: (id: string) => void }) {
  const short = (t: string) => (t.length > 22 ? `${t.slice(0, 21)}…` : t);
  return (
    <ChartContainer config={config} className="aspect-auto h-[300px] w-full">
      <ScatterChart margin={{ top: 16, right: 24, bottom: 24, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        {/* Shade the region where an objective is falling behind the calendar. */}
        <ReferenceArea
          x1={0} x2={100} y1={0} y2={100}
          shape={({ x = 0, y = 0, width = 0, height = 0 }: { x?: number; y?: number; width?: number; height?: number }) => (
            <polygon points={`${x},${y + height} ${x + width},${y + height} ${x + width},${y}`} fill="var(--destructive)" fillOpacity={0.05} />
          )}
        />
        <ReferenceLine
          segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
          stroke="var(--muted-foreground)" strokeDasharray="5 4" strokeWidth={1.5}
          label={{ value: "On pace", position: "insideTopLeft", fill: "var(--muted-foreground)", fontSize: 11, offset: 12 }}
        />
        <XAxis
          type="number" dataKey="elapsed" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} unit="%"
          tickLine={false} axisLine={false} fontSize={11}
          label={{ value: "Time elapsed in period", position: "insideBottom", offset: -14, fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          type="number" dataKey="progress" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} unit="%"
          tickLine={false} axisLine={false} fontSize={11} width={44}
        />
        {/* Fixed marker size: area in px², so roughly an 8px radius. */}
        <ZAxis range={[200, 200]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ active, payload }) => {
            const p = active && payload?.[0]?.payload as PacePoint | undefined;
            if (!p) return null;
            const gap = Math.round(p.progress - p.elapsed);
            return (
              <div className="grid min-w-44 gap-1 rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
                <p className="font-medium text-foreground">{p.title}</p>
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: HEALTH[p.health].color }} />{HEALTH[p.health].label}
                </p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground tabular-nums">{Math.round(p.progress)}%</span> done with <span className="tabular-nums">{Math.round(p.elapsed)}%</span> of time gone</p>
                <p className="text-muted-foreground">{gap >= 0 ? `${gap} points ahead of pace` : `${-gap} points behind pace`}</p>
              </div>
            );
          }}
        />
        <Scatter data={points} onClick={(d: unknown) => onSelect?.((d as { payload?: PacePoint }).payload?.id ?? (d as PacePoint).id)} className="cursor-pointer">
          {points.map((p) => (
            <Cell key={p.id} fill={HEALTH[p.health].color} stroke="var(--card)" strokeWidth={2} />
          ))}
          {points.length <= 8 && (
            <LabelList dataKey="title" position="right" offset={10} formatter={(v: unknown) => short(String(v))} style={{ fontSize: 11, fill: "var(--foreground)" }} />
          )}
        </Scatter>
      </ScatterChart>
    </ChartContainer>
  );
}
