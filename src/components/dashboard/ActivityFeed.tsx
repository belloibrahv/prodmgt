import { Activity } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelative } from "@/lib/utils";
import type { ActivityWithRelations } from "@/types";

export default function ActivityFeed({ activity }: { activity: ActivityWithRelations[] }) {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>What your team has been up to</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {activity.length === 0 ? (
          <Empty className="border-0 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Activity /></EmptyMedia>
              <EmptyTitle>No activity yet</EmptyTitle>
              <EmptyDescription>Updates to projects, meetings and decisions will appear here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="h-[360px]">
            <ol className="relative px-4">
              {activity.map((item, i) => (
                <li key={item.id} className="relative flex gap-3 pb-5 last:pb-1">
                  {/* Timeline connector */}
                  {i < activity.length - 1 && (
                    <span className="absolute top-8 bottom-0 left-[11px] w-px bg-border" aria-hidden />
                  )}
                  <Avatar name={item.user.name} image={item.user.image} size="xs" className="mt-0.5" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="leading-snug text-muted-foreground">
                      <span className="font-medium text-foreground">{item.user.name?.split(" ")[0] ?? "Someone"}</span>{" "}
                      {item.action}
                      {item.detail && <span className="font-medium text-foreground"> “{item.detail}”</span>}
                      {item.project && <> in <span className="font-medium text-foreground">{item.project.name}</span></>}
                    </p>
                    <time dateTime={new Date(item.createdAt).toISOString()} className="mt-0.5 block text-xs text-muted-foreground">
                      {formatRelative(item.createdAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
