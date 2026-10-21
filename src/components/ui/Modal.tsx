"use client";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = { sm: "sm:max-w-sm", md: "sm:max-w-lg", lg: "sm:max-w-2xl" };

/** App dialog: shadcn Dialog with a fixed header, scrolling body and optional footer. */
export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className={cn("flex max-h-[90vh] flex-col gap-0 p-0 shadow-xl", sizeClasses[size])}>
        <div className="shrink-0 border-b px-6 pt-5 pb-4 pr-12">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          {description && <DialogDescription className="mt-1">{description}</DialogDescription>}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex shrink-0 justify-end gap-2 rounded-b-xl border-t bg-muted/40 px-6 py-3">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
