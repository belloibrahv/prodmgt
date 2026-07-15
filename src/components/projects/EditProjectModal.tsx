"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProject } from "@/lib/actions/projects";
import type { ProjectWithRelations } from "@/types";

const EMOJIS = [
  "📁", "🚀", "💡", "🏢", "📱", "🛒", "📊", "🎯", "⚙️", "🔬", "🎨", "📝",
];
const COLORS = ["#bc0004","#2563eb","#1da851","#f59e0b","#8b5cf6","#ec4899","#0891b2","#d97706"];

interface Props {
  open: boolean;
  onClose: () => void;
  project: ProjectWithRelations;
}

export default function EditProjectModal({ open, onClose, project }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [emoji, setEmoji] = useState(project.emoji || "📁");
  const [color, setColor] = useState(project.color);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("emoji", emoji);
    fd.set("color", color);

    startTransition(async () => {
      const res = await updateProject(project.id, fd);
      if (res.success) {
        toast.success("Project updated!");
        onClose();
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Project"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" form="edit-project-form" loading={pending}>Save Changes</Button>
        </>
      }
    >
      <form id="edit-project-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-tva-ink-m">Icon</label>
            <div className="flex flex-wrap gap-1.5 max-w-[160px]">
              {EMOJIS.map((e) => (
                <button
                  key={e} type="button" onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded-8 flex items-center justify-center transition-colors ${emoji === e ? "bg-tva-red-lt ring-2 ring-tva-red" : "bg-tva-surface hover:bg-tva-red-xlt"}`}
                >
                  <span className={emoji === e ? "text-2xl" : "text-2xl opacity-60"}>{e}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-tva-ink-m">Color</label>
            <div className="flex flex-wrap gap-1.5 max-w-[120px]">
              {COLORS.map((c) => (
                <button
                  key={c} type="button" onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-2 ring-tva-ink scale-110" : "hover:scale-110"}`}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <Input name="name" label="Project name" placeholder="e.g. Client Portal v2" required defaultValue={project.name} />
        <Textarea name="description" label="Description" placeholder="What is this project about?" defaultValue={project.description ?? ""} />

        <div className="grid grid-cols-2 gap-3">
          <Select name="status" label="Status" defaultValue={project.status} options={[
            { value: "PLANNING", label: "Planning" },
            { value: "ACTIVE", label: "Active" },
            { value: "ON_HOLD", label: "On Hold" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
          ]} />
          <Select name="priority" label="Priority" defaultValue={project.priority} options={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
            { value: "CRITICAL", label: "Critical" },
          ]} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input name="startDate" label="Start date" type="date" defaultValue={project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""} />
          <Input name="dueDate" label="Due date" type="date" defaultValue={project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : ""} />
        </div>
      </form>
    </Modal>
  );
}
