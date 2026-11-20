import { auth } from "@/auth";

export async function getAuthenticatedUser() {
  const session = await auth();
  const sessionUser = session?.user;
  const email = sessionUser?.email?.trim().toLowerCase();

  if (!email) {
    return null;
  }

  return {
    id: sessionUser?.id || "",
    email,
    name: sessionUser?.name?.trim() || "Explorer",
    image: sessionUser?.image || "",
  };
}
