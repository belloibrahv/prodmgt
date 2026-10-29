import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMeeting } from "@/lib/actions/meetings";
import { getCarriedForwardActions } from "@/lib/actions/action-items";
import { getProjectOptions } from "@/lib/actions/projects";
import { getLatestUpdatesByProject } from "@/lib/actions/status-updates";
import MeetingDetailClient from "@/components/meetings/MeetingDetailClient";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const meeting = await getMeeting(id);
  return { title: meeting?.title ?? "Meeting" };
}

export default async function MeetingPage({ params }: Props) {
  const { id } = await params;
  const meeting = await getMeeting(id);
  if (!meeting) notFound();

  const projectIds = meeting.items.map((i) => i.projectId).filter((p): p is string => Boolean(p));
  const [projects, carriedForward, latestUpdates] = await Promise.all([
    getProjectOptions(),
    getCarriedForwardActions(meeting.id, meeting.scheduledAt),
    getLatestUpdatesByProject(projectIds),
  ]);

  return <MeetingDetailClient meeting={meeting} projects={projects} carriedForward={carriedForward} latestUpdates={latestUpdates} />;
}
