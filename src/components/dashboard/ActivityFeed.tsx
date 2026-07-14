import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelative } from "@/lib/utils";
import type { ActivityWithRelations } from "@/types";

export default function ActivityFeed({ activity }: { activity: ActivityWithRelations[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardBody className="p-0">
        {activity.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-tva-ink-m">No recent activity.</p>
        ) : (
          <ul className="divide-y divide-tva-border/60">
            {activity.map((item) => (
              <li key={item.id} className="flex items-start gap-3 px-5 py-3">
                <Avatar name={item.user.name} image={item.user.image} size="sm" className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-tva-ink">
                    <span className="font-semibold">{item.user.name?.split(" ")[0]}</span>{" "}
                    {item.action}
                    {item.detail && (
                      <span className="font-medium text-tva-red"> &ldquo;{item.detail}&rdquo;</span>
                    )}
                    {item.project && (
                      <span className="text-tva-ink-m"> in {item.project.name}</span>
                    )}
                  </p>
                  <p className="text-[11px] text-tva-ink-m mt-0.5">{formatRelative(item.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
