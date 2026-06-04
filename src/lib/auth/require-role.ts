import { redirect } from "next/navigation";
import { getUserProfile } from "./get-user-profile";
import type { Role } from "@/types/roles";

export async function requireRole(expectedRole: Role) {
  const { user, profile } = await getUserProfile();

  if (!user) {
    redirect("/login");
  }

  if (!profile || profile.role !== expectedRole) {
    redirect("/access-denied");
  }

  return { user, profile };
}
