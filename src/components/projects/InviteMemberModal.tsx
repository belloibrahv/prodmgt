"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { addProjectMember } from "@/lib/actions/projects";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

export default function InviteMemberModal({ open, onClose, projectId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await addProjectMember(projectId, fd);
      if (res.success) {
        toast.success("Member added successfully!");
        onClose();
        e.currentTarget.reset();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite Team Member"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" form="invite-member-form" loading={pending}>Add Member</Button>
        </>
      }
    >
      <form id="invite-member-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-[12px] text-tva-ink-m -mt-1 mb-2">
          Enter the email address of a team member who already has an account.
        </p>
        <Input name="email" label="Email address" placeholder="colleague@company.com" type="email" required />
        <Select name="role" label="Role" options={ROLES} defaultValue="MEMBER" />
      </form>
    </Modal>
  );
}
