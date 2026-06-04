import { redirect } from "next/navigation";
import { getUserProfile } from "./get-user-profile";
import type { Role } from "@/types/roles";

const statusRedirects = {
  pending: "/account/pending",
  invited: "/onboarding",
  blocked: "/account/blocked",
  disabled: "/account/disabled"
};

export async function requireRole(expectedRole: Role) {
  const { user, profile } = await getUserProfile();

  if (!user) {
    redirect("/login");
  }

  if (!profile) {
    redirect("/account/incomplete-profile");
  }

  if (profile.status !== "active") {
    redirect(statusRedirects[profile.status]);
  }

  if (profile.role !== expectedRole) {
    redirect("/access-denied");
  }

  return { user, profile };
}
