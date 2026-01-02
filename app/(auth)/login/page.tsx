import { LoginPage } from "@/modules/auth/components/login-ui";
import { requireUnAuth } from "@/modules/auth/utils/auth-utils";


const Page = async () => {
  await requireUnAuth();
  
  return <LoginPage/>
}

export default Page;