"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createTask } from "@/lib/actions/tasks";
import type { Milestone, User } from "@prisma/client";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  members?: Omit<User, "passwordHash">[];
  milestones?: Milestone[];
  defaultStatus?: string;
}

export default function NewTaskModal({ open, onClose, projectId, members = [], milestones = [], defaultStatus = "TODO" }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createTask(projectId, fd);
      if (res.success) {
        toast.success("Task created!");
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
      title="Add New Task"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="new-task-form" loading={pending}>Create Task</Button>
        </>
      }
    >
      <form id="new-task-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input name="title" label="Task title" placeholder="What needs to be done?" required />
        <Textarea name="description" label="Description" placeholder="Add more context…" />

        <div className="grid grid-cols-2 gap-3">
          <Select name="status" label="Status" defaultValue={defaultStatus} options={[
            { value: "BACKLOG", label: "Backlog" },
            { value: "TODO", label: "To Do" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "IN_REVIEW", label: "In Review" },
          ]} />
          <Select name="priority" label="Priority" options={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
            { value: "CRITICAL", label: "Critical" },
          ]} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select name="assigneeId" label="Assignee" options={[
            { value: "", label: "Unassigned" },
            ...members.map((m) => ({ value: m.id, label: m.name ?? m.email })),
          ]} />
          {milestones.length > 0 && (
            <Select name="milestoneId" label="Milestone" options={[
              { value: "", label: "None" },
              ...milestones.map((m) => ({ value: m.id, label: m.name })),
            ]} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input name="dueDate" label="Due date" type="date" />
          <Input name="estimate" label="Estimate (hours)" type="number" min="0" placeholder="0" />
        </div>
      </form>
    </Modal>
  );
}
