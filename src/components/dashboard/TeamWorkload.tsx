import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
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
    <Card>
      <CardHeader>
        <CardTitle>Team Workload</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-3">
        {sorted.length === 0 ? (
          <p className="text-center text-sm text-tva-ink-m py-4">No assignments yet.</p>
        ) : (
          sorted.map(([id, { name, image, count }]) => (
            <div key={id} className="flex items-center gap-3">
              <Avatar name={name} image={image} size="sm" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-tva-ink truncate">{name?.split(" ")[0]}</p>
                <ProgressBar value={(count / max) * 100} className="mt-1" />
              </div>
              <span className="text-[12px] font-bold text-tva-ink-m w-6 text-right flex-shrink-0">{count}</span>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
