import { requireAuth } from "@/modules/auth/utils/auth-utils";
import Image from "next/image";

export default async function Home() {
  await requireAuth();
  
  return (
    <div>
      CodeRabbit Yooo!
    </div>
  );
}
