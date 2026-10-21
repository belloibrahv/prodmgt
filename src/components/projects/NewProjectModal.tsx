"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ProjectIconPicker } from "@/components/projects/ProjectIconPicker";
import { DEFAULT_PROJECT_ICON, type ProjectIconKey } from "@/lib/project-icons";
import { createProject } from "@/lib/actions/projects";

const COLORS = ["#bc0004","#2563eb","#1da851","#f59e0b","#8b5cf6","#ec4899","#0891b2","#d97706"];

interface Props { open: boolean; onClose: () => void }

export default function NewProjectModal({ open, onClose }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [emoji, setEmoji] = useState<ProjectIconKey>(DEFAULT_PROJECT_ICON);
  const [color, setColor] = useState("#bc0004");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("emoji", emoji);
    fd.set("color", color);

    startTransition(async () => {
      const res = await createProject(fd);
      if (res.success) {
        toast.success("Project created!");
        onClose();
        router.push(`/projects/${res.data.id}`);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Project"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" form="new-project-form" loading={pending}>Create Project</Button>
        </>
      }
    >
      <form id="new-project-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Icon + Color */}
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Icon</label>
            <ProjectIconPicker value={emoji} color={color} onChange={setEmoji} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">Color</label>
            <div className="flex flex-wrap gap-1.5 max-w-[120px]">
              {COLORS.map((c) => (
                <button
                  key={c} type="button" onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-110"}`}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <Input name="name" label="Project name" placeholder="e.g. Client Portal v2" required />
        <Textarea name="description" label="Description" placeholder="What is this project about?" />

        <div className="grid grid-cols-2 gap-3">
          <Select name="status" label="Status" options={[
            { value: "PLANNING", label: "Planning" },
            { value: "ACTIVE", label: "Active" },
            { value: "ON_HOLD", label: "On Hold" },
          ]} />
          <Select name="priority" label="Priority" options={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
            { value: "CRITICAL", label: "Critical" },
          ]} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input name="startDate" label="Start date" type="date" />
          <Input name="dueDate" label="Due date" type="date" />
        </div>
      </form>
    </Modal>
  );
}
