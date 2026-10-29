import { Metadata } from "next";
import { getMeetings } from "@/lib/actions/meetings";
import { getActionItems } from "@/lib/actions/action-items";
import MeetingsClient from "@/components/meetings/MeetingsClient";

export const metadata: Metadata = { title: "Meetings" };

export default async function MeetingsPage() {
  const [meetings, actions] = await Promise.all([getMeetings(), getActionItems()]);
  return <MeetingsClient meetings={meetings} actions={actions} />;
}
