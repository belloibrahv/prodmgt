"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { addProjectMember } from "@/lib/actions/projects";
import type { WorkspaceMember } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  workspaceMembers: WorkspaceMember[];
  currentMemberIds: string[];
}

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

export default function InviteMemberModal({ open, onClose, projectId, workspaceMembers, currentMemberIds }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Filter out members who are already in the project
  const availableMembers = workspaceMembers.filter(m => !currentMemberIds.includes(m.id));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    startTransition(async () => {
      const res = await addProjectMember(projectId, fd);
      if (res.success) {
        toast.success("Member added successfully!");
        onClose();
        form.reset();
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
      title="Add Team Member"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" form="invite-member-form" loading={pending}>Add Member</Button>
        </>
      }
    >
      <form id="invite-member-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {availableMembers.length === 0 ? (
          <p className="text-[12px] text-tva-ink-m -mt-1 mb-2">
            All workspace members are already in this project. Invite more team members to the workspace first.
          </p>
        ) : (
          <>
            <p className="text-[12px] text-tva-ink-m -mt-1 mb-2">
              Select a team member from your workspace to add to this project.
            </p>
            <Select
              name="userId"
              label="Team member"
              options={[
                { value: "", label: "Select a member..." },
                ...availableMembers.map(m => ({ value: m.id, label: `${m.name || m.email} (${m.email})` })),
              ]}
              required
            />
            <Select name="role" label="Role" options={ROLES} defaultValue="MEMBER" />
          </>
        )}
      </form>
    </Modal>
  );
}
