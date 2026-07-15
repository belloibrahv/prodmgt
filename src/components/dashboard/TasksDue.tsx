"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Clock, CheckCircle, Folder, Rocket, Lightbulb, Building, Smartphone, ShoppingCart, BarChart, Target, Settings, Microscope, Palette, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { getDueLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { TaskWithRelations } from "@/types";

export default function TasksDue({ tasks }: { tasks: TaskWithRelations[] }) {
  const upcoming = tasks
    .filter((t) => t.status !== "DONE" && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 8);

  const dueVariantClass: Record<string, string> = {
    overdue:  "text-tva-error bg-tva-error-lt",
    today:    "text-tva-warn bg-tva-warn-lt",
    tomorrow: "text-tva-info bg-tva-info-lt",
    upcoming: "text-tva-ink-m bg-tva-surface",
    none:     "text-tva-ink-m bg-tva-surface",
  };

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-tva-border/60 rounded-20 overflow-hidden">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Tasks Due</CardTitle>
          <Link 
            href="/tasks" 
            className="text-xs font-medium text-tva-red hover:text-tva-red-dk flex items-center gap-1 transition-all duration-200 hover:gap-2"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {upcoming.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="flex justify-center mb-3">
              <CheckCircle size={48} className="text-tva-ink-m" />
            </div>
            <p className="text-sm text-tva-ink-m font-medium">No upcoming deadlines.</p>
          </div>
        ) : (
          <ul className="divide-y divide-tva-border/30">
            {upcoming.map((task, index) => {
              const due = getDueLabel(task.dueDate);
              return (
                <motion.li 
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center gap-3 px-6 py-4.5 hover:bg-gradient-to-r hover:from-tva-red-xlt hover:to-transparent transition-all duration-200 group border-b border-tva-border/30 last:border-0"
                >
                  {/* Color indicator */}
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: task.project.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-tva-ink truncate group-hover:text-tva-red transition-colors leading-tight">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-tva-ink-m">{task.project.emoji}</span>
                      <span className="text-xs text-tva-ink-m font-medium">{task.project.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <PriorityBadge priority={task.priority} />
                    <span className={cn(
                      "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-8",
                      dueVariantClass[due.variant]
                    )}>
                      <Clock size={11} />
                      {due.label}
                    </span>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
