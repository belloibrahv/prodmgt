"use client";

import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/lib/utils";
import type { DocumentWithRelations } from "@/types";
import { ProjectIcon } from "@/components/projects/ProjectIcon";

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
        <div className="flex flex-wrap gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Avatar name={doc.author.name} image={doc.author.image} size="sm" />
            <div>
              <p className="text-xs font-semibold text-foreground">{doc.author.name}</p>
              <p className="text-xs text-muted-foreground">Author</p>
            </div>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              {doc.project && <ProjectIcon icon={doc.project.emoji} color={doc.project.color} size="xs" />}
              {doc.project?.name}
            </p>
            <p className="text-xs text-muted-foreground">Project</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{doc.type.replace("_", " ")}</p>
            <p className="text-xs text-muted-foreground">Type</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{formatDate(doc.updatedAt)}</p>
            <p className="text-xs text-muted-foreground">Last updated</p>
          </div>
        </div>

        {/* Content rendered as simple markdown-like */}
        {doc.content ? (
          <div className="prose prose-sm max-w-none">
            {doc.content.split("\n").map((line, i) => {
              if (line.startsWith("# "))
                return <h1 key={i} className="text-xl font-bold text-foreground mt-3 mb-1">{line.slice(2)}</h1>;
              if (line.startsWith("## "))
                return <h2 key={i} className="text-base font-semibold text-foreground mt-3 mb-1">{line.slice(3)}</h2>;
              if (line.startsWith("### "))
                return <h3 key={i} className="text-sm font-semibold text-foreground mt-2 mb-0.5">{line.slice(4)}</h3>;
              if (line.startsWith("- "))
                return <li key={i} className="text-sm text-foreground ml-4 list-disc">{line.slice(2)}</li>;
              if (line.trim() === "")
                return <br key={i} />;
              return <p key={i} className="text-sm text-foreground leading-relaxed">{line}</p>;
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No content yet.</p>
        )}
      </div>
    </Modal>
  );
}
