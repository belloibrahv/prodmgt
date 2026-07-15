"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface TeamWorkloadChartProps {
  data: Array<{ name: string; tasks: number }>;
}

export default function TeamWorkloadChart({ data }: TeamWorkloadChartProps) {
  if (!data || data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[200px] flex items-center justify-center text-tva-ink-m text-sm"
      >
        No workload data available
      </motion.div>
    );
  }

  const chartData = data.slice(0, 8).map(item => ({
    name: item.name.split(' ')[0], // Use first name only
    tasks: item.tasks,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: any) => [`${value} tasks`, "Assigned"]}
          />
          <Bar 
            dataKey="tasks" 
            fill="#2563eb" 
            radius={[0, 4, 4, 0]} 
            animationDuration={800}
            animationBegin={400}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
