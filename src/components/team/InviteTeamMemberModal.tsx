"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { inviteTeamMember } from "@/lib/actions/team";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InviteTeamMemberModal({ open, onClose }: Props) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    startTransition(async () => {
      const res = await inviteTeamMember(fd);
      if (res.success) {
        toast.success("Team member invited successfully!");
        onClose();
        form.reset();
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
          <Button type="submit" form="invite-team-form" loading={pending}>Send Invite</Button>
        </>
      }
    >
      <form id="invite-team-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-[12px] text-tva-ink-m -mt-1 mb-2">
          Add a new team member to your workspace. They will be able to join projects once invited.
        </p>
        <Input name="email" label="Email address" placeholder="colleague@company.com" type="email" required />
        <Input name="name" label="Full name (optional)" placeholder="John Doe" />
        <Input name="jobTitle" label="Job title (optional)" placeholder="Developer" />
      </form>
    </Modal>
  );
}
