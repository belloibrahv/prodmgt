"use client";

import { FolderKanban, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import type { DashboardStats } from "@/types";
import { motion } from "framer-motion";

interface Props { stats: DashboardStats }

const cards = [
  {
    key: "totalProjects" as const,
    label: "Total Projects",
    icon: FolderKanban,
    bg: "bg-tva-red-lt",
    color: "text-tva-red",
    trend: (s: DashboardStats) => `${s.activeProjects} active`,
    trendColor: "text-tva-success",
  },
  {
    key: "completedProjects" as const,
    label: "Completed",
    icon: CheckCircle2,
    bg: "bg-tva-success-lt",
    color: "text-tva-success",
    trend: () => "On track",
    trendColor: "text-tva-success",
  },
  {
    key: "openTasks" as const,
    label: "Open Tasks",
    icon: Clock,
    bg: "bg-tva-info-lt",
    color: "text-tva-info",
    trend: (s: DashboardStats) => `${s.totalTasks} total`,
    trendColor: "text-tva-ink-m",
  },
  {
    key: "overdueTasks" as const,
    label: "Overdue Tasks",
    icon: AlertTriangle,
    bg: "bg-tva-error-lt",
    color: "text-tva-error",
    trend: (s: DashboardStats) => s.overdueTasks > 0 ? "Needs attention" : "All good",
    trendColor: (s: DashboardStats) => s.overdueTasks > 0 ? "text-tva-error" : "text-tva-success",
  },
];

export default function DashboardStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, bg, color, trend, trendColor }, index) => {
        const tc = typeof trendColor === "function" ? trendColor(stats) : trendColor;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white border border-tva-border/60 rounded-20 p-6 flex items-start gap-4 shadow-sm hover:shadow-lg hover:border-tva-red/30 transition-all duration-300 hover:-translate-y-1"
          >
            <motion.div 
              className={`w-11 h-11 rounded-12 ${bg} ${color} flex items-center justify-center flex-shrink-0`}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Icon size={22} />
            </motion.div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-medium text-tva-ink-m">{label}</span>
              <motion.span 
                className="text-3xl font-bold text-tva-ink leading-tight"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              >
                {stats[key]}
              </motion.span>
              <span className={`text-[11px] font-medium mt-0.5 ${tc}`}>{trend(stats)}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
