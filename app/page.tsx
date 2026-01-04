import { requireAuth } from "@/features/auth/utils/auth-utils";
import { redirect } from "next/navigation";

export default async function Home() {
  await requireAuth();
  
  redirect("/dashboard/repo");
}
