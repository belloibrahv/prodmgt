"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { ActionResult } from "@/types";

// --- Update User Profile ---
const profileSchema = z.object({
  name: z.string().min(1).max(100),
  jobTitle: z.string().max(100).optional(),
});

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      jobTitle: parsed.data.jobTitle || null,
    },
  });

  revalidatePath("/settings");
  return { success: true, data: null };
}

// --- Update Notification Preferences ---
const notificationsSchema = z.object({
  taskAssigned: z.string().optional(),
  taskDue: z.string().optional(),
  projectUpdates: z.string().optional(),
  teamMessages: z.string().optional(),
  weeklyDigest: z.string().optional(),
  emailNotifs: z.string().optional(),
});

export async function updateNotificationPrefs(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = notificationsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  const prefs = {
    taskAssigned: !!parsed.data.taskAssigned,
    taskDue: !!parsed.data.taskDue,
    projectUpdates: !!parsed.data.projectUpdates,
    teamMessages: !!parsed.data.teamMessages,
    weeklyDigest: !!parsed.data.weeklyDigest,
    emailNotifs: !!parsed.data.emailNotifs,
  };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { notificationPrefs: prefs as unknown as any }, // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  revalidatePath("/settings");
  return { success: true, data: null };
}

// --- Change Password ---
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { success: false, error: "User not found" };
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hashedPassword },
  });

  revalidatePath("/settings");
  return { success: true, data: null };
}

// --- Update Appearance Preferences ---
const appearanceSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function updateAppearance(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = appearanceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
        appearancePrefs: {
          theme: parsed.data.theme,
          accentColor: parsed.data.accentColor,
        } as unknown as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
  });

  revalidatePath("/settings");
  return { success: true, data: null };
}
