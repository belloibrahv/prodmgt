"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface TaskCompletionChartProps {
  data: Array<{ date: string; completed: number }>;
}

export default function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  if (!data || data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[200px] flex items-center justify-center text-tva-ink-m text-sm"
      >
        No task completion data available
      </motion.div>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    formattedDate: format(new Date(item.date), "MMM dd"),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="formattedDate"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value: any) => [`Completed: ${value}`, "Tasks"]}
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#bc0004"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, stroke: "#bc0004", strokeWidth: 2 }}
            animationDuration={1000}
            animationBegin={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
