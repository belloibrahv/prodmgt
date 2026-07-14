"use client";

import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";
import type { DocumentWithRelations } from "@/types";

interface Props {
  doc: DocumentWithRelations;
  open: boolean;
  onClose: () => void;
}

export default function DocumentViewModal({ doc, open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={doc.title} size="lg">
      <div className="flex flex-col gap-4">
        {/* Meta */}
        <div className="flex flex-wrap gap-4 pb-4 border-b border-tva-border">
          <div className="flex items-center gap-2">
            <Avatar name={doc.author.name} image={doc.author.image} size="sm" />
            <div>
              <p className="text-[12px] font-semibold text-tva-ink">{doc.author.name}</p>
              <p className="text-[11px] text-tva-ink-m">Author</p>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-tva-ink">{doc.project.emoji} {doc.project.name}</p>
            <p className="text-[11px] text-tva-ink-m">Project</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-tva-ink">{doc.type.replace("_", " ")}</p>
            <p className="text-[11px] text-tva-ink-m">Type</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-tva-ink">{formatDate(doc.updatedAt)}</p>
            <p className="text-[11px] text-tva-ink-m">Last updated</p>
          </div>
        </div>

        {/* Content rendered as simple markdown-like */}
        {doc.content ? (
          <div className="prose prose-sm max-w-none">
            {doc.content.split("\n").map((line, i) => {
              if (line.startsWith("# "))
                return <h1 key={i} className="text-xl font-bold text-tva-ink mt-3 mb-1">{line.slice(2)}</h1>;
              if (line.startsWith("## "))
                return <h2 key={i} className="text-base font-semibold text-tva-ink mt-3 mb-1">{line.slice(3)}</h2>;
              if (line.startsWith("### "))
                return <h3 key={i} className="text-[13px] font-semibold text-tva-ink mt-2 mb-0.5">{line.slice(4)}</h3>;
              if (line.startsWith("- "))
                return <li key={i} className="text-[13px] text-tva-ink ml-4 list-disc">{line.slice(2)}</li>;
              if (line.trim() === "")
                return <br key={i} />;
              return <p key={i} className="text-[13px] text-tva-ink leading-relaxed">{line}</p>;
            })}
          </div>
        ) : (
          <p className="text-sm text-tva-ink-m italic">No content yet.</p>
        )}
      </div>
    </Modal>
  );
}
