"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { KANBAN_COLUMNS } from "@/lib/utils";
import TaskCard from "./TaskCard";
import type { TaskWithRelations } from "@/types";
import type { User } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  tasks: TaskWithRelations[];
  projectId: string;
  members?: Omit<User, "passwordHash">[];
  onAddTask?: (status: string) => void;
}

export default function KanbanBoard({ tasks, projectId, onAddTask }: Props) {
  const [localTasks, setLocalTasks] = useState<TaskWithRelations[]>(tasks);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDragStart(e: React.DragEvent, taskId: string) {
    setDragging(taskId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(colId);
  }

  function handleDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    if (!dragging) return;

    const task = localTasks.find((t) => t.id === dragging);
    if (!task || task.status === newStatus) {
      setDragging(null); setDragOver(null); return;
    }

    // Optimistic update
    setLocalTasks((prev) =>
      prev.map((t) => t.id === dragging ? { ...t, status: newStatus as never } : t)
    );
    setDragging(null);
    setDragOver(null);

    startTransition(async () => {
      const res = await updateTaskStatus(dragging, newStatus);
      if (!res.success) {
        toast.error(res.error);
        setLocalTasks(tasks); // revert
      }
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = localTasks.filter((t) => t.status === col.id);
        const isOver = dragOver === col.id;

        return (
          <div
            key={col.id}
            className={cn(
              "flex flex-col min-w-[270px] max-w-[270px] rounded-16 border transition-colors",
              isOver ? "border-tva-red/50 bg-tva-red-xlt" : "border-tva-border bg-tva-surface",
            )}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column header */}
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
                  className="text-tva-ink-m hover:text-tva-red transition-colors"
                  aria-label={`Add task to ${col.label}`}
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {/* Tasks */}
            <div className="flex flex-col gap-2 p-3 flex-1">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={() => { setDragging(null); setDragOver(null); }}
                  className={cn(
                    "cursor-grab active:cursor-grabbing",
                    dragging === task.id && "opacity-40",
                  )}
                >
                  <TaskCard task={task} />
                </div>
              ))}

              {/* Drop hint when dragging over empty col */}
              {isOver && colTasks.length === 0 && (
                <div className="flex-1 border-2 border-dashed border-tva-red/40 rounded-12 flex items-center justify-center min-h-[80px]">
                  <span className="text-[12px] text-tva-red/60">Drop here</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
