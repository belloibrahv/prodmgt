"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import type { TaskWithRelations } from "@/types";

export default function TeamWorkload({ tasks }: { tasks: TaskWithRelations[] }) {
  // Count open tasks per assignee
  const workload: Record<string, { name: string | null; image: string | null; count: number }> = {};

  tasks
    .filter((t) => t.status !== "DONE" && t.assignee)
    .forEach((t) => {
      const id = t.assignee!.id;
      if (!workload[id]) workload[id] = { name: t.assignee!.name, image: t.assignee!.image ?? null, count: 0 };
      workload[id].count++;
    });

  const sorted = Object.entries(workload)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  const max = sorted[0]?.[1].count ?? 1;

  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-tva-border/60 rounded-20 overflow-hidden">
      <CardHeader className="pb-4 px-6 pt-6">
        <CardTitle className="text-base font-semibold">Team Workload</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {sorted.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="flex justify-center mb-3">
              <Users size={48} className="text-tva-ink-m" />
            </div>
            <p className="text-sm text-tva-ink-m font-medium">No assignments yet.</p>
          </div>
        ) : (
          sorted.map(([id, { name, image, count }], index) => (
            <motion.div 
              key={id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center gap-3 px-6 py-4 hover:bg-gradient-to-r hover:from-tva-red-xlt hover:to-transparent rounded-12 transition-all duration-200 group border-b border-tva-border/20 last:border-0"
            >
              <div className="relative flex-shrink-0">
                <Avatar name={name} image={image} size="sm" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-tva-red rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">{count}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-tva-ink truncate group-hover:text-tva-red transition-colors leading-tight">
                  {name?.split(" ")[0]}
                </p>
                <ProgressBar value={(count / max) * 100} className="mt-2.5 h-2" />
              </div>
              <div className="flex-shrink-0 ml-3">
                <span className="text-sm font-bold text-tva-ink-m">{count}</span>
                <span className="text-xs text-tva-ink-m ml-1">tasks</span>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
