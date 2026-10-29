import { Metadata } from "next";
import { Suspense } from "react";
import { getDecisions } from "@/lib/actions/decisions";
import { getProjectOptions } from "@/lib/actions/projects";
import DecisionsClient from "@/components/decisions/DecisionsClient";

export const metadata: Metadata = { title: "Decisions" };

export default async function DecisionsPage() {
  const [decisions, projects] = await Promise.all([getDecisions(), getProjectOptions()]);
  return (
    <Suspense>
      <DecisionsClient decisions={decisions} projects={projects} />
    </Suspense>
  );
}
