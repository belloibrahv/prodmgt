"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { KANBAN_COLUMNS, STATUS_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import TaskCard from "./TaskCard";
import type { TaskWithRelations } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  tasks: TaskWithRelations[];
  onAddTask?: (status: string) => void;
}

export default function KanbanBoard({ tasks, onAddTask }: Props) {
  const router = useRouter();
  const [localTasks, setLocalTasks] = useState<TaskWithRelations[]>(tasks);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Pick up new, edited or filtered tasks from the server.
  useEffect(() => setLocalTasks(tasks), [tasks]);

  function moveTask(taskId: string, newStatus: string) {
    const task = localTasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const previous = localTasks;
    setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as never } : t)));

    startTransition(async () => {
      const res = await updateTaskStatus(taskId, newStatus);
      if (!res.success) {
        toast.error(res.error);
        setLocalTasks(previous);
        return;
      }
      toast.success(`Moved to ${STATUS_LABELS[newStatus]}`);
      router.refresh();
    });
  }

  function handleDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    if (dragging) moveTask(dragging, newStatus);
    setDragging(null);
    setDragOver(null);
  }

  return (
    <div className="-mx-4 flex min-h-[520px] snap-x gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = localTasks.filter((t) => t.status === col.id);
        const isOver = dragOver === col.id;

        return (
          <section
            key={col.id}
            aria-label={col.label}
            className={cn(
              "flex w-[280px] min-w-[280px] snap-start flex-col rounded-xl border transition-colors",
              isOver ? "border-primary/40 bg-accent" : "border-transparent bg-muted/60",
            )}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOver(col.id); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: col.color }} aria-hidden />
                <h2 className="text-sm font-medium">{col.label}</h2>
                <span className="text-xs tabular-nums text-muted-foreground">{colTasks.length}</span>
              </div>
              {onAddTask && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onAddTask(col.id)}
                  aria-label={`Add task to ${col.label}`}
                  className="text-muted-foreground"
                >
                  <Plus />
                </Button>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => { setDragging(task.id); e.dataTransfer.effectAllowed = "move"; }}
                  onDragEnd={() => { setDragging(null); setDragOver(null); }}
                  className={cn("cursor-grab active:cursor-grabbing", dragging === task.id && "opacity-40")}
                >
                  <TaskCard task={task} onMove={(status) => moveTask(task.id, status)} />
                </div>
              ))}

              {colTasks.length === 0 && (
                <button
                  type="button"
                  onClick={() => onAddTask?.(col.id)}
                  disabled={!onAddTask}
                  className={cn(
                    "flex min-h-[88px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed text-xs transition-colors",
                    isOver ? "border-primary/40 text-primary" : "border-border text-muted-foreground",
                    onAddTask && "hover:border-primary/30 hover:bg-card hover:text-foreground",
                  )}
                >
                  {isOver ? "Drop here" : onAddTask ? <><Plus className="size-3.5" aria-hidden /> Add a task</> : "No tasks"}
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
