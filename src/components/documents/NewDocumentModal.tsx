"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createDocument } from "@/lib/actions/documents";

const DOC_TYPES = [
  { value: "PRD", label: "PRD" },
  { value: "SPEC", label: "Spec" },
  { value: "DESIGN", label: "Design" },
  { value: "MEETING_NOTES", label: "Meeting Notes" },
  { value: "REPORT", label: "Report" },
  { value: "OTHER", label: "Other" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export default function NewDocumentModal({ open, onClose, projectId, projectName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createDocument(projectId, fd);
      if (res.success) {
        toast.success("Document created!");
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
      title="New Document"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" form="new-doc-form" loading={pending}>Create Document</Button>
        </>
      }
    >
      <p className="text-[12px] text-tva-ink-m -mt-1 mb-2">
        Creating in <span className="font-semibold text-tva-ink">{projectName}</span>
      </p>
      <form id="new-doc-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input name="title" label="Document title" placeholder="e.g. API Specification v2" required />
        <Select name="type" label="Type" options={DOC_TYPES} />
        <Textarea name="content" label="Content" placeholder="Write your document content here (supports Markdown)..." />
      </form>
    </Modal>
  );
}
