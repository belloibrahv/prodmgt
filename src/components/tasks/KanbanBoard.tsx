"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { KANBAN_COLUMNS, STATUS_LABELS } from "@/lib/utils";
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
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px] -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = localTasks.filter((t) => t.status === col.id);
        const isOver = dragOver === col.id;

        return (
          <section
            key={col.id}
            aria-label={col.label}
            className={cn(
              "flex flex-col min-w-[272px] max-w-[272px] rounded-16 border transition-colors snap-start",
              isOver ? "border-tva-red/50 bg-tva-red-xlt" : "border-tva-border bg-tva-surface",
            )}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOver(col.id); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-16 border-b border-tva-border">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                <span className="text-[13px] font-semibold text-tva-ink">{col.label}</span>
                <span className="text-[11px] font-bold bg-tva-border/60 text-tva-ink-m rounded-full px-2 py-0.5">
                  {colTasks.length}
                </span>
              </div>
              {onAddTask && (
                <button
                  onClick={() => onAddTask(col.id)}
                  className="p-1 rounded-8 text-tva-ink-m hover:bg-tva-red-xlt hover:text-tva-red transition-colors"
                  aria-label={`Add task to ${col.label}`}
                >
                  <Plus size={15} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 p-3 flex-1">
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
                    "flex-1 min-h-[80px] rounded-12 border-2 border-dashed flex items-center justify-center text-[12px] transition-colors",
                    isOver ? "border-tva-red/40 text-tva-red/70" : "border-tva-border/70 text-tva-ink-m",
                    onAddTask && "hover:border-tva-red/40 hover:text-tva-red",
                  )}
                >
                  {isOver ? "Drop here" : onAddTask ? "+ Add a task" : "No tasks"}
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
