"use client";

import { useState } from "react";
import { FileText, FileCode, PenLine, FileBarChart2, BookOpen, File, Clock, User } from "lucide-react";
import { formatDate, formatRelative } from "@/lib/utils";
import DocumentViewModal from "./DocumentViewModal";
import type { DocumentWithRelations } from "@/types";

const DOC_ICONS: Record<string, React.ElementType> = {
  PRD:           PenLine,
  SPEC:          FileCode,
  DESIGN:        BookOpen,
  MEETING_NOTES: FileText,
  REPORT:        FileBarChart2,
  OTHER:         File,
};

const DOC_COLORS: Record<string, string> = {
  PRD:           "bg-tva-red-lt text-tva-red",
  SPEC:          "bg-tva-info-lt text-tva-info",
  DESIGN:        "bg-purple-100 text-purple-600",
  MEETING_NOTES: "bg-tva-warn-lt text-tva-warn",
  REPORT:        "bg-tva-success-lt text-tva-success",
  OTHER:         "bg-tva-surface text-tva-ink-m",
};

export default function ProjectDocuments({ documents }: { documents: DocumentWithRelations[] }) {
  const [selected, setSelected] = useState<DocumentWithRelations | null>(null);

  if (documents.length === 0) {
    return (
      <div className="bg-white border border-tva-border rounded-16 p-10 text-center shadow-sm">
        <FileText size={40} className="mx-auto text-tva-border mb-3" />
        <p className="text-[15px] font-semibold text-tva-ink">No documents yet</p>
        <p className="text-sm text-tva-ink-m mt-1">Add PRDs, specs, meeting notes and more.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {documents.map((doc) => {
          const Icon = DOC_ICONS[doc.type] ?? File;
          const colorClass = DOC_COLORS[doc.type] ?? DOC_COLORS.OTHER;
          return (
            <button
              key={doc.id}
              onClick={() => setSelected(doc)}
              className="bg-white border border-tva-border rounded-16 p-5 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`w-10 h-10 rounded-12 flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
                  {doc.type.replace("_", " ")}
                </span>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-tva-ink group-hover:text-tva-red transition-colors line-clamp-2">
                  {doc.title}
                </h3>
                {doc.content && (
                  <p className="text-[12px] text-tva-ink-m mt-1 line-clamp-2">
                    {doc.content.replace(/#+\s/g, "").slice(0, 120)}…
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-tva-ink-m pt-1 border-t border-tva-border/60 mt-auto">
                <span className="flex items-center gap-1">
                  <User size={11} /> {doc.author.name?.split(" ")[0]}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {formatRelative(doc.updatedAt)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <DocumentViewModal doc={selected} open={!!selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
