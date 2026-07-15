"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { motion } from "framer-motion";

const COLORS = {
  active: "#bc0004",
  completed: "#1da851",
  on_hold: "#f59e0b",
  planning: "#2563eb",
};

interface ProjectStatusChartProps {
  data: Array<{ name: string; value: number }>;
}

export default function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[200px] flex items-center justify-center text-tva-ink-m text-sm"
      >
        No project data available
      </motion.div>
    );
  }

  const colorMap: Record<string, string> = {
    active: COLORS.active,
    completed: COLORS.completed,
    on_hold: COLORS.on_hold,
    planning: COLORS.planning,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
            animationDuration={800}
            animationBegin={200}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colorMap[entry.name] || "#94a3b8"} 
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-tva-ink capitalize">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
