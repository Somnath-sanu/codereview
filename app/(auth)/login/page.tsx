import { LoginPage } from "@/features/auth/components/login-ui";
import { requireUnAuth } from "@/features/auth/utils/auth-utils";


const Page = async () => {
  await requireUnAuth();
  
  return <LoginPage/>
}

export default Page;