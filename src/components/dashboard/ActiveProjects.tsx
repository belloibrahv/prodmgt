"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getProgressPercent } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ProjectWithRelations } from "@/types";

export default function ActiveProjects({ projects }: { projects: ProjectWithRelations[] }) {
  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-tva-border/60 rounded-20 overflow-hidden">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Active Projects</CardTitle>
          <Link 
            href="/projects" 
            className="text-xs font-medium text-tva-red hover:text-tva-red-dk flex items-center gap-1 transition-all duration-200 hover:gap-2"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="flex justify-center mb-3">
              <span className="text-4xl">📁</span>
            </div>
            <p className="text-sm text-tva-ink-m font-medium">No active projects yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-tva-border/30">
            {projects.map((p, index) => {
              const completed = p.tasks.filter(t => t.status === "DONE").length;
              const pct = getProgressPercent(completed, p.tasks.length);
              return (
                <motion.li 
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link
                    href={`/projects/${p.id}`}
                    className="flex items-center gap-4 px-6 py-4.5 hover:bg-gradient-to-r hover:from-tva-red-xlt hover:to-transparent transition-all duration-200 group border-b border-tva-border/30 last:border-0"
                  >
                    {/* Color indicator */}
                    <div 
                      className="w-2.5 h-16 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: p.color }}
                    />
                    {/* Icon + info */}
                    <div className="flex-shrink-0 drop-shadow-sm">
                      <span className="text-3xl">{p.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-tva-ink truncate group-hover:text-tva-red transition-colors leading-tight">
                        {p.name}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <ProgressBar value={pct} className="flex-1 h-2" />
                        <span className="text-xs font-semibold text-tva-ink-m w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-tva-ink-m font-medium">{p._count.tasks} tasks</span>
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
