"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/AppShell";
import { createTask } from "@/lib/actions/tasks";
import type { Milestone } from "@prisma/client";
import type { WorkspaceMember } from "@/types";

export interface ProjectOption {
  id: string;
  name: string;
  emoji: string;
  milestones?: Milestone[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Fixed project. Leave empty and pass `projects` to let the user choose. */
  projectId?: string;
  projects?: ProjectOption[];
  members?: WorkspaceMember[];
  milestones?: Milestone[];
  defaultStatus?: string;
}

export const STATUS_OPTIONS = [
  { value: "BACKLOG", label: "Backlog" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Blocked" },
];

export const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export default function NewTaskModal({
  open, onClose, projectId, projects = [], members, milestones, defaultStatus = "TODO",
}: Props) {
  const router = useRouter();
  const workspace = useWorkspace();
  const [pending, startTransition] = useTransition();
  const [chosenProject, setChosenProject] = useState(projectId ?? projects[0]?.id ?? "");
  const [formKey, setFormKey] = useState(0);

  // Re-sync the chosen project whenever the modal opens.
  useEffect(() => {
    if (open) setChosenProject(projectId ?? projects[0]?.id ?? "");
  }, [open, projectId, projects]);

  const targetProject = projectId ?? chosenProject;
  const projectMilestones = milestones ?? projects.find((p) => p.id === targetProject)?.milestones ?? [];
  const people = members ?? workspace.members;

  function submit(form: HTMLFormElement, keepOpen: boolean) {
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createTask(targetProject, fd);
      if (!res.success) { toast.error(res.error); return; }
      toast.success("Task created");
      router.refresh();
      if (keepOpen) {
        setFormKey((k) => k + 1);
      } else {
        onClose();
      }
    });
  }

  if (!projectId && projects.length === 0) {
    return (
      <Modal open={open} onClose={onClose} title="Add task" size="sm">
        <p className="text-sm text-muted-foreground">Create a project first. Every task belongs to a project.</p>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add task"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button
            variant="outline"
            type="button"
            disabled={pending}
            onClick={() => {
              const form = document.getElementById("new-task-form") as HTMLFormElement | null;
              if (form?.reportValidity()) submit(form, true);
            }}
          >
            Create & add another
          </Button>
          <Button type="submit" form="new-task-form" loading={pending}>Create task</Button>
        </>
      }
    >
      <form
        key={formKey}
        id="new-task-form"
        onSubmit={(e) => { e.preventDefault(); submit(e.currentTarget, false); }}
        className="flex flex-col gap-4"
      >
        {!projectId && (
          <Select
            label="Project"
            value={chosenProject}
            onChange={(e) => setChosenProject(e.target.value)}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />
        )}

        <Input name="title" label="Task title" placeholder="What needs to be done?" required autoFocus />
        <Textarea name="description" label="Description" placeholder="Add more context…" />

        <div className="grid grid-cols-2 gap-3">
          <Select name="status" label="Status" defaultValue={defaultStatus} options={STATUS_OPTIONS} />
          <Select name="priority" label="Priority" defaultValue="MEDIUM" options={PRIORITY_OPTIONS} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select name="assigneeId" label="Assignee" defaultValue={workspace.currentUserId} options={[
            { value: "", label: "Unassigned" },
            ...people.map((m) => ({ value: m.id, label: m.name ?? m.email })),
          ]} />
          <Input name="dueDate" label="Due date" type="date" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {projectMilestones.length > 0 ? (
            <Select key={targetProject} name="milestoneId" label="Milestone" options={[
              { value: "", label: "None" },
              ...projectMilestones.map((m) => ({ value: m.id, label: m.name })),
            ]} />
          ) : <div />}
          <Input name="estimate" label="Estimate (hours)" type="number" min="0" step="0.5" placeholder="0" />
        </div>
      </form>
    </Modal>
  );
}
