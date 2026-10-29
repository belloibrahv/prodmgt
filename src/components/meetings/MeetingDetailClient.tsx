"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowDown, ArrowUp, CalendarClock, Check, ClipboardCopy, Clock, ExternalLink, History, Lock, LockOpen,
  MapPin, MessageCircleMore, MoreHorizontal, Pencil, Play, Plus, Printer, Repeat, Scale, Share2, Trash2,
  UserCheck, UserPlus, UserX, Video,
} from "lucide-react";
import toast from "react-hot-toast";
import type { MeetingItemKind } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useWorkspace } from "@/components/layout/AppShell";
import { ProjectIcon } from "@/components/projects/ProjectIcon";
import { HealthBadge, HealthBar, ToneBadge } from "@/components/business/primitives";
import { ActionList, AddActionForm } from "@/components/business/ActionItems";
import { toDateInput } from "@/components/business/fields";
import DecisionModal, { type DecisionDefaults } from "@/components/decisions/DecisionModal";
import MeetingItemModal from "./MeetingItemModal";
import EditMeetingModal from "./EditMeetingModal";
import NewMeetingModal from "./NewMeetingModal";
import {
  deleteMeeting, deleteMeetingItem, moveMeetingItem, setAttendance, setMeetingStatus, updateMeeting,
} from "@/lib/actions/meetings";
import { DECISION_STATUS, HEALTH, ITEM_KINDS, MEETING_STATUS, MEETING_TYPES, meetingPermissions } from "@/lib/business";
import type { ActionItemWithRelations, MeetingDetail, ProjectOption, StatusUpdateWithRelations } from "@/lib/business-queries";
import { groupMinutes, minutesAsText, reminderAsText } from "@/lib/minutes-text";
import { cn } from "@/lib/utils";

type Item = MeetingDetail["items"][number];

interface Props {
  meeting: MeetingDetail;
  projects: ProjectOption[];
  carriedForward: ActionItemWithRelations[];
  latestUpdates: Record<string, StatusUpdateWithRelations>;
}

export default function MeetingDetailClient({ meeting, projects, carriedForward, latestUpdates }: Props) {
  const router = useRouter();
  const { currentUserId, members } = useWorkspace();
  const [pending, startTransition] = useTransition();
  const [editingItem, setEditingItem] = useState<Item | null | undefined>(undefined);
  const [newItemKind, setNewItemKind] = useState<MeetingItemKind>("PROJECT_UPDATE");
  const [editingDetails, setEditingDetails] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [decisionFor, setDecisionFor] = useState<DecisionDefaults | null>(null);
  const [confirm, setConfirm] = useState<"finalise" | "delete" | null>(null);
  const [removingItem, setRemovingItem] = useState<Item | null>(null);

  const { canEdit, canReopen, isLead, locked } = meetingPermissions(meeting, currentUserId);
  const sections = groupMinutes(meeting.items);
  const followUpLabel = meeting.nextReviewAt ? `${format(new Date(meeting.nextReviewAt), "EEEE")} update` : "For the next review";
  const status = MEETING_STATUS[meeting.status];
  const looseActions = meeting.actionItems.filter((a) => !a.meetingItemId);

  // What the previous meeting asked each item's owner to bring to this one.
  const expected = new Map<string, string>();
  for (const prev of meeting.previous?.items ?? []) {
    if (!prev.followUp) continue;
    expected.set(prev.projectId ?? `title:${prev.title.toLowerCase()}`, prev.followUp);
  }
  const expectedFor = (i: Item) => expected.get(i.projectId ?? "") ?? expected.get(`title:${i.title.toLowerCase()}`);

  function run(fn: () => Promise<{ success: boolean; error?: string }>, ok?: string, after?: () => void) {
    startTransition(async () => {
      const res = await fn();
      if (res.success) { if (ok) toast.success(ok); after?.(); }
      else toast.error(res.error ?? "Something went wrong");
    });
  }

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copied. Paste it into the team's WhatsApp group.`);
    } catch {
      toast.error("Your browser blocked copying to the clipboard");
    }
  }

  const statusButton = (() => {
    if (meeting.status === "SCHEDULED" && canEdit) {
      return <Button onClick={() => run(() => setMeetingStatus(meeting.id, "IN_PROGRESS"), "Meeting started")} loading={pending}><Play /> Start meeting</Button>;
    }
    if (meeting.status === "IN_PROGRESS" && canEdit) {
      return <Button onClick={() => setConfirm("finalise")}><Lock /> Finalise minutes</Button>;
    }
    if (canReopen) {
      return <Button variant="outline" onClick={() => run(() => setMeetingStatus(meeting.id, "IN_PROGRESS"), "Minutes reopened")} loading={pending}><LockOpen /> Reopen</Button>;
    }
    return null;
  })();

  return (
    <>
      <article className="flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">{MEETING_TYPES[meeting.type].label}</p>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{meeting.title}</h1>
                <ToneBadge label={status.label} badge={status.badge} />
                {locked && meeting.status === "COMPLETED" && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="size-3" /> Locked record</span>
                )}
              </div>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-4" />{format(new Date(meeting.scheduledAt), "EEEE, d MMMM yyyy · HH:mm")}</span>
                {meeting.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{meeting.location}</span>}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              {statusButton}
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}><Share2 /> Share</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>For the team&apos;s WhatsApp group</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => copy(minutesAsText(meeting), "Minutes")}><MessageCircleMore /> Copy minutes</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copy(reminderAsText(meeting), "Reminder")}><ClipboardCopy /> Copy reminder for next review</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.print()}><Printer /> Print or save as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="More meeting actions" />}><MoreHorizontal /></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setFollowUpOpen(true)}><Repeat /> Schedule follow-up</DropdownMenuItem>
                  {canEdit && <DropdownMenuItem onClick={() => setEditingDetails(true)}><Pencil /> Edit details</DropdownMenuItem>}
                  {canEdit && meeting.status !== "CANCELLED" && (
                    <DropdownMenuItem onClick={() => run(() => setMeetingStatus(meeting.id, "CANCELLED"), "Meeting cancelled")}><UserX /> Cancel meeting</DropdownMenuItem>
                  )}
                  {meeting.createdById === currentUserId && meeting.status !== "COMPLETED" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setConfirm("delete")}><Trash2 /> Delete meeting</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
            {[
              { label: "Chair", value: meeting.chair ? <span className="flex items-center gap-2"><Avatar name={meeting.chair.name} image={meeting.chair.image} size="xs" />{meeting.chair.name}</span> : "—" },
              { label: "Next progress review", value: meeting.nextReviewAt ? format(new Date(meeting.nextReviewAt), "EEE d MMM · HH:mm") : "Not set" },
              { label: "Attendance", value: `${meeting.attendees.filter((a) => a.present).length} present of ${meeting.attendees.length}` },
              { label: "Recording", value: meeting.recordingUrl
                ? <a href={meeting.recordingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline"><Video className="size-4" /> Open recording <ExternalLink className="size-3" /></a>
                : <span className="text-muted-foreground">None attached</span> },
            ].map(({ label, value }) => (
              <div key={label} className="bg-card px-4 py-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          {meeting.purpose && (
            <p className="rounded-xl border-l-4 border-primary bg-accent/40 px-4 py-3 text-sm"><span className="font-semibold">Purpose: </span>{meeting.purpose}</p>
          )}
          {meeting.previous && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground print:hidden">
              <History className="size-4" /> Follows up
              <Link href={`/meetings/${meeting.previous.id}`} className="font-medium text-foreground hover:text-primary">{meeting.previous.title}</Link>
              of {format(new Date(meeting.previous.scheduledAt), "EEE d MMM")}
            </p>
          )}
        </header>

        <MeetingPulse meeting={meeting} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Minutes */}
          <div className="flex flex-col gap-6 xl:col-span-2">
            {sections.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><MessageCircleMore /></EmptyMedia>
                  <EmptyTitle>No minutes recorded yet</EmptyTitle>
                  <EmptyDescription>Add an item for each project or topic discussed, with its status and what must be reported next.</EmptyDescription>
                </EmptyHeader>
                {canEdit && <EmptyContent><Button onClick={() => { setNewItemKind("PROJECT_UPDATE"); setEditingItem(null); }}><Plus /> Add first item</Button></EmptyContent>}
              </Empty>
            ) : sections.map((section, s) => (
              <section key={section.kind} aria-labelledby={`section-${section.kind}`} className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 id={`section-${section.kind}`} className="text-base font-semibold">
                    <span className="text-muted-foreground tabular-nums">{s + 1}.</span> {section.title}
                  </h2>
                  {canEdit && (
                    <Button variant="ghost" size="sm" className="print:hidden" onClick={() => { setNewItemKind(section.kind); setEditingItem(null); }}><Plus /> Add</Button>
                  )}
                </div>
                <ol className="flex flex-col gap-3">
                  {section.items.map(({ item, number }) => (
                    <MinuteItem
                      key={item.id}
                      item={item}
                      number={number}
                      meetingId={meeting.id}
                      canEdit={canEdit}
                      pending={pending}
                      followUpLabel={followUpLabel}
                      expected={expectedFor(item)}
                      latest={item.projectId ? latestUpdates[item.projectId] : undefined}
                      defaultDue={toDateInput(meeting.nextReviewAt)}
                      onEdit={() => setEditingItem(item)}
                      onDelete={() => setRemovingItem(item)}
                      onMove={(dir) => run(() => moveMeetingItem(meeting.id, item.id, dir))}
                      onRaiseDecision={() => setDecisionFor({
                        title: item.title, context: [item.discussion, item.followUp].filter(Boolean).join("\n\n"),
                        projectId: item.projectId, meetingId: meeting.id, meetingItemId: item.id,
                      })}
                    />
                  ))}
                </ol>
              </section>
            ))}

            {canEdit && sections.length > 0 && (
              <div className="flex flex-wrap gap-2 print:hidden">
                {(["PROJECT_UPDATE", "DECISION", "RECOMMENDATION", "DISCUSSION"] as const).map((k) => (
                  <Button key={k} variant="outline" size="sm" onClick={() => { setNewItemKind(k); setEditingItem(null); }}>
                    <Plus /> {ITEM_KINDS[k].label}
                  </Button>
                ))}
              </div>
            )}

            <Card className="shadow-xs" data-print-avoid-break>
              <CardHeader>
                <CardTitle>Other actions</CardTitle>
                <CardDescription>Deliverables agreed in the meeting that aren&apos;t tied to one item.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ActionList actions={looseActions} showProject editable={canEdit} empty={<p className="text-sm text-muted-foreground">None.</p>} />
                {canEdit && <AddActionForm meetingId={meeting.id} defaultDue={toDateInput(meeting.nextReviewAt)} />}
              </CardContent>
            </Card>

            <SummaryCard meeting={meeting} canEdit={canEdit} />
          </div>

          {/* Side panel */}
          <aside className="flex flex-col gap-4">
            <AttendanceCard meeting={meeting} canEdit={canEdit} members={members} />

            <Card className="shadow-xs" data-print-avoid-break>
              <CardHeader>
                <CardTitle>Carried forward</CardTitle>
                <CardDescription>Still open from earlier meetings</CardDescription>
                <CardAction><span className="text-sm font-semibold tabular-nums">{carriedForward.length}</span></CardAction>
              </CardHeader>
              <CardContent>
                <ActionList actions={carriedForward} showSource empty={<p className="text-sm text-muted-foreground">Nothing outstanding. Every earlier action is closed.</p>} />
              </CardContent>
            </Card>

            <Card className="shadow-xs" data-print-avoid-break>
              <CardHeader>
                <CardTitle>Decisions raised</CardTitle>
                <CardDescription>Logged in the decision register</CardDescription>
                <CardAction>
                  <Button variant="ghost" size="icon-sm" className="print:hidden" aria-label="Raise a decision"
                    onClick={() => setDecisionFor({ meetingId: meeting.id })}><Plus /></Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                {meeting.decisions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No decisions raised in this meeting.</p>
                ) : (
                  <ul className="flex flex-col gap-2.5">
                    {meeting.decisions.map((d) => (
                      <li key={d.id}>
                        <Link href={`/decisions?open=${d.id}`} className="flex items-start gap-2.5 rounded-md text-sm hover:text-primary">
                          <Scale className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1">{d.title}</span>
                          <ToneBadge label={DECISION_STATUS[d.status].label} badge={DECISION_STATUS[d.status].badge} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {meeting.followUps.length > 0 && (
              <Card className="shadow-xs print:hidden">
                <CardHeader><CardTitle>Follow-up meetings</CardTitle></CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2">
                    {meeting.followUps.map((f) => (
                      <li key={f.id}>
                        <Link href={`/meetings/${f.id}`} className="flex items-center justify-between gap-2 text-sm hover:text-primary">
                          <span className="truncate">{f.title}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{format(new Date(f.scheduledAt), "EEE d MMM")}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <p className="px-1 text-xs text-muted-foreground">
              Recorded by {meeting.createdBy.name} · last changed {formatDistanceToNow(new Date(meeting.updatedAt), { addSuffix: true })}
              {meeting.completedAt && <> · finalised {format(new Date(meeting.completedAt), "d MMM yyyy, HH:mm")}</>}
            </p>
          </aside>
        </div>
      </article>

      <MeetingItemModal
        open={editingItem !== undefined}
        onClose={() => setEditingItem(undefined)}
        meetingId={meeting.id}
        projects={projects}
        followUpLabel={followUpLabel}
        item={editingItem}
        defaultKind={newItemKind}
      />
      <EditMeetingModal open={editingDetails} onClose={() => setEditingDetails(false)} meeting={meeting} />
      <NewMeetingModal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        defaults={{
          previous: { id: meeting.id, title: meeting.title },
          type: meeting.type === "WEEKLY_REVIEW" ? "MIDWEEK_CHECKIN" : meeting.type === "MIDWEEK_CHECKIN" ? "WEEKLY_REPORT" : meeting.type,
          scheduledAt: meeting.nextReviewAt ? new Date(meeting.nextReviewAt) : undefined,
        }}
      />
      <DecisionModal open={decisionFor !== null} onClose={() => setDecisionFor(null)} projects={projects} defaults={decisionFor ?? undefined} />
      <ConfirmDialog
        open={confirm === "finalise"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Finalise these minutes?"
        description={`The minutes become the locked company record. Actions stay live so owners can still close them. ${isLead ? "You" : "The chair"} can reopen the minutes if a correction is needed.`}
        confirmLabel="Finalise minutes"
        onConfirm={() => run(() => setMeetingStatus(meeting.id, "COMPLETED"), "Minutes finalised", () => setConfirm(null))}
        pending={pending}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Delete ${meeting.title}?`}
        description="Its agenda and minutes are removed. Actions raised in it are kept but no longer linked to a meeting."
        confirmLabel="Delete meeting"
        onConfirm={() => run(() => deleteMeeting(meeting.id), "Meeting deleted", () => router.push("/meetings"))}
        pending={pending}
      />
      <ConfirmDialog
        open={removingItem !== null}
        onOpenChange={(o) => !o && setRemovingItem(null)}
        title={`Remove "${removingItem?.title}"?`}
        description="The item is removed from the minutes. Its actions are kept in the tracker."
        confirmLabel="Remove item"
        onConfirm={() => removingItem && run(() => deleteMeetingItem(meeting.id, removingItem.id), "Item removed", () => setRemovingItem(null))}
        pending={pending}
      />
    </>
  );
}

// ── Pulse ─────────────────────────────────────────────────────

/** At-a-glance view: health of the agenda and who carries the actions. */
function MeetingPulse({ meeting }: { meeting: MeetingDetail }) {
  const allActions = [...meeting.actionItems];
  const done = allActions.filter((a) => a.status === "DONE").length;
  const needsDecision = meeting.items.filter((i) => i.kind === "DECISION" || i.kind === "RECOMMENDATION").length;
  const atRisk = meeting.items.filter((i) => i.health === "AT_RISK" || i.health === "OFF_TRACK" || i.health === "BLOCKED");

  const owners = new Map<string, { name: string | null; image: string | null; open: number; total: number }>();
  for (const a of allActions) {
    if (!a.owner) continue;
    const o = owners.get(a.owner.id) ?? { name: a.owner.name, image: a.owner.image, open: 0, total: 0 };
    o.total += 1;
    if (a.status !== "DONE" && a.status !== "CANCELLED") o.open += 1;
    owners.set(a.owner.id, o);
  }

  const figures = [
    { label: "Agenda items", value: meeting.items.length },
    { label: "Need attention", value: atRisk.length, danger: atRisk.length > 0 },
    { label: "Decisions & recommendations", value: needsDecision },
    { label: "Actions done", value: `${done}/${allActions.length}` },
  ];

  return (
    <section aria-label="Meeting at a glance" className="grid gap-4 rounded-xl border bg-card p-4 shadow-xs lg:grid-cols-[1.4fr_1fr]" data-print-avoid-break>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {figures.map((f) => (
            <div key={f.label}>
              <p className={cn("text-2xl font-semibold tabular-nums", f.danger && "text-destructive")}>{f.value}</p>
              <p className="text-xs text-muted-foreground">{f.label}</p>
            </div>
          ))}
        </div>
        <HealthBar values={meeting.items.map((i) => i.health)} showLegend />
      </div>
      <div className="flex flex-col gap-2 lg:border-l lg:pl-4">
        <p className="text-xs font-medium text-muted-foreground">Who carries the actions</p>
        {owners.size === 0 ? (
          <p className="text-sm text-muted-foreground">No actions assigned yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {[...owners.entries()].sort((a, b) => b[1].open - a[1].open).map(([id, o]) => (
              <li key={id} className="flex items-center gap-2 rounded-full border bg-background py-1 pr-3 pl-1">
                <Avatar name={o.name} image={o.image} size="xs" className="[&>div]:rounded-full" />
                <span className="text-xs font-medium">{o.name?.split(" ")[0]}</span>
                <span className={cn("text-xs tabular-nums", o.open ? "text-foreground" : "text-success")}>{o.open ? `${o.open} open` : <Check className="size-3.5" />}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ── Item ──────────────────────────────────────────────────────

interface ItemProps {
  item: Item;
  number: string;
  meetingId: string;
  canEdit: boolean;
  pending: boolean;
  followUpLabel: string;
  expected?: string;
  latest?: StatusUpdateWithRelations;
  defaultDue: string;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onRaiseDecision: () => void;
}

function MinuteItem({ item, number, meetingId, canEdit, pending, followUpLabel, expected, latest, defaultDue, onEdit, onDelete, onMove, onRaiseDecision }: ItemProps) {
  const [addingAction, setAddingAction] = useState(false);
  const accent = item.health ? HEALTH[item.health].color : "var(--border)";
  const canRaise = (item.kind === "DECISION" || item.kind === "RECOMMENDATION") && !item.decision;

  return (
    <li className="group/item relative overflow-hidden rounded-xl border bg-card shadow-xs" data-print-avoid-break>
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent }} aria-hidden />
      <div className="flex flex-col gap-3 p-4 pl-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums">{number}</span>
            <div className="min-w-0 space-y-1">
              <h3 className="font-semibold leading-snug">{item.title}</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <HealthBadge health={item.health} />
                {item.project && (
                  <Link href={`/projects/${item.project.id}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    <ProjectIcon icon={item.project.emoji} color={item.project.color} size="xs" />{item.project.name}
                  </Link>
                )}
                {item.owner && (
                  <span className="inline-flex items-center gap-1.5"><Avatar name={item.owner.name} image={item.owner.image} size="xs" />{item.owner.name}</span>
                )}
              </div>
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center gap-0.5 opacity-60 transition-opacity group-hover/item:opacity-100 focus-within:opacity-100 print:hidden">
              <Button variant="ghost" size="icon-xs" aria-label="Move up" disabled={pending} onClick={() => onMove(-1)}><ArrowUp /></Button>
              <Button variant="ghost" size="icon-xs" aria-label="Move down" disabled={pending} onClick={() => onMove(1)}><ArrowDown /></Button>
              <Button variant="ghost" size="icon-xs" aria-label={`Edit ${item.title}`} onClick={onEdit}><Pencil /></Button>
              <Button variant="ghost" size="icon-xs" aria-label={`Remove ${item.title}`} className="hover:text-destructive" onClick={onDelete}><Trash2 /></Button>
            </div>
          )}
        </div>

        {expected && (
          <div className="rounded-lg border border-dashed border-info/40 bg-info/5 px-3 py-2 text-sm">
            <p className="text-xs font-semibold text-info">Asked to report at this review</p>
            <p className="mt-0.5 whitespace-pre-wrap">{expected}</p>
          </div>
        )}

        {item.discussion && <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.discussion}</p>}

        {item.statusNote && (
          <p className="text-sm"><span className="font-semibold">Status: </span>{item.statusNote}</p>
        )}

        {latest && (
          <Tooltip>
            <TooltipTrigger render={<Link href={`/projects/${latest.projectId}?tab=updates`} className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground hover:bg-muted print:hidden" />}>
              <Clock className="mt-0.5 size-3.5 shrink-0" />
              <span className="min-w-0">
                <span className="font-medium text-foreground">Latest check-in</span> by {latest.author.name}, {formatDistanceToNow(new Date(latest.createdAt), { addSuffix: true })}
                {latest.nextAction && <> · Next: {latest.nextAction}</>}
              </span>
            </TooltipTrigger>
            <TooltipContent>Open the project&apos;s check-ins</TooltipContent>
          </Tooltip>
        )}

        {item.followUp && (
          <div className="rounded-lg bg-accent/50 px-3 py-2 text-sm">
            <p className="text-xs font-semibold text-accent-foreground">{followUpLabel}</p>
            <p className="mt-0.5 whitespace-pre-wrap">{item.followUp}</p>
          </div>
        )}

        {item.decision && (
          <Link href={`/decisions?open=${item.decision.id}`} className="inline-flex items-center gap-2 self-start rounded-md border px-2.5 py-1 text-xs hover:border-primary/40 hover:text-primary">
            <Scale className="size-3.5" /> In the decision register
            <ToneBadge label={DECISION_STATUS[item.decision.status].label} badge={DECISION_STATUS[item.decision.status].badge} />
          </Link>
        )}

        {(item.actionItems.length > 0 || canEdit) && (
          <div className="border-t pt-2">
            <ActionList actions={item.actionItems} editable={canEdit} />
            {canEdit && (addingAction ? (
              <div className="pt-2">
                <AddActionForm meetingId={meetingId} meetingItemId={item.id} projectId={item.projectId} defaultOwnerId={item.ownerId} defaultDue={defaultDue} />
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 pt-1 print:hidden">
                <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={() => setAddingAction(true)}><UserCheck /> Assign action</Button>
                {canRaise && <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={onRaiseDecision}><Scale /> Log as decision</Button>}
              </div>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

// ── Side cards ────────────────────────────────────────────────

function AttendanceCard({ meeting, canEdit, members }: { meeting: MeetingDetail; canEdit: boolean; members: { id: string; name: string | null; email: string; image: string | null }[] }) {
  const [pending, startTransition] = useTransition();
  const absentees = members.filter((m) => !meeting.attendees.some((a) => a.userId === m.id));

  function set(userId: string, present: boolean | null) {
    startTransition(async () => {
      const res = await setAttendance(meeting.id, userId, present);
      if (!res.success) toast.error(res.error);
    });
  }

  return (
    <Card className="shadow-xs" data-print-avoid-break>
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
        <CardDescription>{meeting.guests ? `Guests: ${meeting.guests}` : "Tap a name to mark them absent"}</CardDescription>
        {canEdit && absentees.length > 0 && (
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Add attendee" className="print:hidden" />}><UserPlus /></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {absentees.map((m) => <DropdownMenuItem key={m.id} onClick={() => set(m.id, true)}>{m.name ?? m.email}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1">
          {meeting.attendees.map((a) => (
            <li key={a.userId}>
              <button
                type="button"
                disabled={!canEdit || pending}
                onClick={() => set(a.userId, !a.present)}
                className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1 text-left text-sm enabled:hover:bg-muted disabled:cursor-default"
              >
                <Avatar name={a.user.name} image={a.user.image} size="xs" className={cn(!a.present && "opacity-40 grayscale")} />
                <span className={cn("min-w-0 flex-1 truncate", !a.present && "text-muted-foreground line-through")}>{a.user.name ?? a.user.email}</span>
                <span className={cn("text-xs", a.present ? "text-success" : "text-muted-foreground")}>{a.present ? "Present" : "Absent"}</span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SummaryCard({ meeting, canEdit }: { meeting: MeetingDetail; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("summary", String(new FormData(e.currentTarget).get("summary") ?? ""));
    startTransition(async () => {
      const res = await updateMeeting(meeting.id, fd);
      if (res.success) { toast.success("Summary saved"); setEditing(false); }
      else toast.error(res.error);
    });
  }

  if (!meeting.summary && !canEdit) return null;
  return (
    <Card className="shadow-xs" data-print-avoid-break>
      <CardHeader>
        <CardTitle>Summary and resolutions</CardTitle>
        <CardDescription>The closing word: what the meeting agreed overall.</CardDescription>
        {canEdit && !editing && (
          <CardAction><Button variant="ghost" size="sm" className="print:hidden" onClick={() => setEditing(true)}><Pencil /> {meeting.summary ? "Edit" : "Write"}</Button></CardAction>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea name="summary" defaultValue={meeting.summary ?? ""} rows={5} autoFocus aria-label="Summary"
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20" />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={pending}>Save summary</Button>
            </div>
          </form>
        ) : meeting.summary ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{meeting.summary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No summary yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
