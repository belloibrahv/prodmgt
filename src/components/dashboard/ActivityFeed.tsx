"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelative } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import type { ActivityWithRelations } from "@/types";

export default function ActivityFeed({ activity }: { activity: ActivityWithRelations[] }) {
  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-tva-border/60 rounded-20 overflow-hidden">
      <CardHeader className="pb-4 px-6 pt-6">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activity.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="flex justify-center mb-3">
              <Activity size={48} className="text-tva-ink-m" />
            </div>
            <p className="text-sm text-tva-ink-m font-medium">No recent activity.</p>
          </div>
        ) : (
          <ul className="divide-y divide-tva-border/30">
            {activity.map((item, index) => (
              <motion.li 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-start gap-3 px-6 py-4.5 hover:bg-gradient-to-r hover:from-tva-red-xlt hover:to-transparent transition-all duration-200 group border-b border-tva-border/30 last:border-0"
              >
                <div className="relative flex-shrink-0">
                  <Avatar name={item.user.name} image={item.user.image} size="sm" className="mt-0.5" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-tva-success rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-tva-ink leading-relaxed">
                    <span className="font-semibold text-tva-ink">{item.user.name?.split(" ")[0]}</span>{" "}
                    <span className="text-tva-ink-m">{item.action}</span>
                    {item.detail && (
                      <span className="font-medium text-tva-red bg-tva-red-xlt px-1.5 py-0.5 rounded-4 ml-1">"{item.detail}"</span>
                    )}
                    {item.project && (
                      <span className="text-tva-ink-m"> in <span className="font-medium text-tva-ink">{item.project.name}</span></span>
                    )}
                  </p>
                  <p className="text-xs text-tva-ink-m mt-2 font-medium">{formatRelative(item.createdAt)}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
