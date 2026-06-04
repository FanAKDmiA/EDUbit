import { redirect } from "next/navigation";
import { getUserProfile } from "./get-user-profile";

export async function requireUser() {
  const { user, profile } = await getUserProfile();

  if (!user) {
    redirect("/login");
  }

  return { user, profile };
}
