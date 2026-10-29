import { format } from "date-fns";
import type { MeetingDetail } from "@/lib/business-queries";
import { HEALTH, ITEM_KINDS, ITEM_KIND_ORDER, MEETING_TYPES, UPDATE_FIELDS } from "@/lib/business";

// Plain-text renderings of a meeting for pasting into WhatsApp, which uses
// *bold* and _italic_ markers.

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const day = (d: Date | string) => format(new Date(d), "EEEE, d MMMM yyyy");
const short = (d: Date | string) => format(new Date(d), "EEE d MMM");

function nextReviewLabel(meeting: MeetingDetail) {
  return meeting.nextReviewAt ? `${format(new Date(meeting.nextReviewAt), "EEEE")} update` : "Next update";
}

/** Items grouped into the minutes' sections, with the numbering shown on screen. */
export function groupMinutes(items: MeetingDetail["items"]) {
  return ITEM_KIND_ORDER
    .map((kind) => {
      const list = items.filter((i) => i.kind === kind);
      // Recommendations are lettered, as in the paper minutes; everything else is numbered.
      const label = (index: number) => (kind === "RECOMMENDATION" ? LETTERS[index] ?? String(index + 1) : String(index + 1));
      return { kind, title: ITEM_KINDS[kind].section, items: list.map((item, i) => ({ item, number: label(i) })) };
    })
    .filter((s) => s.items.length > 0);
}

export function minutesAsText(meeting: MeetingDetail): string {
  const lines: string[] = [];
  lines.push(`*Minutes of the ${meeting.title}*`, "");
  lines.push(`Meeting date: ${day(meeting.scheduledAt)}`);
  if (meeting.nextReviewAt) lines.push(`Next progress review: ${day(meeting.nextReviewAt)}`);
  if (meeting.chair?.name) lines.push(`Chair: ${meeting.chair.name}`);
  const present = meeting.attendees.filter((a) => a.present).map((a) => a.user.name ?? a.user.email);
  if (present.length) lines.push(`Present: ${present.join(", ")}${meeting.guests ? `, ${meeting.guests}` : ""}`);
  if (meeting.purpose) lines.push(`Purpose: ${meeting.purpose}`);

  groupMinutes(meeting.items).forEach((section, s) => {
    lines.push("", `*${s + 1}. ${section.title}*`);
    for (const { item, number } of section.items) {
      const status = item.health ? ` — ${HEALTH[item.health].label}` : "";
      lines.push("", `*${number}. ${item.title}${status}*`);
      if (item.discussion) lines.push(item.discussion);
      if (item.statusNote) lines.push(`_Status:_ ${item.statusNote}`);
      if (item.owner?.name) lines.push(`_Owner:_ ${item.owner.name}`);
      if (item.followUp) lines.push(`_${nextReviewLabel(meeting)}:_ ${item.followUp}`);
      for (const a of item.actionItems) {
        const due = a.dueDate ? ` (due ${short(a.dueDate)})` : "";
        lines.push(`• ${a.title}${a.owner?.name ? ` — ${a.owner.name}` : ""}${due}${a.status === "DONE" ? " ✅" : ""}`);
      }
    }
  });

  const loose = meeting.actionItems.filter((a) => !a.meetingItemId);
  if (loose.length) {
    lines.push("", "*Other actions*");
    for (const a of loose) lines.push(`• ${a.title}${a.owner?.name ? ` — ${a.owner.name}` : ""}${a.dueDate ? ` (due ${short(a.dueDate)})` : ""}`);
  }
  if (meeting.summary) lines.push("", "*Summary*", meeting.summary);
  return lines.join("\n");
}

/** Reminder for the next review, listing what each owner has to report. */
export function reminderAsText(meeting: MeetingDetail): string {
  const when = meeting.nextReviewAt ?? meeting.scheduledAt;
  const type = meeting.nextReviewAt ? "progress review" : MEETING_TYPES[meeting.type].label.toLowerCase();
  const lines = [
    `*REMINDER: TECHVAULTS ${format(new Date(when), "EEEE").toUpperCase()} ${type.toUpperCase()}*`,
    "",
    "Good morning, team.",
    "",
    `This is a reminder of our ${type} on ${day(when)}, following up on the ${meeting.title}.`,
    "",
    "Everyone responsible for a project or task should report:",
    ...UPDATE_FIELDS.map((f) => `• *${f.label}:* ${f.hint}.`),
    "• *Deadline:* when the next action will be complete.",
  ];

  const asks = meeting.items.filter((i) => i.followUp);
  if (asks.length) {
    lines.push("", "*Expected updates*");
    for (const i of asks) lines.push(`• *${i.title}*${i.owner?.name ? ` (${i.owner.name})` : ""}: ${i.followUp}`);
  }
  lines.push("", "Please post your update on the platform before the meeting so we can identify delays early and keep every project moving.", "", "Thank you.");
  return lines.join("\n");
}
